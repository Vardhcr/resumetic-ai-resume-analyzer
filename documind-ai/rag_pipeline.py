import concurrent.futures
import os
from pathlib import Path
import re
from typing import Iterable

from langchain_community.document_loaders import PyPDFLoader
from langchain_community.vectorstores import FAISS
from langchain_core.documents import Document
from langchain_core.prompts import PromptTemplate
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_ollama import OllamaLLM
from langchain_text_splitters import RecursiveCharacterTextSplitter



EMBEDDING_MODEL = "sentence-transformers/all-MiniLM-L6-v2"
OLLAMA_MODEL = "qwen2.5:0.5b"
OLLAMA_TIMEOUT_SECONDS = 60

# --------------------------------------------------------------------------
# LLM backend — single-credential design
#
# Local development needs ZERO credentials: Ollama runs on localhost and the
# embeddings model runs on CPU, no API key required for either.
#
# Cloud deployment (e.g. Streamlit Cloud) can't reach localhost:11434, so a
# hosted model is needed there. Rather than juggling several services, this
# app supports exactly ONE optional credential — a Groq API key — read from
# st.secrets or the environment, never hardcoded. If it isn't set, the app
# just uses local Ollama and behaves exactly as before.
#
# Groq's free tier is used because it needs nothing but a single API key
# (no billing setup, no cloud project, no service account) and is fast/cheap
# enough for a small college project.
#
# IMPORTANT: this makes exactly ONE model call per question/quiz — no
# separate "connectivity check" call — and it's wrapped in a hard timeout so
# a stuck/slow Ollama fails with a clear error instead of spinning forever.
# --------------------------------------------------------------------------

GROQ_MODEL = "llama-3.1-8b-instant"


def _get_groq_api_key() -> str | None:
    """Look for a Groq key without ever hardcoding one.

    Checked in order: Streamlit secrets, then the GROQ_API_KEY env var.
    Returns None if neither is set, which means "stay fully local."
    """
    try:
        import streamlit as st
        if "GROQ_API_KEY" in st.secrets:
            return str(st.secrets["GROQ_API_KEY"])
    except Exception:
        pass

    return os.environ.get("GROQ_API_KEY")


def _invoke_with_timeout(fn, timeout: float):
    """Run fn() in a worker thread and raise TimeoutError if it takes too long.

    A slow or stuck local Ollama server would otherwise hang the app
    indefinitely, since the underlying HTTP client has no timeout of its own.
    """
    with concurrent.futures.ThreadPoolExecutor(max_workers=1) as executor:
        future = executor.submit(fn)
        return future.result(timeout=timeout)


def _invoke_llm(prompt: str, temperature: float = 0) -> str:
    """Get a response with the smallest possible credential surface and a
    single model call.

    Tries local Ollama first (no credential needed, hard timeout so it can't
    hang forever). Only if that fails does it fall back to the single
    optional hosted key above — and only if that key is actually configured.
    """
    try:
        ollama_llm = OllamaLLM(model=OLLAMA_MODEL, temperature=temperature)
        result = _invoke_with_timeout(
            lambda: ollama_llm.invoke(prompt), timeout=OLLAMA_TIMEOUT_SECONDS
        )
        return result.content if hasattr(result, "content") else str(result)
    except Exception as ollama_exc:
        is_timeout = isinstance(ollama_exc, concurrent.futures.TimeoutError)
        api_key = _get_groq_api_key()

        if not api_key:
            if is_timeout:
                raise RuntimeError(
                    f"Ollama did not respond within {OLLAMA_TIMEOUT_SECONDS}s. "
                    "It may be stuck on a previous request — try restarting "
                    "Ollama (close it and run 'ollama serve' again), or set a "
                    "GROQ_API_KEY secret to use a hosted fallback instead."
                ) from ollama_exc
            raise RuntimeError(
                "Ollama could not be reached. Make sure Ollama is running and "
                f"the '{OLLAMA_MODEL}' model is installed, or set a "
                "GROQ_API_KEY secret to use a hosted fallback. Original "
                f"error: {ollama_exc}"
            ) from ollama_exc

        try:
            from langchain_groq import ChatGroq
        except ImportError as import_exc:
            raise RuntimeError(
                "GROQ_API_KEY is set but the 'langchain-groq' package is not "
                "installed. Add it to requirements.txt."
            ) from import_exc

        groq_llm = ChatGroq(model=GROQ_MODEL, temperature=temperature, api_key=api_key)
        result = groq_llm.invoke(prompt)
        return result.content if hasattr(result, "content") else str(result)

