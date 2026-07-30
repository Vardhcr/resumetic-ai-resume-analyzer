function ResumeGrade({ grade = "N/A", atsScore = 0 }) {
  const getGradeConfig = () => {
    switch (grade) {
      case "A+":
        return {
          color: "#22c55e",
          bg: "linear-gradient(135deg,#16a34a,#22c55e)",
          title: "Outstanding Resume",
          message: "Your resume is highly optimized for ATS systems and recruiter review."
        };
      case "A":
        return {
          color: "#3b82f6",
          bg: "linear-gradient(135deg,#2563eb,#3b82f6)",
          title: "Excellent Resume",
          message: "Your resume is well structured with only minor improvements remaining."
        };
      case "B+":
        return {
          color: "#06b6d4",
          bg: "linear-gradient(135deg,#0891b2,#06b6d4)",
          title: "Very Good Resume",
          message: "A strong resume with room to improve ATS optimization."
        };
      case "B":
        return {
          color: "#f59e0b",
          bg: "linear-gradient(135deg,#d97706,#f59e0b)",
          title: "Good Resume",
          message: "Your resume is decent but several improvements can increase interview chances."
        };
      case "C":
        return {
          color: "#fb923c",
          bg: "linear-gradient(135deg,#ea580c,#fb923c)",
          title: "Average Resume",
          message: "Consider improving skills, projects and resume structure."
        };
      case "D":
        return {
          color: "#ef4444",
          bg: "linear-gradient(135deg,#dc2626,#ef4444)",
          title: "Needs Improvement",
          message: "Your resume requires significant improvements before applying."
        };
      default:
        return {
          color: "#6b7280",
          bg: "linear-gradient(135deg,#4b5563,#6b7280)",
          title: "Resume Not Evaluated",
          message: "Upload a resume to generate an ATS score and grade."
        };
    }
  };

  const config = getGradeConfig();

  return (
    <div className="card-container" style={{ padding: 0, overflow: "hidden" }}>
      <div style={{ background: config.bg, padding: "20px clamp(16px, 3vw, 28px)", color: "#ffffff" }}>
        <h2 style={{ margin: 0, fontSize: "1.45rem", fontWeight: 700 }}>Resume Grade</h2>
        <p style={{ margin: "4px 0 0", opacity: 0.9, fontSize: "0.85rem" }}>AI Evaluation Summary</p>
      </div>

      <div style={{ padding: "clamp(18px, 3vw, 30px)" }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: "20px" }}>
          <div
            style={{
              width: "clamp(110px, 30vw, 150px)",
              height: "clamp(110px, 30vw, 150px)",
              borderRadius: "50%",
              background: config.bg,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#ffffff",
              fontSize: "clamp(36px, 10vw, 54px)",
              fontWeight: 800,
              boxShadow: `0 0 30px ${config.color}`
            }}
          >
            {grade}
          </div>
        </div>

        <h3 style={{ textAlign: "center", color: config.color, margin: "0 0 8px", fontSize: "1.3rem" }}>
          {config.title}
        </h3>

        <p style={{ textAlign: "center", color: "#cbd5e1", margin: "0 0 24px", fontSize: "0.9rem", lineHeight: "1.6" }}>
          {config.message}
        </p>

        <div className="progress-track">
          <div className="progress-bar-fill" style={{ width: `${atsScore}%`, background: config.bg }} />
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", color: "#94a3b8", fontSize: "0.85rem", marginTop: "8px" }}>
          <span>ATS Score</span>
          <strong style={{ color: "#ffffff" }}>{atsScore}/100</strong>
        </div>

        <div style={{ marginTop: "24px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "14px" }}>
          <div style={{ background: "#1f2937", padding: "14px", borderRadius: "14px", textAlign: "center" }}>
            <h4 style={{ color: config.color, margin: "0 0 6px", fontSize: "0.95rem" }}>Recruiter View</h4>
            <p style={{ color: "#d1d5db", margin: 0, fontSize: "0.82rem", lineHeight: "1.5" }}>
              ATS score and formatting quality determine screening success.
            </p>
          </div>

          <div style={{ background: "#1f2937", padding: "14px", borderRadius: "14px", textAlign: "center" }}>
            <h4 style={{ color: config.color, margin: "0 0 6px", fontSize: "0.95rem" }}>Recommendation</h4>
            <p style={{ color: "#d1d5db", margin: 0, fontSize: "0.82rem", lineHeight: "1.5" }}>
              Continue adding relevant projects, achievements, and keywords.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ResumeGrade;