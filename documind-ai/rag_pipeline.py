import re
from pathlib import Path
from typing import Iterable, List, Tuple
from langchain_community.document_loaders import PyPDFLoader
from langchain_community.vectorstores import FAISS
from langchain_core.documents import Document
from langchain_core.prompts import PromptTemplate
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_ollama import OllamaLLM
from langchain_text_splitters import RecursiveCharacterTextSplitter

EMBEDDING_MODEL = "all-MiniLM-L6-v2"
DEFAULT_OLLAMA_MODEL = "qwen2.5:0.5b"

RAG_PROMPT = """You are DocuMind AI (named Nifty), a friendly and highly capable local document intelligence assistant.
Use ONLY the following retrieved document context to answer the user's question accurately.
If the user asks for a summary, main theme, overview, or key takeaways, provide a clear, structured summary using bullet points.
If the answer cannot be found in the context and it is a specific fact question, state: "I could not find the answer in the provided documents."

Retrieved Document Context:
{context}

Previous Conversation:
{conversation}

User Question:
{question}

Detailed Answer:"""

GREETING_RESPONSE = (
    "👋 Hello! I am **Nifty**, your DocuMind document intelligence assistant.\n\n"
    "Here is how I can help you with your uploaded documents:\n"
    "- 📄 **Summarize & Extract Themes**: Ask me for main takeaways, key themes, or section overviews.\n"
    "- 🔍 **Fact Search**: Ask specific questions about dates, names, numbers, or details in your PDFs.\n"
    "- 🎯 **Page Citations**: I will show exact page source citations for every answer!"
)

LIMITATIONS_ANSWER = (
    "📄 **DocuMind AI Limitations:**\n\n"
    "- Runs 100% locally using FAISS vector store, Hugging Face embeddings (`all-MiniLM-L6-v2`), and Ollama LLM.\n"
    "- Answers are strictly grounded in text extracted from your uploaded PDFs.\n"
    "- Performance depends on PDF text legibility and your local Ollama model capabilities."
)
CLARIFICATION_ANSWER = "Could you please clarify your question or specify what information you are searching for in your uploaded documents?"
NOT_FOUND = "I could not find the answer in the provided documents."

GREETING_TERMS = {"hi", "hello", "hey", "greetings", "help", "who", "yourself"}
OVERVIEW_TERMS = {"theme", "summary", "summarize", "overview", "main", "points", "takeaway", "takeaways", "about", "content", "topic", "topics"}
FOLLOW_UP_TERMS = {"it", "he", "she", "this", "that", "they", "them", "his", "her", "their", "its", "former", "latter"}


def _normalized_words(text: str) -> set[str]:
    return set(re.findall(r"\b[a-z0-9]+\b", text.lower()))


def _meaningful_words(text: str) -> set[str]:
    stopwords = {
        "the", "a", "an", "is", "are", "was", "were", "what", "who", "where",
        "when", "how", "why", "in", "on", "at", "to", "for", "of", "with",
        "and", "or", "about", "tell", "me", "show", "can", "you", "please", "file", "document"
    }
    return _normalized_words(text) - stopwords


def _is_greeting_or_help(question: str) -> bool:
    words = _normalized_words(question)
    if words.intersection({"hi", "hello", "hey"}):
        return True
    if "help" in words and words.intersection({"can", "how", "you"}):
        return True
    if "who" in words and words.intersection({"are", "you"}):
        return True
    return False


def _is_overview_or_theme_question(question: str) -> bool:
    words = _normalized_words(question)
    return bool(words.intersection(OVERVIEW_TERMS))


def _is_limitations_question(question: str) -> bool:
    words = _normalized_words(question)
    asks_about_assistant = bool(words.intersection({"your", "you", "documind", "assistant"}))
    asks_about_limits = bool(words.intersection({"limitation", "limitations", "limit", "capable", "capabilities"}))
    return asks_about_assistant and asks_about_limits


def _is_unclear_question(question: str) -> bool:
    words = _normalized_words(question)
    malformed = "f**" in question.lower() or words.intersection({"f", "fu", "wtf"})
    return len(words) < 2 and not _is_greeting_or_help(question) or malformed


def _is_follow_up(question: str) -> bool:
    return bool(_normalized_words(question).intersection(FOLLOW_UP_TERMS))


def _has_question_evidence(question: str, documents: List[Document]) -> bool:
    if _is_overview_or_theme_question(question):
        return True

    question_words = _meaningful_words(question)
    if not question_words:
        return True

    context_words = _normalized_words(
        " ".join(
            f'{doc.page_content} {doc.metadata.get("source", "")}'
            for doc in documents
        )
    )

    if question_words.intersection(context_words):
        return True

    if "name" in question_words or "who" in _normalized_words(question):
        has_capitalized_name = any(
            re.search(r"\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)+\b", doc.page_content)
            for doc in documents
        )
        if has_capitalized_name:
            return True

    if "company" in question_words or "organization" in question_words:
        ignored_words = {"document", "pdf", "file", "page", "text"}
        for doc in documents:
            source_words = _normalized_words(str(doc.metadata.get("source", "")))
            if source_words - ignored_words:
                return True

    return False


def _retrieve_documents(vector_store: FAISS, question: str) -> List[Document]:
    """Retrieve top relevant document chunks using FAISS similarity search."""
    search_query = "summary main points key findings overview background" if _is_overview_or_theme_question(question) else question
    semantic = vector_store.similarity_search(search_query, k=5)
    documents = list(semantic)

    question_words = _meaningful_words(question)
    for document in vector_store.docstore._dict.values():
        content_words = _normalized_words(document.page_content)
        overlap = question_words.intersection(content_words)
        exact_entity_match = len(question_words) >= 3 and len(overlap) >= len(question_words) * 0.65
        if exact_entity_match:
            if document not in documents:
                documents.insert(0, document)

    return documents[:5]


def load_pdfs(pdf_paths: Iterable[Path]) -> List[Document]:
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


def split_documents(documents: List[Document]) -> List[Document]:
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
    model_name: str = DEFAULT_OLLAMA_MODEL
) -> Tuple[str, List[str]]:
    question = question.strip()

    if not question:
        raise ValueError("Please enter a question.")

    if _is_greeting_or_help(question):
        return GREETING_RESPONSE, []

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

    if not _has_question_evidence(retrieval_question, retrieved):
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
        conversation=(conversation if _is_follow_up(question) else "No previous conversation.")
    )

    try:
        llm = OllamaLLM(model=model_name, temperature=0.2)
        answer = llm.invoke(final_prompt)
    except Exception as exc:
        raise RuntimeError(
            f"Ollama could not be reached on model '{model_name}'. "
            f"Ensure Ollama service is active. Error: {exc}"
        ) from exc

    unique_sources = []
    for document in retrieved:
        label = _source_label(document)
        if label not in unique_sources:
            unique_sources.append(label)

    return str(answer).strip(), unique_sources