RAG_PROMPT = """You are DocuMind AI, a careful document question-answering assistant.

Answer the user's question using ONLY the provided document context.

Always answer in clear English.

Do not use outside knowledge.
Do not invent facts.

Match names, phrases, and entities exactly when they appear in the context.
Do not confuse a degree, job title, or department with an institution name.
When the user asks you to reverify or refers to "it", use the recent conversation
to resolve the reference, then check the document context again.
If the context contains the requested wording, quote that wording in your answer.

If the answer cannot be found in the provided context, say:
"I could not find this information in the uploaded documents."

Answer directly and briefly:
- Default to 1-3 sentences.
- Only use a list if the question explicitly asks for multiple items or steps.
- Do not restate the question, describe your process, or pad the answer with
  extra context the user didn't ask for.
- Do not mention "excerpts", "documents", or your retrieval process unless
  the user specifically asks where the information came from.

Context:
{context}

Question:
{question}

Recent conversation:
{conversation}

Answer:
"""

QUIZ_PROMPT = """You are DocuMind AI, generating a short multiple-choice quiz.

Use ONLY the material in the context below. Do not use outside knowledge.
Write {num_questions} multiple-choice questions that test understanding of
the context. Each question must have exactly 4 options and only one correct
answer.

Follow this EXACT format for every question, with nothing before or after it.
Do not number the questions yourself. Separate questions with a line
containing only ---.

Q: <question text>
A) <option>
B) <option>
C) <option>
D) <option>
ANSWER: <one letter, A B C or D>
EXPLANATION: <one short sentence, grounded in the context>
---

Context:
{context}

Quiz:
"""

NOT_FOUND = "I could not find this information in the uploaded documents."
LIMITATIONS_ANSWER = (
    "I can answer questions only from the uploaded documents. I do not browse "
    "the web, remember information after the session, or replace expert advice."
)
CLARIFICATION_ANSWER = (
    "I’m ready to help with your documents. Please ask a clear question about "
    "the uploaded content."
)
STOPWORDS = {
    "a", "about", "and", "are", "at", "can", "did", "do", "does", "for",
    "has", "have", "how", "in", "is", "it", "me", "of", "on", "or", "please",
    "pdf", "the", "then", "this", "to", "was", "what", "where", "which", "who",
    "why", "you",
}
FOLLOW_UP_TERMS = {"again", "recheck", "reverify", "verify", "that", "it", "this"}


def _normalized_words(value: str) -> set[str]:
    return set(re.findall(r"[a-z0-9]+", value.lower()))


def _meaningful_words(value: str) -> set[str]:
    return _normalized_words(value) - STOPWORDS


def _is_limitations_question(question: str) -> bool:
    words = _normalized_words(question)
    asks_about_assistant = bool(words.intersection({"your", "you"}))
    asks_about_limits = bool(words.intersection({"limitation", "limitations", "limit"}))
    return asks_about_assistant and asks_about_limits


def _is_unclear_question(question: str) -> bool:
    words = _normalized_words(question)
    malformed_fragment = "f**" in question.lower() or words.intersection({"f", "fu", "wtf"})
    return len(words) < 2 or not _meaningful_words(question) or malformed_fragment


def _is_follow_up(question: str) -> bool:
    return bool(_normalized_words(question).intersection(FOLLOW_UP_TERMS))


def _has_question_evidence(question: str, documents: list[Document]) -> bool:
    question_words = _meaningful_words(question)
    if not question_words:
        return False

    context_words = _normalized_words(
        " ".join(
            f'{document.page_content} {document.metadata.get("source", "")}'
            for document in documents
        )
    )
    if question_words.intersection(context_words):
        return True

    # Names are usually presented as labels or headings, so the word "name"
    # itself may not occur next to the person's actual name.
    if "name" in question_words:
        has_capitalized_name = any(
            re.search(r"\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)+\b", document.page_content)
            for document in documents
        )
        if has_capitalized_name:
            return True

    # A resume filename can identify the company even when the page text does not.
    if "company" in question_words:
        ignored_filename_words = {"resume", "cv", "document", "pdf"}
        for document in documents:
            source_words = _normalized_words(str(document.metadata.get("source", "")))
            if source_words - ignored_filename_words:
                return True

    return False


