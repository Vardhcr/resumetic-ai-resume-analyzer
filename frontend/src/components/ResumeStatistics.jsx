function ResumeStatistics({ statistics = {} }) {
  const {
    word_count = 0,
    estimated_pages = 0,
    total_skills = 0,
    completed_sections = 0,
    missing_sections = 0,
    ats_score = 0,
    resume_grade = "N/A"
  } = statistics;

  const cards = [
    { title: "Word Count", value: word_count, icon: "📝", color: "#3b82f6" },
    { title: "Estimated Pages", value: estimated_pages, icon: "📄", color: "#8b5cf6" },
    { title: "Detected Skills", value: total_skills, icon: "💡", color: "#22c55e" },
    { title: "Sections Found", value: completed_sections, icon: "✅", color: "#14b8a6" },
    { title: "Missing Sections", value: missing_sections, icon: "⚠️", color: "#ef4444" },
    { title: "Resume Grade", value: resume_grade, icon: "🏆", color: "#f59e0b" }
  ];

  return (
    <div className="card-container">
      <h2 style={{ color: "#ffffff", marginBottom: "20px", fontSize: "1.45rem" }}>
        Resume Statistics
      </h2>

      <div className="stats-cards-grid">
        {cards.map((card, index) => (
          <div key={index} className="stat-card" style={{ borderColor: `${card.color}40` }}>
            <div className="stat-card-top">
              <span className="stat-card-icon">{card.icon}</span>
              <div style={{ width: 12, height: 12, borderRadius: "50%", background: card.color }} />
            </div>
            <div className="stat-card-value" style={{ color: card.color }}>{card.value}</div>
            <p className="stat-card-title">{card.title}</p>
          </div>
        ))}
      </div>

      <div className="progress-container">
        <div className="progress-info">
          <span>Overall ATS Optimization</span>
          <strong>{ats_score}%</strong>
        </div>
        <div className="progress-track">
          <div
            className="progress-bar-fill"
            style={{
              width: `${ats_score}%`,
              background:
                ats_score >= 90
                  ? "#22c55e"
                  : ats_score >= 75
                  ? "#3b82f6"
                  : ats_score >= 60
                  ? "#f59e0b"
                  : "#ef4444"
            }}
          />
        </div>
      </div>

      <div style={{ marginTop: "24px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "16px" }}>
        <div style={{ background: "#1f2937", borderRadius: "14px", padding: "16px" }}>
          <h3 style={{ color: "#60a5fa", margin: "0 0 8px 0", fontSize: "1.05rem" }}>📊 Resume Health</h3>
          <p style={{ color: "#cbd5e1", margin: 0, fontSize: "0.88rem", lineHeight: "1.6" }}>
            Your statistics summarize completeness, technical breadth, and ATS readiness.
          </p>
        </div>

        <div style={{ background: "#1f2937", borderRadius: "14px", padding: "16px" }}>
          <h3 style={{ color: "#22c55e", margin: "0 0 8px 0", fontSize: "1.05rem" }}>🚀 AI Suggestion</h3>
          <p style={{ color: "#cbd5e1", margin: 0, fontSize: "0.88rem", lineHeight: "1.6" }}>
            Increasing measurable achievements and missing technical keywords will improve both ATS scoring and recruiter impressions.
          </p>
        </div>
      </div>
    </div>
  );
}

export default ResumeStatistics;