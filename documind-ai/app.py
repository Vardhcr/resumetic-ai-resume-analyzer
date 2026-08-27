import streamlit as st
from pathlib import Path
from rag_pipeline import build_vector_store, answer_question, generate_quiz

st.set_page_config(page_title="DocuMind AI", page_icon="📇", layout="wide")

# ----------------------------------------------------------------------------
# DESIGN SYSTEM — "Card Catalog"
#
# DocuMind AI runs entirely offline (no cloud, no paid APIs), so the visual
# language borrows from the pre-digital tool that did the same job: the
# library card catalog. Uploaded PDFs are "filed," and questions go to the
# "Archivist" at the reference desk — a chat thread styled as an exchange
# of request slips and stamped answer cards, not a generic chatbot.
#
# Color   paper #F2EDE3 · paper-dark #E8DFC8 · ink #1C2333 · ink-soft #5A6178
#         stamp (oxblood) #8B3A3A · filed (green) #2F6E5C · line #C9BFA5
# Type    display: "Special Elite" (typewriter) · body: "IBM Plex Sans"
#         data/labels: "IBM Plex Mono"
# Signature element: the retrieved-source index card, stamped and rotated,
# now attached beneath each Archivist reply in the thread.
# ----------------------------------------------------------------------------

CSS = """
<style>
@import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Manrope:wght@400;500;600;700;800&display=swap');

:root {
    --bg: #f6f3ed;
    --bg-soft: #e9f4ef;
    --panel: #fffdf8;
    --panel-alt: #f0eee7;
    --primary: #17252b;
    --primary-soft: #405158;
    --accent: #e45d47;
    --accent-soft: #fbe0d8;
    --success: #147d70;
    --success-soft: #d8eee7;
    --muted: #718087;
    --line: #d5d8d0;
    --shadow: rgba(23, 37, 43, 0.1);
}

#MainMenu, header[data-testid="stHeader"], footer {visibility: hidden;}

*, *::before, *::after { cursor: auto !important; }
button, [role="button"], input[type="file"] { cursor: pointer !important; }
input, textarea, [contenteditable="true"] {
    cursor: text !important;
    caret-color: var(--accent) !important;
}

.stApp {
    background:
        radial-gradient(circle at 100% 0%, rgba(228, 93, 71, 0.12), transparent 27rem),
        linear-gradient(135deg, #f6f3ed 0%, #eef2e9 52%, #e4f1eb 100%);
}

.assistant-status {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    background: rgba(20, 125, 112, 0.1);
    border: 1px solid rgba(15, 118, 110, 0.15);
    color: var(--success);
    border-radius: 999px;
    padding: 0.45rem 0.8rem;
    font-size: 0.72rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
}
.assistant-status .dot {
    width: 0.55rem;
    height: 0.55rem;
    border-radius: 50%;
    background: var(--success);
    box-shadow: 0 0 0 6px rgba(20, 125, 112, 0.14);
    animation: pulse 1.9s infinite;
}
@keyframes pulse {
    0% { transform: scale(1); opacity: 1; }
    50% { transform: scale(1.2); opacity: 0.8; }
    100% { transform: scale(1); opacity: 1; }
}

.stApp, .stApp p, .stApp label, .stApp span, .stApp div {
    color: var(--primary);
    font-family: 'Manrope', 'Segoe UI', sans-serif;
}

.block-container {
    padding-top: 2.25rem;
    max-width: 1180px;
}

/* ---------- Header ---------- */
.catalog-header {
    display: flex;
    align-items: end;
    justify-content: space-between;
    gap: 1rem;
    border-bottom: 1px solid var(--line);
    padding: 0 0 1rem 0;
    margin-bottom: 1.5rem;
}
.catalog-header .plate-num {
    font-size: 0.72rem;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--muted);
    background: var(--panel);
    border: 1px solid var(--line);
    border-radius: 999px;
    padding: 0.45rem 0.85rem;
    box-shadow: 0 2px 8px var(--shadow);
}
.catalog-title {
    font-size: 2.6rem;
    line-height: 1.1;
    margin: 0;
    font-weight: 700;
    letter-spacing: 0;
    color: var(--primary);
}
.catalog-sub {
    font-size: 0.76rem;
    color: var(--muted);
    margin-top: 0.45rem;
    letter-spacing: 0.12em;
    text-transform: uppercase;
}

/* ---------- Section labels ---------- */
.section-tab {
    display: inline-block;
    font-size: 0.72rem;
    font-weight: 700;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    background: var(--primary);
    color: white !important;
    padding: 0.5rem 0.8rem;
    border-radius: 999px;
    margin-bottom: 0.9rem;
    box-shadow: 0 8px 18px rgba(23, 37, 43, 0.14);
}
.section-tab * { color: white !important; }

/* ---------- Drawer / upload panel ---------- */
.drawer-panel {
    background: var(--panel);
    border: 1px solid var(--line);
    border-radius: 12px;
    padding: 1.2rem 1.1rem 0.6rem 1.1rem;
    margin-bottom: 1.1rem;
    box-shadow: 0 10px 30px var(--shadow);
}

[data-testid="stFileUploaderDropzone"] {
    background: var(--panel-alt) !important;
    border: 1.5px dashed #9eb8ae !important;
    border-radius: 8px !important;
    min-height: 130px !important;
}
[data-testid="stFileUploaderDropzone"] small,
[data-testid="stFileUploaderDropzone"] span {
    color: var(--muted) !important;
    font-weight: 500 !important;
}

.stButton > button {
    border-radius: 8px !important;
    border: none !important;
    background: var(--accent) !important;
    color: white !important;
    font-size: 0.76rem !important;
    font-weight: 700 !important;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    padding: 0.7rem 1.2rem !important;
    box-shadow: 0 10px 20px rgba(228, 93, 71, 0.22);
    transition: transform 0.15s ease, box-shadow 0.15s ease;
}
.stButton > button:hover {
    transform: translateY(-1px);
    box-shadow: 0 12px 22px rgba(228, 93, 71, 0.3);
    background: #c94b38 !important;
}
.stButton > button:disabled {
    background: var(--panel-alt) !important;
    color: var(--muted) !important;
    border: 1px solid var(--line) !important;
    box-shadow: none !important;
}

/* filed-document tabs */
.filed-tab {
    display: inline-block;
    font-size: 0.74rem;
    font-weight: 600;
    background: var(--panel-alt);
    border: 1px solid var(--line);
    border-left: 4px solid var(--success);
    border-radius: 10px;
    padding: 0.55rem 0.8rem;
    margin: 0 0.5rem 0.7rem 0;
    color: var(--primary-soft);
}
.filed-tab .dot { color: var(--success); margin-right: 0.4rem; }

/* ---------- Chat thread ---------- */
[data-testid="stChatMessage"] {
    background: transparent !important;
    padding: 0.35rem 0 !important;
}

.slip {
    border: 1px solid var(--line);
    border-radius: 12px;
    padding: 0.9rem 1rem;
    position: relative;
    margin-bottom: 0.4rem;
    box-shadow: 0 6px 18px rgba(23, 37, 43, 0.06);
}
.slip::before {
    position: absolute;
    top: -10px;
    left: 16px;
    background: var(--panel);
    color: var(--muted);
    font-size: 0.63rem;
    font-weight: 700;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    padding: 0.2rem 0.5rem;
    border: 1px solid var(--line);
    border-radius: 999px;
}
.slip.request::before { content: "Request"; }
.slip.answer::before { content: "Answer"; }
.slip.request {
    background: var(--bg-soft);
    border-color: #b8d8cd;
}
.slip.answer {
    background: var(--panel);
}
.slip-text {
    font-size: 1rem;
    line-height: 1.65;
    color: var(--primary-soft);
}
.slip.request .slip-text {
    font-size: 0.98rem;
}

/* ---------- Source cards ---------- */
.card-row {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    margin: 0.8rem 0 1.2rem 0;
}
.index-card {
    width: 225px;
    background: var(--panel);
    border: 1px solid var(--line);
    border-radius: 10px;
    padding: 0.9rem 0.9rem 0.8rem 0.9rem;
    position: relative;
    box-shadow: 0 8px 18px rgba(23, 37, 43, 0.06);
}
.index-card .stamp {
    position: absolute;
    top: 10px;
    right: 10px;
    font-size: 0.58rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--success);
    background: var(--success-soft);
    border: 1px solid rgba(15, 118, 110, 0.15);
    padding: 0.18rem 0.42rem;
    border-radius: 999px;
}
.index-card .doc-name {
    font-size: 0.8rem;
    font-weight: 700;
    padding-right: 60px;
    word-break: break-word;
    color: var(--primary);
}
.index-card .doc-page {
    font-size: 0.72rem;
    color: var(--muted);
    margin-top: 0.5rem;
    font-weight: 600;
}

/* ---------- Chat input ---------- */
[data-testid="stChatInput"] {
    border: 1px solid var(--line) !important;
    border-radius: 8px !important;
    background: var(--panel) !important;
    box-shadow: 0 8px 18px rgba(23, 37, 43, 0.09);
}

[data-testid="stChatInput"] textarea {
    font-family: 'Manrope', 'Segoe UI', sans-serif !important;
    color: var(--primary) !important;
    background: var(--panel) !important;
    font-size: 1rem !important;
}

[data-testid="stChatInput"] textarea::placeholder {
    color: var(--muted) !important;
    opacity: 1 !important;
}

/* ---------- Empty states ---------- */
.empty-note {
    font-size: 0.9rem;
    color: var(--muted);
    background: var(--panel);
    border: 1px solid var(--line);
    border-left: 4px solid var(--accent);
    border-radius: 8px;
    padding: 0.9rem 1rem;
    margin: 0.5rem 0 1.1rem 0;
}

/* ---------- Quiz card ---------- */
.quiz-card {
    background: var(--panel);
    border: 1px solid var(--line);
    border-radius: 12px;
    padding: 1.1rem 1.2rem;
    margin-bottom: 1rem;
    box-shadow: 0 8px 18px rgba(23, 37, 43, 0.06);
}
.quiz-card .quiz-q-label {
    font-size: 0.68rem;
    font-weight: 700;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--accent);
    margin-bottom: 0.35rem;
}
.quiz-card .quiz-q-text {
    font-size: 1.02rem;
    font-weight: 600;
    color: var(--primary);
    margin-bottom: 0.2rem;
}
.quiz-result {
    border-radius: 8px;
    padding: 0.6rem 0.85rem;
    margin-top: 0.6rem;
    font-size: 0.88rem;
    border: 1px solid var(--line);
}
.quiz-result.correct {
    background: var(--success-soft);
    color: var(--success);
    border-color: rgba(15, 118, 110, 0.2);
}
.quiz-result.incorrect {
    background: var(--accent-soft);
    color: #a3402d;
    border-color: rgba(228, 93, 71, 0.25);
}
.quiz-score-banner {
    background: var(--primary);
    color: white !important;
    border-radius: 10px;
    padding: 0.9rem 1.1rem;
    font-weight: 700;
    letter-spacing: 0.04em;
    margin-bottom: 1rem;
    box-shadow: 0 10px 24px rgba(23, 37, 43, 0.18);
}
.quiz-score-banner * { color: white !important; }

.catalog-footer {
    border-top: 1px solid var(--line);
    margin-top: 2rem;
    padding-top: 0.9rem;
    font-size: 0.7rem;
    color: var(--muted);
    letter-spacing: 0.08em;
    text-transform: uppercase;
    text-align: center;
}
</style>
"""

