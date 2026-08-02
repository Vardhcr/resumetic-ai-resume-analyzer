import { useEffect, useRef, useState } from "react";

import ATSScoreCard from "./components/ATSScoreCard";
import ResumeStatistics from "./components/ResumeStatistics";
import SectionAnalysis from "./components/SectionAnalysis";
import SkillsSection from "./components/SkillSection";
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

const iconStyle = { width: 22, height: 22, flex: "0 0 auto" };

function App() {
  const fileInputRef = useRef(null);
  const stickyFileInputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [result, setResult] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const openFilePicker = () => fileInputRef.current?.click();
  const openStickyFilePicker = () => stickyFileInputRef.current?.click();

  // Warm up the backend on page load so a sleep-on-idle host (e.g. Railway
  // free tier) is already awake before the user picks a file to upload.
  useEffect(() => {
    API.warmUp?.();
  }, []);


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

    console.log("API Base URL:", API.defaults.baseURL);

    try {
      // Do NOT set Content-Type manually: the browser must generate the
      // multipart boundary, otherwise some mobile browsers fail to parse the
      // upload server-side.
      const response = await API.post("/resume/upload", formData);

  console.log("Response Status:", response.status);
  console.log("Response Data:", response.data);

  const data = response.data;
      if (!data?.success) {
        throw new Error(data?.message || "The resume could not be analyzed.");
      }

      setResult({
        filename: data.filename || file.name,
        feedback: Array.isArray(data.feedback) ? data.feedback : [],
        previewText: data.preview_text || "",
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

      // Surface the REAL underlying error so mobile failures can be diagnosed:
      //  - err.response  => backend answered (non-2xx) — show actual status/detail.
      //  - err.code      => axios error code (ERR_NETWORK, ERR_BAD_REQUEST...).
      //  - err.message   => raw message (may already include a useful hint).
      const status = err.response?.status;
      const serverDetail = err.response?.data?.detail || err.response?.data?.message;

      if (err.response) {
        // Backend responded with an error — expose the real status and detail.
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
        // No response received — network-level failure. Reveal the code and the
        // backend URL that failed so the cause is not hidden.
        const attempted = API.defaults.baseURL;
        if (API.isProductionHost()) {
          msg = `Network error (${err.code}) while contacting the analysis server (${attempted}). The server may be temporarily unavailable — we retried automatically. Please wait a moment and try again.`;
        } else {
          msg = `Network error (${err.code}) reaching ${attempted}. If you are on a phone, make sure the phone and computer are on the same Wi-Fi and the backend is running with --host 0.0.0.0.`;
        }
      } else if (err.message) {
        msg = err.message;
      }

      setError(msg);
    } finally {
      setLoading(false);
    }
  }

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
        {/* Navigation */}
        <nav className="navbar" aria-label="Primary navigation">
          <a href="#" className="brand">
            <span className="brand-mark">✦</span> RESUMETIC
          </a>

          <div className="nav-links-desktop">
            <a href="#features" className="nav-link">Features</a>
            <a href="#analyzer" className="nav-link">Analyzer</a>
            <span className="file-pill">AI-Powered ATS v2.0</span>
          </div>

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
        </nav>

        {/* Mobile Navigation Drawer */}
        <div className={`mobile-drawer ${isMobileMenuOpen ? "open" : ""}`} aria-hidden={!isMobileMenuOpen}>
          <div className="mobile-drawer-header">
            <div className="brand"><span className="brand-mark">✦</span> RESUMETIC</div>
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
            <li><a href="#" onClick={() => setIsMobileMenuOpen(false)}>Home</a></li>
            <li><a href="#features" onClick={() => setIsMobileMenuOpen(false)}>Features</a></li>
            <li><a href="#analyzer" onClick={() => setIsMobileMenuOpen(false)}>Resume Analyzer</a></li>
          </ul>
        </div>

        {/* Hero Banner */}
        <header className="hero">
          <div className="hero-copy">
            <p className="eyebrow"><span className="live-dot" /> Instant ATS analysis</p>
            <h1 className="title">Turn your resume into your <span className="title-accent">next opportunity.</span></h1>
            <p className="subtitle">
              See exactly what recruiters and applicant tracking systems see—then make every section stronger.
            </p>
            <div className="trust-row">
              <span>✓ PDF-ready</span><span>✓ Skill insights</span><span>✓ Actionable feedback</span>
            </div>
          </div>

          <div className="hero-art" aria-hidden="true">
            <div className="resume-card-art">
              <div style={{ display: "flex", alignItems: "center", gap: 12, paddingBottom: 16, borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
                <div style={{ display: "grid", placeItems: "center", width: 36, height: 36, borderRadius: "50%", fontWeight: 800, background: "linear-gradient(135deg, #91a5ff, #d687ff)" }}>A</div>
                <div>
                  <div style={{ height: 6, width: 110, borderRadius: 8, background: "#e7edffb8", margin: "4px 0" }} />
                  <div style={{ height: 5, width: 70, borderRadius: 8, background: "#b7c6ff52", margin: "4px 0" }} />
                </div>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 16 }}>
                <div>
                  <div style={{ height: 5, width: 85, borderRadius: 8, background: "#cbd6ff78", margin: "6px 0" }} />
                  <div style={{ height: 5, width: 100, borderRadius: 8, background: "#e7edffb8", margin: "6px 0" }} />
                </div>
                <div style={{ display: "grid", placeItems: "center", width: 54, height: 54, borderRadius: "50%", color: "#9bf4c6", fontSize: 18, fontWeight: 800, border: "4px solid #56dd9f" }}>92</div>
              </div>
            </div>
          </div>
        </header>

        {/* Upload Panel / Drag & Drop */}
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
            <h2 className="upload-title">Ready when you are</h2>
            <p className="upload-text">Upload or drop your PDF resume for instant deep analysis.</p>
          </div>
          <input ref={fileInputRef} type="file" accept="application/pdf,.pdf" onChange={handleFileChange} className="sr-only" />
          <button type="button" onClick={openFilePicker} disabled={loading} className="upload-btn">
            {loading ? "Analyzing resume..." : "Upload PDF"}
            {!loading && <span aria-hidden="true">→</span>}
          </button>
        </section>

        {/* Status Indicators */}
        <div aria-live="polite" className="status-area">
          {selectedFile && <span className="file-pill">📄 {selectedFile.name}</span>}
          {message && <span role="status" className="success-pill">✓ {message}</span>}
          {error && <span role="alert" className="error-pill">{error}</span>}
        </div>

        {/* Feature Cards (No result) */}
        {!result && !loading && (
          <section id="features" className="feature-grid" aria-label="Analysis features">
            {[
              ["01", "ATS score", "Measure how well your resume is optimized for screening systems."],
              ["02", "Section review", "Find missing essentials that can weaken your first impression."],
              ["03", "Skill map", "Organize detected skills and discover growth opportunities."]
            ].map(([number, title, copy]) => (
              <article key={number} className="feature-card">
                <span className="feature-number">{number}</span>
                <h3 className="feature-title">{title}</h3>
                <p className="feature-copy">{copy}</p>
              </article>
            ))}
          </section>
        )}

        {/* Analysis Results View */}
        {result && (
          <section aria-label="Resume analysis" className="results-section">
            <div className="results-heading">
              <div>
                <p className="eyebrow">Your personalized report</p>
                <h2 className="results-title">Analysis for {result.filename}</h2>
              </div>
              <span className="complete-badge">Analysis complete</span>
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
                  <p className="eyebrow">Your improvement plan</p>
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
                <h2 className="panel-title">Extracted resume preview</h2>
                <pre className="preview-text">{result.previewText}</pre>
              </section>
            )}
          </section>
        )}
      </section>

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
