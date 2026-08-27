# DocuMind AI

**Local RAG-Based Document Q&A Assistant**

DocuMind AI is a small college mini project that demonstrates Retrieval-Augmented Generation (RAG) without AWS, paid APIs, or cloud credentials.

## Architecture

```text
PDF
 ↓
PyPDFLoader
 ↓
Text Chunking
 ↓
Hugging Face Embeddings
 ↓
FAISS Vector Store
 ↓
User Question
 ↓
Similarity Search
 ↓
Relevant Chunks
 ↓
Ollama / Llama 3.2
 ↓
Grounded Answer + Sources
```

## Technology Stack

- Python
- Streamlit
- LangChain
- PyPDF
- Hugging Face Sentence Transformers
- FAISS
- Ollama
- Llama 3.2

## Why RAG?

Instead of sending the entire document to the language model, RAG first retrieves the most relevant chunks and supplies only those chunks to the model. This makes answers more grounded in the uploaded documents.

## Project Structure

```text
documind-ai/
├── app.py
├── rag_pipeline.py
├── requirements.txt
├── README.md
├── .gitignore
├── data/
│   └── .gitkeep
└── tests/
    └── test_rag.py
```

## Windows Setup

Open the project folder in VS Code.

### 1. Create a virtual environment

```powershell
python -m venv venv
```

### 2. Activate it

```powershell
.\venv\Scripts\Activate.ps1
```

If PowerShell blocks activation, use Command Prompt instead:

```cmd
venv\Scripts\activate
```

### 3. Install Python packages

```powershell
pip install -r requirements.txt
```

The first embedding-model download requires an internet connection. After that, the embedding model is available locally.

### 4. Install Ollama

Install Ollama for Windows from the official Ollama website.

Then download the local model:

```powershell
ollama pull llama3.2
```

Verify it:

```powershell
ollama run llama3.2
```

Exit the model with:

```text
/bye
```

### 5. Start DocuMind AI

```powershell
streamlit run app.py
```

The browser should open the Streamlit application.

## How to Use

1. Upload one or more PDFs.
2. Click **Process Documents**.
3. Wait for the vector index to be created.
4. Enter a question.
5. Click **Ask**.
6. Read the answer and source information.

## Pop Quiz

Once documents are filed, click **Generate Quiz** in the Index Drawer to have
Nifty write a short multiple-choice quiz grounded in the uploaded content.
Pick 3, 5, or 8 questions, answer them in the form, and submit to see your
score with a short explanation for each answer.

The quiz reuses the same local FAISS index and the same small Ollama model
that already power Q&A — no extra dependencies, no paid APIs, and it still
runs fully offline. Because it runs on a small model (`qwen2.5:0.5b` by
default), occasional malformed questions are silently dropped rather than
shown; if you consistently get very few or no questions back, try a larger
local Ollama model.

## RAG Concepts Demonstrated

1. Document ingestion — PDF files are loaded with PyPDFLoader.
2. Text extraction — readable PDF text is extracted.
3. Chunking — long text is split into smaller pieces.
4. Embeddings — chunks are converted into vectors.
5. Vector storage — FAISS stores the vectors locally.
6. Similarity retrieval — relevant chunks are retrieved for a question.
7. Context augmentation — retrieved text is placed into the model prompt.
8. Generation — Ollama generates the answer.
9. Grounding — the model is instructed to answer only from retrieved context.
10. Source attribution — source filename/page metadata is displayed.

## Testing

Run:

```powershell
pytest -q
```

## Limitations

- PDF text extraction quality depends on the PDF.
- Scanned/image-only PDFs may require OCR, which this mini project does not include.
- The local LLM quality depends on the Ollama model and computer hardware.
- FAISS is recreated when documents are processed.
- This version does not include authentication or multi-user storage.

## Future Enhancements

- OCR for scanned PDFs
- Persistent FAISS indexes
- DOCX support
- Conversation memory
- Better source previews
- Document deletion from the UI
- Evaluation metrics for retrieval quality

## Resume Description

Built **DocuMind AI**, a local RAG-based document question-answering assistant using Python, Streamlit, FAISS, Hugging Face embeddings, LangChain, and Ollama, enabling grounded question answering over uploaded PDF documents with source attribution.