import React, { useState } from "react";
import API from "../services/api";
import "./JDMatcher.css";

function JDMatcher({ currentResumeText = "", currentFilename = "" }) {
  const [resumeText, setResumeText] = useState(currentResumeText || "");
  const [jdText, setJdText] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleMatch = async () => {
    if (!resumeText.trim()) {
      setError("Please provide your resume text or upload a PDF first.");
      return;
    }
    if (!jdText.trim()) {
      setError("Please paste the Target Job Description text.");
      return;
    }

    setError("");
    setLoading(true);
    setResult(null);

    try {
      const response = await API.matchJobDescription(resumeText, jdText);
      if (response.success && response.data) {
        setResult(response.data);
      } else {
        throw new Error("Job description match calculation failed.");
      }
    } catch (err) {
      setError(err.message || "Failed to compare resume with job description.");
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 85) return "#51d990";
    if (score >= 70) return "#75a7ff";
    if (score >= 55) return "#f6bc5a";
    return "#ef6b79";
  };

  return (
    <section className="jd-matcher-card">
      <header className="jd-matcher-header">
        <div>
          <span className="eyebrow-pill">🎯 Career Matcher</span>
          <h2 className="jd-matcher-title">Job Description vs Resume Matcher</h2>
          <p className="jd-matcher-sub">
            Compare your resume against any target job posting to find keyword gaps and skill overlaps instantly.
          </p>
        </div>
      </header>

      <div className="jd-inputs-grid">
        {/* Resume Input Box */}
        <div className="jd-input-box">
          <div className="input-box-header">
            <label htmlFor="jd-resume-input">📄 Your Resume Content</label>
            {currentFilename && (
              <span className="loaded-tag">✓ Loaded from {currentFilename}</span>
            )}
          </div>
          <textarea
            id="jd-resume-input"
            value={resumeText}
            onChange={(e) => setResumeText(e.target.value)}
            placeholder="Paste your resume text here (or upload a PDF resume on the Analyzer tab to populate automatically)..."
            rows={8}
            className="jd-textarea"
          />
        </div>

        {/* JD Input Box */}
        <div className="jd-input-box">
          <div className="input-box-header">
            <label htmlFor="jd-target-input">💼 Target Job Description</label>
            <span className="req-tag">Required</span>
          </div>
          <textarea
            id="jd-target-input"
            value={jdText}
            onChange={(e) => setJdText(e.target.value)}
            placeholder="Paste the Job Description from LinkedIn, Indeed, Glassdoor, etc..."
            rows={8}
            className="jd-textarea"
          />
        </div>
      </div>

      {error && <div className="jd-error-pill">⚠️ {error}</div>}

      <div className="jd-action-bar">
        <button
          type="button"
          onClick={handleMatch}
          disabled={loading || !resumeText.trim() || !jdText.trim()}
          className="jd-calculate-btn"
        >
          {loading ? "Calculating Match..." : "⚡ Compare Resume & Job Description"}
        </button>
      </div>

      {/* Match Results View */}
      {result && (
        <div className="jd-results-container">
          <div className="jd-results-summary-row">
            {/* Score Meter */}
            <div className="match-score-card">
              <div
                className="match-gauge-circle"
                style={{
                  background: `conic-gradient(${getScoreColor(result.match_percentage)} ${result.match_percentage * 3.6}deg, rgba(255,255,255,0.1) 0deg)`
                }}
              >
                <div className="gauge-inner">
                  <span className="score-val" style={{ color: getScoreColor(result.match_percentage) }}>
                    {result.match_percentage}%
                  </span>
                  <span className="score-lbl">Match Score</span>
                </div>
              </div>
              <div className="grade-pill-tag" style={{ background: getScoreColor(result.match_percentage) }}>
                {result.resume_grade}
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="match-metrics-grid">
              <div className="metric-box">
                <span className="metric-num">{result.matched_skill_count} / {result.job_skill_count}</span>
                <span className="metric-lbl">Matched Skills</span>
              </div>
              <div className="metric-box">
                <span className="metric-num">{result.keyword_score}%</span>
                <span className="metric-lbl">Keyword Coverage</span>
              </div>
              <div className="metric-box">
                <span className="metric-num">{result.semantic_score}%</span>
                <span className="metric-lbl">Semantic Relevance</span>
              </div>
            </div>
          </div>

          {/* Skill Comparison Breakdown */}
          <div className="skills-comparison-grid">
            {/* Matched Skills */}
            <div className="skills-column matched-col">
              <h4 className="column-title">
                <span>✓ Matched Skills</span>
                <span className="count-badge green">{result.matched_skills.length}</span>
              </h4>
              <div className="tags-flex">
                {result.matched_skills.length > 0 ? (
                  result.matched_skills.map((skill) => (
                    <span key={skill} className="skill-tag green-tag">✓ {skill}</span>
                  ))
                ) : (
                  <p className="empty-tag-note">No exact skill overlap detected.</p>
                )}
              </div>
            </div>

            {/* Missing Skills */}
            <div className="skills-column missing-col">
              <h4 className="column-title">
                <span>⚠️ Missing Required Skills</span>
                <span className="count-badge red">{result.missing_skills.length}</span>
              </h4>
              <div className="tags-flex">
                {result.missing_skills.length > 0 ? (
                  result.missing_skills.map((skill) => (
                    <span key={skill} className="skill-tag red-tag">+ Add {skill}</span>
                  ))
                ) : (
                  <p className="empty-tag-note">Outstanding! All identified JD skills are present in your resume.</p>
                )}
              </div>
            </div>
          </div>

          {/* Recommendations List */}
          {result.recommendations && result.recommendations.length > 0 && (
            <div className="jd-recommendations-panel">
              <h4 className="panel-title">💡 Actionable Optimization Steps</h4>
              <ul className="rec-step-list">
                {result.recommendations.map((step, idx) => (
                  <li key={idx}>{step}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </section>
  );
}

export default JDMatcher;
