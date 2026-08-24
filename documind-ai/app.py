import urllib.request
import json
from pathlib import Path
import streamlit as st
from rag_pipeline import build_vector_store, answer_question, DEFAULT_OLLAMA_MODEL

# --------------------------------------------------------- Page Setup ---
st.set_page_config(
    page_title="DocuMind AI · Smart Local Document Assistant",
    page_icon="📄",
    layout="wide",
    initial_sidebar_state="expanded"
)

# --------------------------------------------------------- Custom CSS ---
CSS = """
<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');

html, body, [class*="css"] {
    font-family: 'Inter', system-ui, -apple-system, sans-serif;
    color: #eaf0ff;
}

/* Background gradient */
.stApp {
    background: radial-gradient(circle at 12% 10%, #1e295d 0%, transparent 32%),
                radial-gradient(circle at 88% 25%, #3b1d5c 0%, transparent 30%),
                #090d1b;
}

/* Hide default streamlit header/footer clutter */
#MainMenu {visibility: hidden;}
footer {visibility: hidden;}

/* Custom Top Banner */
.documind-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.25rem 1.75rem;
    background: rgba(21, 27, 49, 0.75);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border: 1px solid rgba(131, 151, 234, 0.25);
    border-radius: 20px;
    box-shadow: 0 12px 36px rgba(0, 0, 0, 0.4);
    margin-bottom: 1.75rem;
}

.brand-title {
    font-size: 1.8rem;
    font-weight: 900;
    margin: 0;
    background: linear-gradient(135deg, #a4b7ff, #e1a7ff);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    letter-spacing: -0.02em;
}

.brand-sub {
    font-size: 0.78rem;
    font-weight: 700;
    color: #9caeff;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    margin-top: 2px;
}

.status-pill {
    display: flex;
    align-items: center;
    gap: 8px;
    background: rgba(81, 217, 144, 0.15);
    border: 1px solid rgba(81, 217, 144, 0.35);
    color: #51d990;
    padding: 0.4rem 0.9rem;
    border-radius: 9999px;
    font-size: 0.82rem;
    font-weight: 600;
}

.status-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background-color: #51d990;
    box-shadow: 0 0 8px #51d990;
}

/* Section Tabs */
.section-heading {
    display: inline-block;
    font-size: 0.82rem;
    font-weight: 800;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: #9caeff;
    margin-bottom: 0.75rem;
}

/* Card Drawer */
.glass-panel {
    background: rgba(21, 27, 49, 0.7);
    backdrop-filter: blur(14px);
    border: 1px solid rgba(131, 151, 234, 0.22);
    border-radius: 18px;
    padding: 1.5rem;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
    margin-bottom: 1.25rem;
}

.filed-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: rgba(131, 151, 234, 0.15);
    border: 1px solid rgba(131, 151, 234, 0.25);
    color: #eaf0ff;
    padding: 0.35rem 0.75rem;
    border-radius: 8px;
    font-size: 0.85rem;
    margin: 0.25rem;
}

/* Chat Messages */
.chat-slip {
    padding: 1rem 1.25rem;
    border-radius: 14px;
    font-size: 0.95rem;
    line-height: 1.6;
    margin-bottom: 0.75rem;
    word-break: break-word;
}

.chat-slip.user {
    background: linear-gradient(135deg, #3b82f6, #2563eb);
    color: #ffffff;
    box-shadow: 0 4px 15px rgba(37, 99, 235, 0.3);
    border-top-right-radius: 4px;
}

.chat-slip.assistant {
    background: rgba(25, 34, 60, 0.88);
    border: 1px solid rgba(131, 151, 234, 0.25);
    color: #eaf0ff;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.25);
    border-top-left-radius: 4px;
}

/* Source index card */
.source-card-flex {
    display: flex;
    flex-wrap: wrap;
    gap: 0.6rem;
    margin-top: 0.6rem;
}

.source-card {
    background: rgba(99, 102, 241, 0.12);
    border: 1px solid rgba(99, 102, 241, 0.3);
    border-radius: 8px;
    padding: 0.4rem 0.8rem;
    font-size: 0.78rem;
    color: #c7d2fe;
}

.source-tag {
    font-weight: 800;
    color: #818cf8;
    margin-right: 4px;
}

.documind-footer {
    border-top: 1px solid rgba(131, 151, 234, 0.2);
    margin-top: 3rem;
    padding-top: 1.2rem;
    font-size: 0.75rem;
    color: #7583a7;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    text-align: center;
}
</style>
"""