st.markdown(CSS, unsafe_allow_html=True)

if "vector_store" not in st.session_state:
    st.session_state.vector_store = None
if "processed_files" not in st.session_state:
    st.session_state.processed_files = []
if "chat_history" not in st.session_state:
    st.session_state.chat_history = []  # list of {"role", "content", "sources"}
if "assistant_intro_shown" not in st.session_state:
    st.session_state.assistant_intro_shown = False
if "quiz_questions" not in st.session_state:
    st.session_state.quiz_questions = None
if "quiz_submitted" not in st.session_state:
    st.session_state.quiz_submitted = False
if "quiz_error" not in st.session_state:
    st.session_state.quiz_error = None

# ---------------------------------------------------------------- header ---
st.markdown(
    """
    <div class="catalog-header">
        <div>
            <p class="catalog-title">Nifty</p>
            <p class="catalog-sub">SMART DOCUMENT AI · READS FILES &amp; ANSWERS FAST</p>
        </div>
        <div style="display:flex; align-items:center; gap:0.75rem; flex-wrap:wrap; justify-content:flex-end;">
            <div class="assistant-status"><span class="dot"></span> Nifty online</div>
            <div class="plate-num">CARD NO. 001 · OFFLINE</div>
        </div>
    </div>
    """,
    unsafe_allow_html=True,
)

