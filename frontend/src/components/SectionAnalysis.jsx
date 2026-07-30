function SectionAnalysis({
  sections = {},
  summary = {}
}) {
  const foundSections = Object.entries(sections)
    .filter(([, value]) => value)
    .map(([key]) => key);

  const missingSections = Object.entries(sections)
    .filter(([, value]) => !value)
    .map(([key]) => key);

  return (
    <div className="card-container">
      <h2 style={{ color: "#ffffff", textAlign: "center", marginBottom: "20px", fontSize: "1.45rem" }}>
        Resume Section Analysis
      </h2>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "14px", marginBottom: "24px" }}>
        <div style={{ background: "#1f2937", padding: "16px 12px", borderRadius: "14px", textAlign: "center" }}>
          <h2 style={{ color: "#22c55e", margin: "0 0 4px", fontSize: "1.8rem" }}>{summary.found || foundSections.length}</h2>
          <p style={{ color: "#d1d5db", margin: 0, fontSize: "0.85rem" }}>Sections Found</p>
        </div>

        <div style={{ background: "#1f2937", padding: "16px 12px", borderRadius: "14px", textAlign: "center" }}>
          <h2 style={{ color: "#ef4444", margin: "0 0 4px", fontSize: "1.8rem" }}>{summary.missing || missingSections.length}</h2>
          <p style={{ color: "#d1d5db", margin: 0, fontSize: "0.85rem" }}>Missing Sections</p>
        </div>

        <div style={{ background: "#1f2937", padding: "16px 12px", borderRadius: "14px", textAlign: "center" }}>
          <h2 style={{ color: "#3b82f6", margin: "0 0 4px", fontSize: "1.8rem" }}>{summary.completion_percentage || 0}%</h2>
          <p style={{ color: "#d1d5db", margin: 0, fontSize: "0.85rem" }}>Completion Rate</p>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "16px" }}>
        <div className="section-box section-status-found">
          <h3 style={{ color: "#22c55e", margin: "0 0 12px", fontSize: "1.1rem" }}>✅ Sections Present</h3>
          {foundSections.length === 0 ? (
            <p style={{ color: "#94a3b8", margin: 0 }}>No sections detected.</p>
          ) : (
            <ul style={{ color: "#e5e7eb", lineHeight: "1.7", margin: 0, paddingLeft: "20px", fontSize: "0.9rem" }}>
              {foundSections.map((section, index) => (
                <li key={index}>{section}</li>
              ))}
            </ul>
          )}
        </div>

        <div className="section-box section-status-missing">
          <h3 style={{ color: "#ef4444", margin: "0 0 12px", fontSize: "1.1rem" }}>❌ Missing Sections</h3>
          {missingSections.length === 0 ? (
            <p style={{ color: "#22c55e", margin: 0 }}>Excellent! No missing sections detected.</p>
          ) : (
            <ul style={{ color: "#e5e7eb", lineHeight: "1.7", margin: 0, paddingLeft: "20px", fontSize: "0.9rem" }}>
              {missingSections.map((section, index) => (
                <li key={index}>{section}</li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div style={{ marginTop: "20px", background: "#1f2937", padding: "16px", borderRadius: "14px" }}>
        <h3 style={{ color: "#60a5fa", margin: "0 0 8px", fontSize: "1.05rem" }}>AI Insight</h3>
        <p style={{ color: "#cbd5e1", margin: 0, fontSize: "0.88rem", lineHeight: "1.6" }}>
          Recruiters generally expect Education, Technical Skills, Experience, and Achievements. Completing missing sections improves ATS score and candidate rating.
        </p>
      </div>
    </div>
  );
}

export default SectionAnalysis;