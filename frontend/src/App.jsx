import { useEffect, useRef, useState } from "react";

import ATSScoreCard from "./components/ATSScoreCard";
import ResumeStatistics from "./components/ResumeStatistics";
import SectionAnalysis from "./components/SectionAnalysis";
import SkillsSection from "./components/SkillSection";
import AIChatBot from "./components/AIChatBot";
import JDMatcher from "./components/JDMatcher";
import API from "./services/api";

import "./App.css";

const emptyAnalysis = {
  ats_score: 0,
  resume_grade: "N/A",
  candidate_profile: "",
  score_breakdown: [],
  raw_points: 0,
  maximum_points: 0,
  statistics: {},
  skills: { items: [], categories: {} },
  sections: {},
  recommendations: [],
};

const SAMPLE_RESUME_DATA = {
  filename: "Sample_Software_Engineer_Resume.pdf",
  feedback: [
    "Education section found",
    "Skills section found",
    "Projects section found",
    "Strong technical skill coverage",
    "Good use of action verbs and measurable outcomes",
    "Include a professional email and relevant LinkedIn or GitHub links"
  ],
  previewText: `JANE DOE | Software Engineer
Email: jane.doe@example.com | GitHub: github.com/janedoe | LinkedIn: linkedin.com/in/janedoe

PROFESSIONAL SUMMARY
Results-oriented Software Engineer with 3+ years of experience building high-performance web applications using React, Python (FastAPI), PostgreSQL, and Docker. Passionate about clean code, microservices, and AI integrations.

TECHNICAL SKILLS
Languages: Python, JavaScript, TypeScript, SQL, HTML/CSS
Frameworks: React, Node.js, FastAPI, Django, Express
Databases: PostgreSQL, MongoDB, Redis
Tools & Cloud: Git, Docker, Kubernetes, AWS, Linux, CI/CD

EXPERIENCE
Software Engineer | Tech Corp (2023 - Present)
- Architected RESTful APIs using FastAPI and PostgreSQL, serving 50,000+ daily active users with 99.9% uptime.
- Reduced frontend initial bundle load time by 35% through code splitting and asset optimization in React.
- Automated CI/CD deployment pipelines using GitHub Actions and AWS ECS, cutting deployment time by 45 minutes.

PROJECTS
Resumetic AI Analyzer (GitHub: github.com/janedoe/resumetic)
- Developed a local RAG-based resume analyzer using Python, FAISS, PyMuPDF, and Ollama LLM.
- Implemented real-time ATS scoring algorithms evaluating keyword density, section headers, and impact metrics.

EDUCATION
B.Tech in Computer Science & Engineering | University of Technology (Graduated 2023)`,
  sectionSummary: {
    found: ["Education", "Skills", "Projects", "Certifications"],
    missing: ["Publications"]
  },
  full_text: `JANE DOE | Software Engineer
Email: jane.doe@example.com | GitHub: github.com/janedoe | LinkedIn: linkedin.com/in/janedoe

PROFESSIONAL SUMMARY
Results-oriented Software Engineer with 3+ years of experience building high-performance web applications using React, Python (FastAPI), PostgreSQL, and Docker. Passionate about clean code, microservices, and AI integrations.

TECHNICAL SKILLS
Languages: Python, JavaScript, TypeScript, SQL, HTML/CSS
Frameworks: React, Node.js, FastAPI, Django, Express
Databases: PostgreSQL, MongoDB, Redis
Tools & Cloud: Git, Docker, Kubernetes, AWS, Linux, CI/CD`,
  analysis: {
    ats_score: 88,
    resume_grade: "Very Good",
    candidate_profile: "B.Tech/Fresher",
    score_breakdown: [
      { label: "Education", points: 10, maximum: 10 },
      { label: "Skills", points: 13, maximum: 13 },
      { label: "Projects", points: 8, maximum: 8 },
      { label: "Technical skill coverage", points: 10, maximum: 10 },
      { label: "Measurable impact", points: 7, maximum: 8 },
      { label: "Resume length", points: 10, maximum: 10 },
      { label: "ATS-readable headings", points: 8, maximum: 8 }
    ],
    raw_points: 85.5,
    maximum_points: 97,
    statistics: {
      word_count: 345,
      estimated_pages: 1,
      total_skills: 16,
      completed_sections: 4
    },
    skills: {
      items: ["Python", "JavaScript", "TypeScript", "React", "Node.js", "FastAPI", "Django", "PostgreSQL", "MongoDB", "Redis", "Docker", "AWS", "Git", "Kubernetes", "Linux", "SQL"],
      categories: {
        "Languages": ["Python", "JavaScript", "TypeScript", "SQL"],
        "Web Frameworks": ["React", "FastAPI", "Django", "Node.js"],
        "Databases & Cloud": ["PostgreSQL", "MongoDB", "Redis", "AWS", "Docker"]
      }
    },
    sections: {
      found: ["Education", "Skills", "Projects", "Experience"],
      missing: ["Publications"]
    },
    recommendations: [
      "Add quantifiable metrics to your second project bullet point.",
      "Consider adding AWS or Cloud certification credentials if applicable.",
      "Ensure contact links include full HTTPS protocols."
    ]
  }
};