left, right = st.columns([0.36, 0.64], gap="large")

# ------------------------------------------------------------ left: file ---
with left:
    st.markdown('<span class="section-tab">Index Drawer</span>', unsafe_allow_html=True)
    st.markdown('<div class="drawer-panel">', unsafe_allow_html=True)

    uploaded_files = st.file_uploader(
        "File documents into the drawer",
        type=["pdf"],
        accept_multiple_files=True,
        label_visibility="visible",
    )

    process_clicked = st.button(
        "File & Index",
        type="primary",
        disabled=not uploaded_files,
        use_container_width=True,
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

            with st.spinner("Reading pages and building the index..."):
                st.session_state.vector_store = build_vector_store(paths)
                st.session_state.processed_files = [p.name for p in paths]
                st.session_state.chat_history = []  # fresh drawer, fresh conversation
                st.session_state.quiz_questions = None
                st.session_state.quiz_submitted = False
                st.session_state.quiz_error = None

            st.success(f"Filed {len(paths)} document(s). Ask Nifty anything on the right.")
        except Exception as exc:
            st.error(f"Could not file the documents: {exc}")

    st.markdown("</div>", unsafe_allow_html=True)

    if st.session_state.processed_files:
        st.markdown('<span class="section-tab">Currently Filed</span>', unsafe_allow_html=True)
        tabs_html = "".join(
            f'<span class="filed-tab"><span class="dot">●</span>{name}</span>'
            for name in st.session_state.processed_files
        )
        st.markdown(tabs_html, unsafe_allow_html=True)

        if st.button("Clear Drawer & Start Over"):
            st.session_state.vector_store = None
            st.session_state.processed_files = []
            st.session_state.chat_history = []
            st.session_state.assistant_intro_shown = False
            st.session_state.quiz_questions = None
            st.session_state.quiz_submitted = False
            st.session_state.quiz_error = None
            st.rerun()

    if st.session_state.vector_store is not None:
        st.markdown('<span class="section-tab">Pop Quiz</span>', unsafe_allow_html=True)
        st.markdown('<div class="drawer-panel">', unsafe_allow_html=True)
        st.caption("Nifty writes a quick multiple-choice quiz from the filed documents — runs on the same local model, no extra cost.")

        num_questions = st.selectbox(
            "Number of questions",
            options=[3, 5, 8],
            index=1,
            label_visibility="collapsed",
        )

        quiz_clicked = st.button(
            "Generate Quiz",
            type="primary",
            use_container_width=True,
        )

        if quiz_clicked:
            st.session_state.quiz_submitted = False
            st.session_state.quiz_error = None
            try:
                with st.spinner("Reading the documents and writing questions..."):
                    st.session_state.quiz_questions = generate_quiz(
                        st.session_state.vector_store, num_questions=num_questions
                    )
            except Exception as exc:
                st.session_state.quiz_questions = None
                st.session_state.quiz_error = str(exc)

        if st.session_state.quiz_error:
            st.error(st.session_state.quiz_error)

        st.markdown("</div>", unsafe_allow_html=True)
    else:
        st.markdown(
            '<div class="empty-note">Drawer is empty. File a PDF above to begin.</div>',
            unsafe_allow_html=True,
        )

# ------------------------------------------------------- right: chat desk ---
with right:
    st.markdown('<span class="section-tab">Reference Desk</span>', unsafe_allow_html=True)

    if not st.session_state.chat_history:
        if st.session_state.vector_store is None:
            st.markdown(
                '<div class="empty-note">File documents in the drawer, then ask the '
                'Archivist about them here — no formal wording needed.</div>',
                unsafe_allow_html=True,
            )
        else:
            if not st.session_state.assistant_intro_shown:
                st.session_state.chat_history.append({
                    "role": "assistant",
                    "content": "Hello! I’m Nifty, your document intelligence assistant. I can read your uploaded files and answer questions from them in seconds.",
                    "sources": [],
                })
                st.session_state.assistant_intro_shown = True
                st.rerun()
            st.markdown(
                '<div class="empty-note">Documents are filed. Ask the Archivist anything '
                'about them below.</div>',
                unsafe_allow_html=True,
            )

    for turn in st.session_state.chat_history:
        if turn["role"] == "user":
            with st.chat_message("user", avatar="👤"):
                st.markdown(
                    f'<div class="slip request"><div class="slip-text">{turn["content"]}</div></div>',
                    unsafe_allow_html=True,
                )
        else:
            with st.chat_message("assistant", avatar="🤖"):
                st.markdown(
                    f'<div class="slip answer"><div class="slip-text">{turn["content"]}</div></div>',
                    unsafe_allow_html=True,
                )
                sources = turn.get("sources") or []
                if sources:
                    cards = ['<div class="card-row">']
                    for source in sources:
                        if " — page " in source:
                            doc_name, page = source.split(" — page ", 1)
                            page_html = f'<div class="doc-page">PAGE {page}</div>'
                        else:
                            doc_name, page_html = source, ""
                        cards.append(
                            f'<div class="index-card">'
                            f'<div class="stamp">RETRIEVED</div>'
                            f'<div class="doc-name">{doc_name}</div>'
                            f'{page_html}'
                            f'</div>'
                        )
                    cards.append("</div>")
                    st.markdown("".join(cards), unsafe_allow_html=True)

    question = st.chat_input(
        "Ask Nifty about your documents...",
        disabled=st.session_state.vector_store is None,
    )

    if question:
        user_question = question.strip()
        if user_question:
            recent_turns = st.session_state.chat_history[-6:]
            conversation = "\n".join(
                f'{turn["role"]}: {turn["content"]}'
                for turn in recent_turns
            )
            st.session_state.chat_history.append({"role": "user", "content": user_question})
            st.session_state.assistant_intro_shown = True

            try:
                with st.spinner("Searching the drawer and drafting an answer..."):
                    answer, sources = answer_question(
                        st.session_state.vector_store,
                        user_question,
                        conversation=conversation,
                    )
                st.session_state.chat_history.append(
                    {"role": "assistant", "content": answer, "sources": sources}
                )
            except Exception as exc:
                st.session_state.chat_history.append(
                    {"role": "assistant", "content": f"Could not answer that: {exc}", "sources": []}
                )

            st.rerun()

# ------------------------------------------------------------- pop quiz ---
if st.session_state.quiz_questions:
    st.divider()
    st.markdown('<span class="section-tab">Pop Quiz</span>', unsafe_allow_html=True)

    quiz = st.session_state.quiz_questions

    if st.session_state.quiz_submitted:
        score = sum(
            1
            for i, q in enumerate(quiz)
            if st.session_state.get(f"quiz_choice_{i}") == q["options"][q["answer_index"]]
        )
        st.markdown(
            f'<div class="quiz-score-banner">Score: {score} / {len(quiz)}</div>',
            unsafe_allow_html=True,
        )

    with st.form("quiz_form"):
        for i, q in enumerate(quiz):
            st.markdown(
                f'<div class="quiz-card">'
                f'<div class="quiz-q-label">Question {i + 1} of {len(quiz)}</div>'
                f'<div class="quiz-q-text">{q["question"]}</div>'
                f'</div>',
                unsafe_allow_html=True,
            )
            st.radio(
                f"Answer for question {i + 1}",
                options=q["options"],
                key=f"quiz_choice_{i}",
                index=None,
                label_visibility="collapsed",
            )

            if st.session_state.quiz_submitted:
                selected = st.session_state.get(f"quiz_choice_{i}")
                correct_option = q["options"][q["answer_index"]]
                is_correct = selected == correct_option
                verdict = "Correct!" if is_correct else f"Not quite — the correct answer is: {correct_option}"
                explanation = f" {q['explanation']}" if q.get("explanation") else ""
                st.markdown(
                    f'<div class="quiz-result {"correct" if is_correct else "incorrect"}">'
                    f'{verdict}{explanation}</div>',
                    unsafe_allow_html=True,
                )

        submitted = st.form_submit_button("Submit Answers", type="primary", use_container_width=True)
        if submitted:
            st.session_state.quiz_submitted = True
            st.rerun()

    if st.button("New Quiz"):
        st.session_state.quiz_questions = None
        st.session_state.quiz_submitted = False
        st.session_state.quiz_error = None
        st.rerun()

st.markdown(
    """
    <div class="catalog-footer">
        RUNS FULLY OFFLINE &nbsp;·&nbsp; FAISS &nbsp;·&nbsp; HUGGING FACE EMBEDDINGS &nbsp;·&nbsp; OLLAMA / LLAMA 3.2
    </div>
    """,
    unsafe_allow_html=True,
)