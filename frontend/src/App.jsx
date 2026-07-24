import { useRef, useState } from "react";

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
  const [selectedFile, setSelectedFile] = useState(null);
  const [result, setResult] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const openFilePicker = () => fileInputRef.current?.click();

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";

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
      const { data } = await API.post("/resume/upload", formData);

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
    } catch (uploadError) {
      const serverMessage = uploadError.response?.data?.detail || uploadError.response?.data?.message;
      const isNetworkError = !uploadError.response;
      setError(
        serverMessage ||
          (isNetworkError
            ? "Unable to reach the resume analyzer. Please check your connection and try again in a moment."
            : "Upload failed. Please try again.")
      );
    } finally {
      setLoading(false);
    }
  };

  const analysis = result?.analysis || emptyAnalysis;

  return (
    <main style={styles.page}>
      <div aria-hidden="true" style={styles.orbOne} />
      <div aria-hidden="true" style={styles.orbTwo} />
      <div aria-hidden="true" style={styles.grid} />

      <section style={styles.shell}>
        <nav style={styles.nav} aria-label="Primary navigation">
          <div style={styles.brand}><span style={styles.brandMark}>✦</span> RESUMETIC</div>
          <span style={styles.navNote}>AI-powered career review</span>
        </nav>

        <header style={styles.hero}>
          <div style={styles.heroCopy}>
            <p style={styles.eyebrow}><span style={styles.liveDot} /> Instant ATS analysis</p>
            <h1 style={styles.title}>Turn your resume into your <span style={styles.titleAccent}>next opportunity.</span></h1>
            <p style={styles.subtitle}>
              See exactly what recruiters and applicant tracking systems see—then make every section stronger.
            </p>
            <div style={styles.trustRow}>
              <span>✓ PDF-ready</span><span>✓ Skill insights</span><span>✓ Actionable feedback</span>
            </div>
          </div>

          <div style={styles.heroArt} aria-hidden="true">
            <div style={styles.resumeCard}>
              <div style={styles.resumeTop}><div style={styles.avatar}>A</div><div><div style={styles.lineLong} /><div style={styles.lineShort} /></div></div>
              <div style={styles.resumeBar}><span /><span /><span /></div>
              <div style={styles.artRow}><div style={styles.artBlock}><div style={styles.lineMedium} /><div style={styles.lineLong} /><div style={styles.lineMedium} /></div><div style={styles.scoreBadge}>92<small>ATS</small></div></div>
              <div style={styles.skillsCloud}><i>React</i><i>Python</i><i>Cloud</i><i>SQL</i></div>
            </div>
            <div style={styles.floatingTick}>✓</div>
            <div style={styles.floatingSpark}>✦</div>
          </div>
        </header>

        <section style={styles.uploadPanel} aria-label="Resume upload">
          <div style={styles.uploadIcon} aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" style={iconStyle}><path d="M12 16V3m0 0L7 8m5-5 5 5M5 15v4a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-4" /></svg>
          </div>
          <div style={{ flex: 1 }}>
            <h2 style={styles.uploadTitle}>Ready when you are</h2>
            <p style={styles.uploadText}>Upload your resume and receive a complete analysis in seconds.</p>
          </div>
          <input ref={fileInputRef} type="file" accept="application/pdf,.pdf" onChange={handleFileChange} hidden />
          <button type="button" onClick={openFilePicker} disabled={loading} style={{ ...styles.uploadButton, ...(loading ? styles.disabledButton : {}) }}>
            {loading ? "Analyzing your resume..." : "Upload PDF"}
            {!loading && <span aria-hidden="true">→</span>}
          </button>
        </section>

        <div aria-live="polite" style={styles.statusArea}>
          {selectedFile && <span style={styles.filePill}>📄 {selectedFile.name}</span>}
          {message && <span role="status" style={styles.successPill}>✓ {message}</span>}
          {error && <span role="alert" style={styles.errorPill}>{error}</span>}
        </div>

        {!result && !loading && (
          <section style={styles.featureGrid} aria-label="Analysis features">
            {[ ["01", "ATS score", "Measure how well your resume is optimized for screening systems."], ["02", "Section review", "Find missing essentials that can weaken your first impression."], ["03", "Skill map", "Organize detected skills and discover growth opportunities."] ].map(([number, title, copy]) => (
              <article key={number} style={styles.featureCard}><span style={styles.featureNumber}>{number}</span><h3 style={styles.featureTitle}>{title}</h3><p style={styles.featureCopy}>{copy}</p></article>
            ))}
          </section>
        )}

        {result && (
          <section aria-label="Resume analysis" style={styles.results}>
            <div style={styles.resultHeading}><div><p style={styles.eyebrow}>Your personalized report</p><h2 style={styles.resultsTitle}>Analysis for {result.filename}</h2></div><span style={styles.completeBadge}>Analysis complete</span></div>
            <div style={styles.scoreGrid}><ATSScoreCard atsScore={analysis.ats_score} grade={analysis.resume_grade} statistics={analysis.statistics} feedback={result.feedback} breakdown={analysis.score_breakdown} rawPoints={analysis.raw_points} maximumPoints={analysis.maximum_points} candidateProfile={analysis.candidate_profile} /></div>
            <ResumeStatistics statistics={analysis.statistics} />
            <SectionAnalysis sections={analysis.sections} summary={result.sectionSummary} />
            <SkillsSection skills={analysis.skills} />

            <section style={styles.recommendationPanel}>
              <div style={styles.panelHeading}><span style={styles.panelIcon}>✦</span><div><p style={styles.eyebrow}>Your improvement plan</p><h2 style={styles.panelTitle}>Recommendations</h2></div></div>
              {analysis.recommendations.length ? <ol style={styles.recommendations}>{analysis.recommendations.map((recommendation) => <li key={recommendation}>{recommendation}</li>)}</ol> : <p style={styles.emptyText}>No recommendations are available.</p>}
            </section>

            {result.previewText && <section style={styles.previewPanel}><h2 style={styles.panelTitle}>Extracted resume preview</h2><pre style={styles.previewText}>{result.previewText}</pre></section>}
          </section>
        )}
      </section>
    </main>
  );
}