def _retrieve_documents(vector_store: FAISS, question: str) -> list[Document]:
    """Combine semantic retrieval with exact lexical matches for named entities."""
    semantic = vector_store.similarity_search(question, k=4)
    documents = list(semantic)
    question_words = _meaningful_words(question)

    # FAISS keeps the original chunks in its docstore. Exact terms must be
    # considered because embeddings can rank a related chunk above a named entity.
    for document in vector_store.docstore._dict.values():
        content_words = _normalized_words(document.page_content)
        overlap = question_words.intersection(content_words)
        exact_entity_match = len(question_words) >= 3 and len(overlap) >= len(question_words) * 0.65
        if exact_entity_match:
            if document not in documents:
                documents.insert(0, document)

    return documents[:4]

def load_pdfs(pdf_paths: Iterable[Path]) -> list[Document]:
    documents = []

    for pdf_path in pdf_paths:
        loader = PyPDFLoader(str(pdf_path))
        loaded = loader.load()

        for doc in loaded:
            doc.metadata["source"] = pdf_path.name

        documents.extend(loaded)

    if not documents:
        raise ValueError("The uploaded PDF files contain no readable text.")

    return documents


def split_documents(documents: list[Document]) -> list[Document]:
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000,
        chunk_overlap=150,
    )
    chunks = splitter.split_documents(documents)

    if not chunks:
        raise ValueError("No text chunks could be created from the documents.")

    return chunks


def get_embeddings() -> HuggingFaceEmbeddings:
    return HuggingFaceEmbeddings(
        model_name=EMBEDDING_MODEL,
        model_kwargs={"device": "cpu"},
        encode_kwargs={"normalize_embeddings": True},
    )


def build_vector_store(pdf_paths: Iterable[Path]) -> FAISS:
    paths = list(pdf_paths)

    if not paths:
        raise ValueError("No PDF files were provided.")

    documents = load_pdfs(paths)
    chunks = split_documents(documents)

    embeddings = get_embeddings()
    return FAISS.from_documents(chunks, embeddings)


def _source_label(document: Document) -> str:
    source = document.metadata.get("source", "Unknown document")
    page = document.metadata.get("page")

    if page is not None:
        return f"{source} — page {int(page) + 1}"

    return str(source)


def answer_question(
    vector_store: FAISS,
    question: str,
    conversation: str = "",
) -> tuple[str, list[str]]:
    question = question.strip()

    if not question:
        raise ValueError("Please enter a question.")

    if _is_limitations_question(question):
        return LIMITATIONS_ANSWER, []

    if _is_unclear_question(question):
        return CLARIFICATION_ANSWER, []

    retrieval_question = question
    if len(_meaningful_words(question)) < 3 and conversation and _is_follow_up(question):
        retrieval_question = conversation
    retrieved = _retrieve_documents(vector_store, retrieval_question)

    if not retrieved:
        return (NOT_FOUND, [])

    evidence_question = retrieval_question
    if not _has_question_evidence(evidence_question, retrieved):
        return (NOT_FOUND, [])

    context_parts = []
    for index, document in enumerate(retrieved, start=1):
        context_parts.append(
            f"[Document {index}]\n"
            f"Source: {_source_label(document)}\n"
            f"Content:\n{document.page_content}"
        )

    context = "\n\n".join(context_parts)

    prompt = PromptTemplate.from_template(RAG_PROMPT)
    final_prompt = prompt.format(
        context=context,
        question=question,
        conversation=(conversation if _is_follow_up(question) else "No previous conversation."),
    )

    answer = _invoke_llm(final_prompt, temperature=0)

    unique_sources = []
    for document in retrieved:
        label = _source_label(document)
        if label not in unique_sources:
            unique_sources.append(label)

    return str(answer).strip(), unique_sources