const iconStyle = { width: 22, height: 22, flex: "0 0 auto" };

function App() {
  const fileInputRef = useRef(null);
  const stickyFileInputRef = useRef(null);

  const [activeTab, setActiveTab] = useState("analyzer"); // 'analyzer', 'jd_matcher', 'chatbot', 'features'
  const [selectedFile, setSelectedFile] = useState(null);
  const [result, setResult] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [ollamaInfo, setOllamaInfo] = useState({ online: false, active_model: "qwen2.5:0.5b" });

  const openFilePicker = () => fileInputRef.current?.click();
  const openStickyFilePicker = () => stickyFileInputRef.current?.click();

  useEffect(() => {
    API.warmUp?.();
    checkOllamaStatus();
  }, []);

  const checkOllamaStatus = async () => {
    const status = await API.checkOllamaStatus();
    setOllamaInfo(status);
  };

  const loadSampleResume = () => {
    setSelectedFile({ name: "Sample_Software_Engineer_Resume.pdf" });
    setResult(SAMPLE_RESUME_DATA);
    setMessage("Sample resume loaded successfully for instant preview!");
    setError("");
    setActiveTab("analyzer");
  };

  const processFile = async (file) => {
    if (!file) return;

    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      setSelectedFile(null);
      setResult(null);
      setMessage("");
      setError("Please choose a PDF resume.");
      return;
    }

    setSelectedFile(file);
    setResult(null);
    setMessage("");
    setError("");
    setLoading(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await API.post("/resume/upload", formData);
      const data = response.data;

      if (!data?.success) {
        throw new Error(data?.message || "The resume could not be analyzed.");
      }

      setResult({
        filename: data.filename || file.name,
        feedback: Array.isArray(data.feedback) ? data.feedback : [],
        previewText: data.preview_text || "",
        full_text: data.full_text || data.preview_text || "",
        sectionSummary: data.section_summary || {},
        analysis: {
          ...emptyAnalysis,
          ...(data.analysis || {}),
          statistics: data.analysis?.statistics || {},
          skills: {
            ...emptyAnalysis.skills,
            ...(data.analysis?.skills || {}),
            items: data.analysis?.skills?.items || [],
            categories: data.analysis?.skills?.categories || {},
          },
          sections: data.analysis?.sections || {},
          recommendations: data.analysis?.recommendations || [],
        },
      });
      setMessage(data.message || "Resume analyzed successfully.");
    } catch (err) {
      console.error("Axios Error:", err);
      let msg = "Upload failed. Please try again.";
      const status = err.response?.status;
      const serverDetail = err.response?.data?.detail || err.response?.data?.message;

      if (err.response) {
        if (status === 413) {
          msg = `The PDF file is too large to upload (HTTP 413).`;
        } else if (status === 400) {
          msg = serverDetail || "This file could not be accepted. Please upload a valid PDF.";
        } else if (status === 500) {
          msg = serverDetail || `The server could not process this resume (HTTP 500). Please try a different PDF.`;
        } else {
          msg = serverDetail || `The server returned an error (HTTP ${status}).`;
        }
      } else if (err.code === "ERR_NETWORK") {
        const attempted = API.defaults.baseURL;
        if (API.isProductionHost()) {
          msg = `Network error (${err.code}) contacting analysis server. Retried automatically. Please wait a moment and try again.`;
        } else {
          msg = `Network error (${err.code}) reaching ${attempted}. Check network and backend status.`;
        }
      } else if (err.message) {
        msg = err.message;
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    processFile(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    processFile(file);
  };

  const analysis = result?.analysis || emptyAnalysis;

  return (
    <main className="page-container">
      <div aria-hidden="true" className="orb-one" />
      <div aria-hidden="true" className="orb-two" />
      <div aria-hidden="true" className="grid-pattern" />

      <section className="shell">
        {/* Navigation Bar */}
        <nav className="navbar" aria-label="Primary navigation">
          <a href="#" className="brand" onClick={() => setActiveTab("analyzer")}>
            <span className="brand-mark">✦</span> RESUMETIC <span className="brand-badge">AI</span>
          </a>

          {/* Navigation Tabs */}
          <div className="nav-tabs-desktop">
            <button
              type="button"
              className={`nav-tab-btn ${activeTab === "analyzer" ? "active" : ""}`}
              onClick={() => setActiveTab("analyzer")}
            >
              📄 Resume Analyzer
            </button>
            <button
              type="button"
              className={`nav-tab-btn ${activeTab === "jd_matcher" ? "active" : ""}`}
              onClick={() => setActiveTab("jd_matcher")}
            >
              🎯 JD Matcher
            </button>
            <button
              type="button"
              className={`nav-tab-btn ${activeTab === "chatbot" ? "active" : ""}`}
              onClick={() => setActiveTab("chatbot")}
            >
              💬 AI Assistant
            </button>
            <button
              type="button"
              className={`nav-tab-btn ${activeTab === "features" ? "active" : ""}`}
              onClick={() => setActiveTab("features")}
            >
              💡 Features
            </button>
          </div>

          {/* Status Badge & Mobile Trigger */}
          <div className="nav-right-actions">
            <button
              type="button"
              className="ollama-status-pill-btn"
              onClick={() => setIsDrawerOpen(true)}
              title="Open Local Ollama Assistant"
            >
              <span className={`status-dot ${ollamaInfo.online ? "online" : "offline"}`} />
              <span className="pill-text">
                {ollamaInfo.online ? `Ollama (${ollamaInfo.active_model})` : "Ollama Offline"}
              </span>
            </button>

            <button
              type="button"
              className="mobile-menu-btn"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-expanded={isMobileMenuOpen}
              aria-label="Toggle navigation menu"
            >
              <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d={isMobileMenuOpen ? "M18 6L6 18M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
              </svg>
            </button>
          </div>
        </nav>

        {/* Mobile Drawer */}
        <div className={`mobile-drawer ${isMobileMenuOpen ? "open" : ""}`} aria-hidden={!isMobileMenuOpen}>
          <div className="mobile-drawer-header">
            <div className="brand"><span className="brand-mark">✦</span> RESUMETIC AI</div>
            <button
              type="button"
              className="mobile-menu-btn"
              onClick={() => setIsMobileMenuOpen(false)}
              aria-label="Close menu"
            >
              ✕
            </button>
          </div>
          <ul className="mobile-nav-list">
            <li><button type="button" onClick={() => { setActiveTab("analyzer"); setIsMobileMenuOpen(false); }}>📄 Resume Analyzer</button></li>
            <li><button type="button" onClick={() => { setActiveTab("jd_matcher"); setIsMobileMenuOpen(false); }}>🎯 JD Matcher</button></li>
            <li><button type="button" onClick={() => { setActiveTab("chatbot"); setIsMobileMenuOpen(false); }}>💬 Ollama AI Assistant</button></li>
            <li><button type="button" onClick={() => { setActiveTab("features"); setIsMobileMenuOpen(false); }}>💡 Features</button></li>
          </ul>
        </div>

        {/* Welcoming Hero Banner */}
        <header className="hero">
          <div className="hero-copy">
            <p className="eyebrow"><span className="live-dot" /> Local Ollama AI Powered</p>
            <h1 className="title">Turn your resume into your <span className="title-accent">next breakthrough.</span></h1>
            <p className="subtitle">
              Instant local ATS scoring, skill extraction, job description matching, and context-aware Ollama AI chatbot guidance.
            </p>
            <div className="trust-row">
              <span>🔒 100% Local & Private</span><span>⚡ Instant ATS Scoring</span><span>🤖 Ollama LLM Coach</span>
            </div>
            <div className="hero-button-row">
              <button type="button" onClick={openFilePicker} className="hero-primary-btn">
                📄 Upload PDF Resume
              </button>
              <button type="button" onClick={loadSampleResume} className="hero-secondary-btn">
                ✨ Try Sample Resume
              </button>
            </div>
          </div>

          <div className="hero-art" aria-hidden="true">
            <div className="resume-card-art">
              <div style={{ display: "flex", alignItems: "center", gap: 12, paddingBottom: 16, borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
                <div style={{ display: "grid", placeItems: "center", width: 42, height: 42, borderRadius: "50%", fontWeight: 800, background: "linear-gradient(135deg, #6366f1, #d687ff)", color: "#fff", fontSize: 20 }}>R</div>
                <div>
                  <div style={{ height: 8, width: 130, borderRadius: 8, background: "#e7edffb8", margin: "4px 0" }} />
                  <div style={{ height: 6, width: 85, borderRadius: 8, background: "#b7c6ff52", margin: "4px 0" }} />
                </div>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 18 }}>
                <div>
                  <div style={{ height: 6, width: 95, borderRadius: 8, background: "#cbd6ff78", margin: "6px 0" }} />
                  <div style={{ height: 6, width: 120, borderRadius: 8, background: "#e7edffb8", margin: "6px 0" }} />
                </div>
                <div style={{ display: "grid", placeItems: "center", width: 58, height: 58, borderRadius: "50%", color: "#51d990", fontSize: 20, fontWeight: 900, border: "4px solid #51d990" }}>
                  {result ? analysis.ats_score : 92}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Status Indicators */}
        <div aria-live="polite" className="status-area">
          {selectedFile && <span className="file-pill">📄 {selectedFile.name}</span>}
          {message && <span role="status" className="success-pill">✓ {message}</span>}
          {error && <span role="alert" className="error-pill">{error}</span>}
        </div>

        {/* TAB 1: RESUME ANALYZER */}
        {activeTab === "analyzer" && (
          <>
            {/* Upload Drag & Drop Panel */}
            <section
              id="analyzer"
              className={`upload-panel ${isDragOver ? "drag-over" : ""}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              aria-label="Resume upload"
            >
              <div className="upload-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" style={iconStyle}>
                  <path d="M12 16V3m0 0L7 8m5-5 5 5M5 15v4a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-4" />
                </svg>
              </div>
              <div className="upload-info">
                <h2 className="upload-title">Drop your resume here</h2>
                <p className="upload-text">Upload your PDF resume for instant local ATS analysis and skill insights.</p>
              </div>
              <input ref={fileInputRef} type="file" accept="application/pdf,.pdf" onChange={handleFileChange} className="sr-only" />
              <div className="upload-buttons-flex">
                <button type="button" onClick={openFilePicker} disabled={loading} className="upload-btn">
                  {loading ? "Analyzing PDF..." : "Upload PDF Resume"}
                  {!loading && <span aria-hidden="true">➔</span>}
                </button>
                <button type="button" onClick={loadSampleResume} disabled={loading} className="sample-btn">
                  Load Sample Resume
                </button>
              </div>
            </section>

            {/* Analysis Results View */}
            {result && (
              <section aria-label="Resume analysis" className="results-section">
                <div className="results-heading">
                  <div>
                    <p className="eyebrow">Your ATS Performance Report</p>
                    <h2 className="results-title">Analysis for {result.filename}</h2>
                  </div>
                  <span className="complete-badge">✓ Analysis Complete</span>
                </div>

                <div className="score-grid">
                  <ATSScoreCard
                    atsScore={analysis.ats_score}
                    grade={analysis.resume_grade}
                    statistics={analysis.statistics}
                    feedback={result.feedback}
                    breakdown={analysis.score_breakdown}
                    rawPoints={analysis.raw_points}
                    maximumPoints={analysis.maximum_points}
                    candidateProfile={analysis.candidate_profile}
                  />
                </div>

                <ResumeStatistics statistics={analysis.statistics} />
                <SectionAnalysis sections={analysis.sections} summary={result.sectionSummary} />
                <SkillsSection skills={analysis.skills} />

                {/* Recommendations */}
                <section className="recommendation-panel">
                  <div className="panel-heading">
                    <span className="panel-icon">✦</span>
                    <div>
                      <p className="eyebrow">Actionable Improvement Plan</p>
                      <h2 className="panel-title">Recommendations</h2>
                    </div>
                  </div>
                  {analysis.recommendations.length ? (
                    <ol className="recommendations-list">
                      {analysis.recommendations.map((recommendation) => (
                        <li key={recommendation}>{recommendation}</li>
                      ))}
                    </ol>
                  ) : (
                    <p style={{ color: "var(--text-secondary)" }}>No recommendations are available.</p>
                  )}
                </section>

                {/* Extracted Text Preview */}
                {result.previewText && (
                  <section className="preview-panel">
                    <h2 className="panel-title">Extracted Resume Content</h2>
                    <pre className="preview-text">{result.previewText}</pre>
                  </section>
                )}
              </section>
            )}
          </>
        )}

        {/* TAB 2: JD MATCHER */}
        {activeTab === "jd_matcher" && (
          <JDMatcher
            currentResumeText={result?.full_text || result?.previewText || ""}
            currentFilename={result?.filename || ""}
          />
        )}

        {/* TAB 3: OLLAMA AI ASSISTANT (CHATBOT) */}
        {activeTab === "chatbot" && (
          <section className="chatbot-tab-view">
            <AIChatBot resumeContext={result} isDrawer={false} />
          </section>
        )}

        {/* TAB 4: FEATURES & GUIDE */}
        {activeTab === "features" && (
          <section id="features" className="feature-grid" aria-label="Analysis features">
            {[
              ["01", "ATS Score Gauge", "Measure how effectively your resume parses through corporate screening systems with detailed point breakdowns."],
              ["02", "Skill Taxonomy", "Extract soft skills, frameworks, languages, and identify crucial missing technical stack requirements."],
              ["03", "Job Matcher", "Compare your resume against any job description to evaluate keyword coverage and match scores."],
              ["04", "Ollama LLM Assistant", "Chat 100% locally with Ollama for personalized bullet point rewrites, summary crafting, and interview prep."]
            ].map(([number, title, copy]) => (
              <article key={number} className="feature-card">
                <span className="feature-number">{number}</span>
                <h3 className="feature-title">{title}</h3>
                <p className="feature-copy">{copy}</p>
              </article>
            ))}
          </section>
        )}
      </section>

      {/* Floating Chat Button (Bottom Right) */}
      <button
        type="button"
        className="floating-chat-fab"
        onClick={() => setIsDrawerOpen(!isDrawerOpen)}
        title="Open Ollama AI Assistant"
      >
        <span className="fab-icon">💬</span>
        <span className="fab-text">Ollama AI</span>
      </button>

      {/* Floating Chat Side-Drawer Modal */}
      {isDrawerOpen && (
        <div className="chat-drawer-overlay" onClick={() => setIsDrawerOpen(false)}>
          <div className="chat-drawer-content" onClick={(e) => e.stopPropagation()}>
            <AIChatBot
              resumeContext={result}
              isDrawer={true}
              onCloseDrawer={() => setIsDrawerOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Sticky Mobile Upload Button */}
      <div className="mobile-sticky-upload">
        <input ref={stickyFileInputRef} type="file" accept="application/pdf,.pdf" onChange={handleFileChange} className="sr-only" />
        <button type="button" onClick={openStickyFilePicker} disabled={loading} className="upload-btn" style={{ width: "100%" }}>
          {loading ? "Analyzing..." : "Upload New Resume PDF"}
        </button>
      </div>
    </main>
  );
}

export default App;