st.markdown(CSS, unsafe_allow_html=True)

# ---------------------------------------------------- Session State ---
if "vector_store" not in st.session_state:
    st.session_state.vector_store = None
if "processed_files" not in st.session_state:
    st.session_state.processed_files = []
if "chat_history" not in st.session_state:
    st.session_state.chat_history = []
if "assistant_intro_shown" not in st.session_state:
    st.session_state.assistant_intro_shown = False


def check_ollama():
    try:
        req = urllib.request.Request("http://localhost:11434/api/tags", headers={"User-Agent": "DocuMind-App"})
        with urllib.request.urlopen(req, timeout=2) as res:
            if res.status == 200:
                data = json.loads(res.read().decode("utf-8"))
                models = [m.get("name", "") for m in data.get("models", [])]
                return True, models
    except Exception:
        pass
    return False, []


ollama_online, installed_models = check_ollama()
selected_model = DEFAULT_OLLAMA_MODEL if DEFAULT_OLLAMA_MODEL in installed_models else (installed_models[0] if installed_models else DEFAULT_OLLAMA_MODEL)

# Sidebar Config
with st.sidebar:
    st.markdown("### ⚙️ DocuMind AI Engine")
    if ollama_online:
        st.success(f"🟢 Ollama Local Active ({len(installed_models)} model(s))")
        model_choice = st.selectbox("Active LLM Model", installed_models if installed_models else [DEFAULT_OLLAMA_MODEL], index=0)
        selected_model = model_choice
    else:
        st.success("🟢 FAISS Cloud RAG Engine Active")
        st.caption("Mode: Document Vector Retrieval & RAG Active")

    st.markdown("---")
    st.markdown("### 💡 Quick Tips")
    st.markdown("- Upload PDF files on the left panel.")
    st.markdown("- DocuMind builds a FAISS vector index.")
    st.markdown("- Ask any questions in natural language!")
    st.markdown("---")
    st.caption("DocuMind AI v2.0 · Local & Cloud RAG")

# Top Header
status_label = f"🟢 Ollama Active ({selected_model})" if ollama_online else "🟢 DocuMind Engine Active"
st.markdown(
    f"""
    <div class="documind-header">
        <div>
            <h1 class="brand-title">📄 DocuMind AI</h1>
            <div class="brand-sub">SMART DOCUMENT AI · READS FILES &amp; ANSWERS FAST</div>
        </div>
        <div class="status-pill">
            <span class="status-dot"></span>
            <span>{status_label}</span>
        </div>
    </div>
    """,
    unsafe_allow_html=True
)

left_col, right_col = st.columns([0.38, 0.62], gap="large")