# --------------------------------------------------------------------------
# Quiz generation
#
# Reuses the same local FAISS index and the same small Ollama model that
# already power Q&A, so quizzes cost nothing extra to run and stay fully
# offline. A 0.5b model can't be trusted to always follow instructions
# perfectly, so the parser below is deliberately forgiving: it recovers
# whatever well-formed questions it can and silently drops malformed ones,
# instead of failing the whole quiz over one bad block.
# --------------------------------------------------------------------------

MAX_QUIZ_CONTEXT_CHUNKS = 6
MAX_QUIZ_CHUNK_CHARS = 700

_QUIZ_QUESTION_RE = re.compile(
    r"Q:\s*(?P<question>.+?)\s*"
    r"A\)\s*(?P<a>.+?)\s*"
    r"B\)\s*(?P<b>.+?)\s*"
    r"C\)\s*(?P<c>.+?)\s*"
    r"D\)\s*(?P<d>.+?)\s*"
    r"ANSWER:\s*(?P<answer>[ABCD])\b.*?"
    r"(?:EXPLANATION:\s*(?P<explanation>.+?))?\s*(?=(?:Q:)|\Z)",
    re.DOTALL | re.IGNORECASE,
)


def _sample_chunks_for_quiz(vector_store: FAISS, max_chunks: int) -> list[Document]:
    """Pick a spread of chunks across the whole document instead of just the
    first few, so the quiz isn't biased toward the start of the file."""
    all_chunks = list(vector_store.docstore._dict.values())

    if not all_chunks:
        return []

    if len(all_chunks) <= max_chunks:
        return all_chunks

    step = len(all_chunks) / max_chunks
    indices = sorted({int(i * step) for i in range(max_chunks)})
    return [all_chunks[i] for i in indices]


def _build_quiz_context(chunks: list[Document]) -> str:
    parts = []
    for chunk in chunks:
        text = chunk.page_content.strip().replace("\n", " ")
        if len(text) > MAX_QUIZ_CHUNK_CHARS:
            text = text[:MAX_QUIZ_CHUNK_CHARS] + "..."
        parts.append(f"Source: {_source_label(chunk)}\n{text}")
    return "\n\n".join(parts)


def _parse_quiz_response(raw_text: str) -> list[dict]:
    questions = []

    for match in _QUIZ_QUESTION_RE.finditer(raw_text):
        question = match.group("question").strip()
        options = [
            match.group("a").strip(),
            match.group("b").strip(),
            match.group("c").strip(),
            match.group("d").strip(),
        ]
        answer_letter = match.group("answer").strip().upper()
        explanation = (match.group("explanation") or "").strip()

        if not question or any(not option for option in options):
            continue
        if answer_letter not in "ABCD":
            continue

        questions.append(
            {
                "question": question,
                "options": options,
                "answer_index": "ABCD".index(answer_letter),
                "explanation": explanation,
            }
        )

    return questions


def generate_quiz(vector_store: FAISS, num_questions: int = 5) -> list[dict]:
    """Generate a multiple-choice quiz grounded in the indexed documents.

    Returns a list of dicts shaped like:
        {"question": str, "options": [str, str, str, str],
         "answer_index": int, "explanation": str}

    Raises RuntimeError if Ollama can't be reached, and ValueError if the
    index is empty or the model didn't return any usable questions.
    """
    if num_questions < 1:
        raise ValueError("num_questions must be at least 1.")

    chunks = _sample_chunks_for_quiz(vector_store, MAX_QUIZ_CONTEXT_CHUNKS)
    if not chunks:
        raise ValueError("The index is empty, so a quiz cannot be generated.")

    context = _build_quiz_context(chunks)
    prompt = PromptTemplate.from_template(QUIZ_PROMPT)
    final_prompt = prompt.format(context=context, num_questions=num_questions)

    raw_response = _invoke_llm(final_prompt, temperature=0.4)

    questions = _parse_quiz_response(str(raw_response))[:num_questions]

    if not questions:
        raise ValueError(
            "The model did not return a usable quiz. Try again, or with a "
            "larger Ollama model if this keeps happening."
        )

    return questions