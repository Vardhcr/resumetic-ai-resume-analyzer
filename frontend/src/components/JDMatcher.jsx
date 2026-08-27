import React, { useEffect, useState } from "react";
import API from "../services/api";
import "./JDMatcher.css";

function JDMatcher({
  currentResumeText = "",
  currentFilename = ""
}) {
  const [resumeText, setResumeText] = useState(currentResumeText || "");
  const [jobTitle, setJobTitle] = useState("");
  const [jdText, setJdText] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setResumeText(currentResumeText || "");
  }, [currentResumeText]);

  const handleJobGapAnalysis = async () => {
    if (!resumeText.trim()) {
      setError("Please upload a resume in the Resume Analyzer first.");
      return;
    }

    if (!jobTitle.trim()) {
      setError("Please enter the job you are seeking.");
      return;
    }

    if (!jdText.trim()) {
      setError("Please paste the target Job Description.");
      return;
    }

    setError("");
    setLoading(true);
    setResult(null);

    try {
      const response = await API.analyzeJobGap({
        resumeText,
        jdText,
        jobTitle,
      });

      if (response?.success && response?.data) {
        setResult(response.data);
      } else {
        throw new Error("Job gap analysis could not be completed.");
      }
    } catch (err) {
      console.error("Job Gap Analysis Error:", err);

      const serverDetail =
        err.response?.data?.detail ||
        err.response?.data?.message;

      setError(
        serverDetail ||
        err.message ||
        "Failed to analyze the skill gap."
      );
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

  const overallMatch = result?.overall_match || {};
  const skillGap = result?.skill_gap || {};
  const recommendations = Array.isArray(result?.recommendations)
    ? result.recommendations
    : [];

  const matchPercentage = Number(overallMatch.match_percentage || 0);
  const coveragePercentage = Number(skillGap.coverage_percentage || 0);

  return (
    <section className="jd-matcher-card">
      <header className="jd-matcher-header">
        <div>
          <span className="eyebrow-pill">Career Gap Analysis</span>

          <h2 className="jd-matcher-title">
            Discover Your Job Skill Gap
          </h2>

          <p className="jd-matcher-sub">
            Compare your current resume skills with the skills required
            for your target role and get a practical learning path for
            the gaps we find.
          </p>
        </div>
      </header>

      <div className="jd-inputs-grid">
        {/* Target Job */}
        <div className="jd-input-box">
          <div className="input-box-header">
            <label htmlFor="job-title-input">
              What job are you seeking?
            </label>

            <span className="req-tag">Required</span>
          </div>

          <input
            id="job-title-input"
            type="text"
            value={jobTitle}
            onChange={(e) => setJobTitle(e.target.value)}
            placeholder="Example: Backend Engineer"
            className="jd-text-input"
          />

          <p className="input-helper">
            Enter the exact role you want to prepare for.
          </p>
        </div>

        {/* Resume */}
        <div className="jd-input-box">
          <div className="input-box-header">
            <label htmlFor="jd-resume-input">
              Your Resume
            </label>

            {currentFilename && (
              <span className="loaded-tag">
                ✓ Loaded from {currentFilename}
              </span>
            )}
          </div>

          <textarea
            id="jd-resume-input"
            value={resumeText}
            onChange={(e) => setResumeText(e.target.value)}
            placeholder="Upload a resume from the Resume Analyzer first..."
            rows={5}
            className="jd-textarea"
          />

          <p className="input-helper">
            Your extracted resume content is used for the comparison.
          </p>
        </div>

        {/* Job Description */}
        <div className="jd-input-box jd-full-width">
          <div className="input-box-header">
            <label htmlFor="jd-target-input">
              Target Job Description
            </label>

            <span className="req-tag">Required</span>
          </div>

          <textarea
            id="jd-target-input"
            value={jdText}
            onChange={(e) => setJdText(e.target.value)}
            placeholder="Paste the complete Job Description here..."
            rows={9}
            className="jd-textarea"
          />

          <p className="input-helper">
            Include the required skills, technologies, qualifications,
            and responsibilities whenever possible.
          </p>
        </div>
      </div>

      {error && (
        <div className="jd-error-pill" role="alert">
          ⚠️ {error}
        </div>
      )}

      <div className="jd-action-bar">
        <button
          type="button"
          onClick={handleJobGapAnalysis}
          disabled={
            loading ||
            !resumeText.trim() ||
            !jobTitle.trim() ||
            !jdText.trim()
          }
          className="jd-calculate-btn"
        >
          {loading
            ? "Analyzing Your Job Gap..."
            : "Analyze My Job Gap"}
        </button>
      </div>

      {/* Results */}
      {result && (
        <div className="jd-results-container">
          {/* Target Role */}
          <div className="target-role-banner">
            <span className="target-role-label">
              Target Role
            </span>

            <h3>{result.job_title || jobTitle}</h3>

            <p>
              Here's how your current resume compares with this
              position.
            </p>
          </div>

          {/* Match Summary */}
          <div className="jd-results-summary-row">
            <div className="match-score-card">
              <div
                className="match-gauge-circle"
                style={{
                  background: `conic-gradient(
                    ${getScoreColor(matchPercentage)}
                    ${matchPercentage * 3.6}deg,
                    rgba(255,255,255,0.1) 0deg
                  )`
                }}
              >
                <div className="gauge-inner">
                  <span
                    className="score-val"
                    style={{
                      color: getScoreColor(matchPercentage)
                    }}
                  >
                    {matchPercentage}%
                  </span>

                  <span className="score-lbl">
                    Job Match
                  </span>
                </div>
              </div>

              <div
                className="grade-pill-tag"
                style={{
                  background: getScoreColor(matchPercentage)
                }}
              >
                {overallMatch.resume_grade || "Analyzed"}
              </div>
            </div>

            <div className="match-metrics-grid">
              <div className="metric-box">
                <span className="metric-num">
                  {skillGap.matched_skill_count || 0}
                </span>

                <span className="metric-lbl">
                  Matched Skills
                </span>
              </div>

              <div className="metric-box">
                <span className="metric-num">
                  {skillGap.missing_skill_count || 0}
                </span>

                <span className="metric-lbl">
                  Skill Gaps
                </span>
              </div>

              <div className="metric-box">
                <span className="metric-num">
                  {coveragePercentage}%
                </span>

                <span className="metric-lbl">
                  Skill Coverage
                </span>
              </div>
            </div>
          </div>

          {/* Detailed Scores */}
          <div className="detail-score-grid">
            <div className="metric-box">
              <span className="metric-num">
                {overallMatch.keyword_score || 0}%
              </span>

              <span className="metric-lbl">
                Keyword Match
              </span>
            </div>

            <div className="metric-box">
              <span className="metric-num">
                {overallMatch.semantic_score || 0}%
              </span>

              <span className="metric-lbl">
                Semantic Relevance
              </span>
            </div>

            <div className="metric-box">
              <span className="metric-num">
                {skillGap.required_skill_count || 0}
              </span>

              <span className="metric-lbl">
                Required Skills
              </span>
            </div>
          </div>

          {/* Skill Match Snapshot */}
          {result.skill_gap && (
            <div className="skill-match-snapshot">
              <div className="snapshot-header">
                <div>
                  <span className="snapshot-eyebrow">🎯 Skill Match Snapshot</span>
                  <h3 className="snapshot-title">
                    How your skills compare with the target role
                  </h3>
                  <p className="snapshot-description">
                    Based on the skills identified from your job description
                    and the skills detected in your resume.
                  </p>
                </div>

                <div className="snapshot-coverage">
                  <span className="coverage-value">
                    {result.skill_gap.coverage_percentage}%
                  </span>
                  <span className="coverage-label">Skill Coverage</span>
                </div>
              </div>

              {/* Coverage Progress */}
              <div className="skill-progress-section">
                <div className="skill-progress-labels">
                  <span>
                    {result.skill_gap.matched_skill_count} of{" "}
                    {result.skill_gap.required_skill_count} required skills
                    matched
                  </span>
                  <span>
                    {result.skill_gap.missing_skill_count} skill
                    {result.skill_gap.missing_skill_count === 1 ? "" : "s"} to
                    develop
                  </span>
                </div>

                <div className="skill-progress-track">
                  <div
                    className="skill-progress-fill"
                    style={{
                      width: `${Math.min(
                        Math.max(result.skill_gap.coverage_percentage, 0),
                        100
                      )}%`
                    }}
                  />
                </div>
              </div>

              {/* Required vs Resume Skills */}
              <div className="skill-snapshot-grid">
                <div className="snapshot-column required-skills-panel">
                  <div className="snapshot-column-header">
                    <div>
                      <span className="snapshot-column-icon">💼</span>
                      <span className="snapshot-column-title">
                        Skills Required for This Role
                      </span>
                    </div>

                    <span className="snapshot-count required-count">
                      {result.skill_gap.required_skill_count}
                    </span>
                  </div>

                  <div className="snapshot-tags">
                    {[
                      ...(result.skill_gap.matched_skills || []),
                      ...(result.skill_gap.missing_skills || [])
                    ].map((skill) => {
                      const isMatched = (
                        result.skill_gap.matched_skills || []
                      ).includes(skill);

                      return (
                        <span
                          key={`required-${skill}`}
                          className={`snapshot-skill-tag ${
                            isMatched
                              ? "required-matched-tag"
                              : "required-missing-tag"
                          }`}
                        >
                          {isMatched ? "✓" : "!"} {skill}
                        </span>
                      );
                    })}
                  </div>
                </div>

                <div className="snapshot-column resume-skills-panel">
                  <div className="snapshot-column-header">
                    <div>
                      <span className="snapshot-column-icon">📄</span>
                      <span className="snapshot-column-title">
                        Skills Detected in Your Resume
                      </span>
                    </div>

                    <span className="snapshot-count resume-count">
                      {result.skill_gap.matched_skill_count}
                    </span>
                  </div>

                  <div className="snapshot-tags">
                    {result.skill_gap.matched_skills?.length > 0 ? (
                      result.skill_gap.matched_skills.map((skill) => (
                        <span
                          key={`resume-${skill}`}
                          className="snapshot-skill-tag resume-skill-tag"
                        >
                          ✓ {skill}
                        </span>
                      ))
                    ) : (
                      <p className="snapshot-empty">
                        No matching skills were detected.
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Missing Skills Summary */}
              {result.skill_gap.missing_skills?.length > 0 && (
                <div className="snapshot-gap-summary">
                  <div className="gap-summary-icon">⚠</div>

                  <div className="gap-summary-content">
                    <strong>
                      Your resume is missing{" "}
                      {result.skill_gap.missing_skill_count} required skill
                      {result.skill_gap.missing_skill_count === 1 ? "" : "s"}.
                    </strong>

                    <p>
                      These skills were identified in the target job
                      description but were not detected in your submitted
                      resume.
                    </p>

                    <div className="gap-summary-tags">
                      {result.skill_gap.missing_skills.map((skill) => (
                        <span
                          key={`gap-summary-${skill}`}
                          className="gap-summary-tag"
                        >
                          + {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Skills Comparison */}
          <div className="skills-comparison-grid">
            <div className="skills-column matched-col">
              <h4 className="column-title">
                <span>✓ Skills You Already Have</span>

                <span className="count-badge green">
                  {skillGap.matched_skill_count || 0}
                </span>
              </h4>

              <div className="tags-flex">
                {skillGap.matched_skills?.length > 0 ? (
                  skillGap.matched_skills.map((skill) => (
                    <span
                      key={skill}
                      className="skill-tag green-tag"
                    >
                      ✓ {skill}
                    </span>
                  ))
                ) : (
                  <p className="empty-tag-note">
                    No matching skills were detected.
                  </p>
                )}
              </div>
            </div>

            <div className="skills-column missing-col">
              <h4 className="column-title">
                <span>⚠ Skills You Need to Develop</span>

                <span className="count-badge red">
                  {skillGap.missing_skill_count || 0}
                </span>
              </h4>

              <div className="tags-flex">
                {skillGap.missing_skills?.length > 0 ? (
                  skillGap.missing_skills.map((skill) => (
                    <span
                      key={skill}
                      className="skill-tag red-tag"
                    >
                      + {skill}
                    </span>
                  ))
                ) : (
                  <p className="empty-tag-note">
                    Excellent! No skill gaps were detected.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Learning Path */}
          {recommendations.length > 0 && (
            <section className="jd-recommendations-panel">
              <div className="learning-header">
                <div>
                  <span className="eyebrow-pill">
                    Your Learning Path
                  </span>

                  <h4 className="panel-title">
                    How to Close Your Skill Gap
                  </h4>
                </div>
              </div>

              <div className="learning-resource-list">
                {recommendations.map((recommendation) => (
                  <article
                    key={recommendation.skill}
                    className="learning-resource-card"
                  >
                    <div className="learning-resource-header">
                      <h5>{recommendation.skill}</h5>

                      <span className="skill-gap-label">
                        Skill Gap
                      </span>
                    </div>

                    {recommendation.free_courses?.length > 0 && (
                      <div className="resource-group">
                        <h6>Free Learning Resources</h6>

                        {recommendation.free_courses.map(
                          (course) => (
                            <a
                              key={`${recommendation.skill}-${course.title}`}
                              href={course.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="resource-link"
                            >
                              <strong>{course.title}</strong>
                              <span>{course.provider}</span>
                            </a>
                          )
                        )}
                      </div>
                    )}

                    {recommendation.free_practice?.length > 0 && (
                      <div className="resource-group">
                        <h6>Free Practice / Job Simulation</h6>

                        {recommendation.free_practice.map(
                          (practice) => (
                            <a
                              key={`${recommendation.skill}-${practice.title}`}
                              href={practice.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="resource-link practice-link"
                            >
                              <strong>{practice.title}</strong>
                              <span>{practice.provider}</span>
                            </a>
                          )
                        )}
                      </div>
                    )}
                  </article>
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </section>
  );
}

export default JDMatcher;