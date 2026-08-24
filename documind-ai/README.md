# 📄 DocuMind AI · Smart Local Document Assistant

An AI-powered local document intelligence assistant built with **Streamlit**, **FAISS**, **Hugging Face Embeddings**, and **Ollama**.

---

## ✨ Features

- 📄 **PDF Document Upload & Parsing**: Multi-file drag and drop indexing.
- ⚡ **Local FAISS Vector Indexing**: Fast semantic retrieval over PDF document chunks.
- 🧠 **Context-Aware Ollama Chatbot**: Answers questions based strictly on retrieved document context.
- 🏷️ **Source Page Citations**: Displays exact source page cards for verified evidence.
- 🎨 **Modern Dark Glassmorphism Design**: Welcoming UI with real-time Ollama status indicator and model selection.

---

## 🛠 Tech Stack

- **Streamlit** (UI Framework)
- **LangChain** (RAG Orchestration)
- **FAISS** (Local Vector Database)
- **Hugging Face (`all-MiniLM-L6-v2`)** (Embeddings)
- **Ollama (`qwen2.5:0.5b` / `llama3.2`)** (Local LLM Engine)

---

## 🚀 How to Run

1. **Activate Ollama**:
   ```bash
   ollama run qwen2.5:0.5b
   ```

2. **Install Dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

3. **Launch Streamlit App**:
   ```bash
   streamlit run app.py
   ```
   Access at `http://localhost:8501`.