# ----------------------------------------------- Left Column: File Drawer ---
with left_col:
    st.markdown('<div class="section-heading">📂 Document Index Drawer</div>', unsafe_allow_html=True)
    
    with st.container():
        uploaded_files = st.file_uploader(
            "Upload PDF documents into the index",
            type=["pdf"],
            accept_multiple_files=True,
            label_visibility="visible"
        )

        process_clicked = st.button(
            "⚡ File & Index Documents",
            type="primary",
            disabled=not uploaded_files,
            use_container_width=True
        )

        if process_clicked:
            temp_dir = Path("data/uploads")
            temp_dir.mkdir(parents=True, exist_ok=True)

            paths = []
            try:
                for uploaded in uploaded_files:
                    path = temp_dir / Path(uploaded.name).name
                    path.write_bytes(uploaded.getvalue())
                    paths.append(path)

                with st.spinner("Reading pages, generating embeddings & indexing..."):
                    st.session_state.vector_store = build_vector_store(paths)
                    st.session_state.processed_files = [p.name for p in paths]
                    st.session_state.chat_history = []  # Fresh index, fresh conversation

                st.success(f"✓ Successfully indexed {len(paths)} document(s)!")
            except Exception as exc:
                st.error(f"Could not index documents: {exc}")

    if st.session_state.processed_files:
        st.markdown('<div class="section-heading">📋 Currently Indexed Documents</div>', unsafe_allow_html=True)
        tabs_html = "".join(
            f'<div class="filed-badge">✓ {name}</div>'
            for name in st.session_state.processed_files
        )
        st.markdown(f'<div style="margin-bottom: 1rem;">{tabs_html}</div>', unsafe_allow_html=True)

        if st.button("🗑️ Clear Index & Start Over", use_container_width=True):
            st.session_state.vector_store = None
            st.session_state.processed_files = []
            st.session_state.chat_history = []
            st.session_state.assistant_intro_shown = False
            st.rerun()
    else:
        st.info("Drawer is empty. Upload one or more PDF documents above to begin.")

# -------------------------------------------- Right Column: Chat Desk ---
with right_col:
    st.markdown('<div class="section-heading">💬 Reference Desk & Chat Assistant</div>', unsafe_allow_html=True)

    if not st.session_state.chat_history:
        if st.session_state.vector_store is None:
            st.info("Upload and index your PDF documents in the left drawer first.")
        else:
            if not st.session_state.assistant_intro_shown:
                st.session_state.chat_history.append({
                    "role": "assistant",
                    "content": f"👋 Hello! I’m **Nifty**, your DocuMind document assistant. I have indexed your documents. Ask me anything about them!",
                    "sources": []
                })
                st.session_state.assistant_intro_shown = True
                st.rerun()

    # Render Chat History
    for turn in st.session_state.chat_history:
        if turn["role"] == "user":
            with st.chat_message("user", avatar="👤"):
                st.markdown(f'<div class="chat-slip user">{turn["content"]}</div>', unsafe_allow_html=True)
        else:
            with st.chat_message("assistant", avatar="🤖"):
                st.markdown(f'<div class="chat-slip assistant">{turn["content"]}</div>', unsafe_allow_html=True)
                sources = turn.get("sources") or []
                if sources:
                    cards_html = '<div class="source-card-flex">'
                    for src in sources:
                        cards_html += f'<div class="source-card"><span class="source-tag">RETRIEVED</span>{src}</div>'
                    cards_html += '</div>'
                    st.markdown(cards_html, unsafe_allow_html=True)

    # Chat Input
    question = st.chat_input(
        "Ask Nifty about your indexed documents...",
        disabled=st.session_state.vector_store is None
    )

    if question:
        user_question = question.strip()
        if user_question:
            recent_turns = st.session_state.chat_history[-6:]
            conversation = "\n".join(
                f'{t["role"]}: {t["content"]}' for t in recent_turns
            )
            st.session_state.chat_history.append({"role": "user", "content": user_question})
            st.session_state.assistant_intro_shown = True

            try:
                with st.spinner("Searching document vector store and drafting answer..."):
                    answer, sources = answer_question(
                        st.session_state.vector_store,
                        user_question,
                        conversation=conversation,
                        model_name=selected_model
                    )
                st.session_state.chat_history.append({
                    "role": "assistant",
                    "content": answer,
                    "sources": sources
                })
            except Exception as exc:
                st.session_state.chat_history.append({
                    "role": "assistant",
                    "content": f"⚠️ Could not answer that: {exc}",
                    "sources": []
                })

            st.rerun()

# Footer
st.markdown(
    """
    <div class="documind-footer">
        RUNS FULLY OFFLINE &amp; ONLINE &nbsp;·&nbsp; FAISS VECTOR INDEX &nbsp;·&nbsp; HUGGING FACE EMBEDDINGS &nbsp;·&nbsp; OLLAMA &amp; RAG ENGINE
    </div>
    """,
    unsafe_allow_html=True
)