const styles = {
  page: { minHeight: "100vh", position: "relative", overflow: "hidden", padding: "24px 20px 72px", color: "#eaf0ff", background: "radial-gradient(circle at 15% 6%, #23356e 0, transparent 27%), radial-gradient(circle at 90% 20%, #432465 0, transparent 26%), #090d1b" },
  shell: { maxWidth: 1160, margin: "0 auto", position: "relative", zIndex: 1 },
  orbOne: { position: "absolute", width: 420, height: 420, borderRadius: "50%", filter: "blur(12px)", opacity: 0.25, background: "#4766e9", top: -220, left: -180 },
  orbTwo: { position: "absolute", width: 380, height: 380, borderRadius: "50%", filter: "blur(18px)", opacity: 0.18, background: "#c15bea", top: 280, right: -180 },
  grid: { position: "absolute", inset: 0, opacity: 0.16, backgroundImage: "linear-gradient(#8193ce1c 1px, transparent 1px), linear-gradient(90deg, #8193ce1c 1px, transparent 1px)", backgroundSize: "42px 42px", maskImage: "linear-gradient(to bottom, black, transparent 82%)" },
  nav: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 2px 48px" },
  brand: { display: "flex", alignItems: "center", gap: 10, fontSize: 15, letterSpacing: "0.14em", fontWeight: 800 },
  brandMark: { display: "grid", placeItems: "center", width: 30, height: 30, borderRadius: 10, color: "#0d1020", background: "linear-gradient(135deg, #83a6ff, #d886ff)" },
  navNote: { color: "#9aa8cb", fontSize: 14 },
  hero: { display: "grid", gridTemplateColumns: "minmax(0, 1.2fr) minmax(300px, .8fr)", gap: 48, alignItems: "center", padding: "0 4% 32px" },
  heroCopy: { maxWidth: 670 },
  eyebrow: { display: "flex", alignItems: "center", gap: 8, margin: "0 0 14px", color: "#9fafff", fontSize: 12, letterSpacing: "0.12em", fontWeight: 800, textTransform: "uppercase" },
  liveDot: { width: 8, height: 8, borderRadius: "50%", background: "#58e5a1", boxShadow: "0 0 0 5px #58e5a122" },
  title: { margin: 0, maxWidth: 650, color: "#f4f6ff", fontSize: "clamp(44px, 6.2vw, 76px)", lineHeight: 1.02, letterSpacing: "-0.055em", fontWeight: 800 },
  titleAccent: { color: "#9caeff" },
  subtitle: { maxWidth: 575, margin: "24px 0", color: "#b7c2df", fontSize: 18, lineHeight: 1.65 },
  trustRow: { display: "flex", flexWrap: "wrap", gap: 18, color: "#c7d0ea", fontSize: 14, fontWeight: 600 },
  heroArt: { minHeight: 320, position: "relative", display: "grid", placeItems: "center" },
  resumeCard: { width: "min(320px, 82%)", padding: 24, border: "1px solid #9dabee42", borderRadius: 24, transform: "rotate(5deg)", background: "linear-gradient(145deg, #26365fdd, #141b35e8)", boxShadow: "-18px 25px 60px #03050b99, inset 0 1px #ffffff1c", backdropFilter: "blur(12px)" },
  resumeTop: { display: "flex", alignItems: "center", gap: 12, paddingBottom: 20, borderBottom: "1px solid #a7b8ee24" }, avatar: { display: "grid", placeItems: "center", width: 39, height: 39, borderRadius: "50%", fontWeight: 800, background: "linear-gradient(135deg, #91a5ff, #d687ff)" },
  lineLong: { height: 7, width: 130, borderRadius: 8, background: "#e7edffb8", margin: "5px 0" }, lineMedium: { height: 6, width: 100, borderRadius: 8, background: "#cbd6ff78", margin: "9px 0" }, lineShort: { height: 5, width: 75, borderRadius: 8, background: "#b7c6ff52", margin: "5px 0" },
  resumeBar: { display: "flex", gap: 6, margin: "20px 0" }, artRow: { display: "flex", justifyContent: "space-between", alignItems: "center" }, artBlock: { flex: 1 }, scoreBadge: { display: "grid", placeItems: "center", width: 67, height: 67, borderRadius: "50%", color: "#9bf4c6", fontSize: 22, fontWeight: 800, border: "6px solid #56dd9f", boxShadow: "0 0 20px #56dd9f55" }, skillsCloud: { display: "flex", flexWrap: "wrap", gap: 7, marginTop: 19 },
  floatingTick: { position: "absolute", top: 35, right: 6, display: "grid", placeItems: "center", width: 42, height: 42, borderRadius: 14, color: "#0c1c16", fontWeight: 900, background: "#79efb5", boxShadow: "0 12px 24px #02071366" }, floatingSpark: { position: "absolute", bottom: 20, left: 16, display: "grid", placeItems: "center", width: 46, height: 46, borderRadius: "50%", color: "#fff", fontSize: 22, background: "#9369f3", boxShadow: "0 12px 24px #02071366" },
  uploadPanel: { display: "flex", alignItems: "center", gap: 20, padding: 24, border: "1px solid #8397ea3b", borderRadius: 22, background: "linear-gradient(100deg, #182242dc, #12182cd9)", boxShadow: "0 20px 50px #02050e5c", backdropFilter: "blur(14px)" },
  uploadIcon: { display: "grid", placeItems: "center", width: 50, height: 50, borderRadius: 16, color: "#bdc9ff", background: "#8399ff1a", border: "1px solid #9aacff38" }, uploadTitle: { margin: 0, color: "#f2f5ff", fontSize: 20 }, uploadText: { margin: "6px 0 0", color: "#9dabcf", lineHeight: 1.5 },
  uploadButton: { display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 15, minWidth: 153, border: 0, borderRadius: 13, padding: "14px 18px", color: "#101426", background: "linear-gradient(135deg, #b2c1ff, #d19bff)", boxShadow: "0 10px 25px #5e68d655", fontSize: 14, fontWeight: 800, cursor: "pointer" }, disabledButton: { cursor: "wait", opacity: 0.74 },
  statusArea: { display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 10, minHeight: 18, margin: "18px 0" }, filePill: { padding: "8px 13px", borderRadius: 999, color: "#c7d2f1", background: "#33415f7a", fontSize: 13 }, successPill: { padding: "8px 13px", borderRadius: 999, color: "#9cf0c4", background: "#21704a2b", fontSize: 13 }, errorPill: { padding: "8px 13px", borderRadius: 999, color: "#ffb6bb", background: "#872b422b", fontSize: 13 },
  featureGrid: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginTop: 42 }, featureCard: { padding: 24, border: "1px solid #8397ea2c", borderRadius: 18, background: "#151b31a6", backdropFilter: "blur(8px)" }, featureNumber: { color: "#aebcff", fontSize: 13, fontWeight: 800, letterSpacing: "0.1em" }, featureTitle: { margin: "22px 0 9px", color: "#eef2ff", fontSize: 19 }, featureCopy: { margin: 0, color: "#aeb9d5", fontSize: 14, lineHeight: 1.6 },
  results: { display: "grid", gap: 28, marginTop: 38 }, resultHeading: { display: "flex", justifyContent: "space-between", alignItems: "end", gap: 20, padding: "0 5px" }, resultsTitle: { margin: 0, color: "#f1f4ff", fontSize: "clamp(27px, 4vw, 38px)", letterSpacing: "-0.03em" }, completeBadge: { padding: "8px 12px", borderRadius: 999, color: "#96f0bd", background: "#2aa55d26", border: "1px solid #4ed58744", whiteSpace: "nowrap", fontSize: 13, fontWeight: 700 }, scoreGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 28, alignItems: "start" },
  recommendationPanel: { padding: 30, border: "1px solid #8d75e747", borderRadius: 22, background: "linear-gradient(120deg, #221b42, #13192f)", boxShadow: "0 18px 38px #04061166" }, panelHeading: { display: "flex", alignItems: "center", gap: 15, marginBottom: 20 }, panelIcon: { display: "grid", placeItems: "center", width: 45, height: 45, borderRadius: 14, color: "#25133e", fontSize: 20, background: "linear-gradient(135deg, #a8b8ff, #e1a1ff)" }, panelTitle: { margin: 0, color: "#f3f5ff", fontSize: 25 }, recommendations: { margin: 0, paddingLeft: 23, color: "#d8ddf2", lineHeight: 1.8 }, emptyText: { color: "#aeb9d5" }, previewPanel: { padding: 30, border: "1px solid #8397ea36", borderRadius: 22, background: "#12192cdd", boxShadow: "0 18px 38px #0406114c" }, previewText: { margin: "20px 0 0", color: "#c5cce2", whiteSpace: "pre-wrap", overflowWrap: "anywhere", fontFamily: "inherit", lineHeight: 1.65, textAlign: "left" },
};

export default App;
