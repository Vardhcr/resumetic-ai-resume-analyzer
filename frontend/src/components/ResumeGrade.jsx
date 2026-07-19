

function ResumeGrade({ grade = "N/A", atsScore = 0 }) {
  const getGradeConfig = () => {
    switch (grade) {
      case "A+":
        return {
          color: "#22c55e",
          bg: "linear-gradient(135deg,#16a34a,#22c55e)",
          title: "Outstanding Resume",
          message:
            "Your resume is highly optimized for ATS systems and recruiter review."
        };

      case "A":
        return {
          color: "#3b82f6",
          bg: "linear-gradient(135deg,#2563eb,#3b82f6)",
          title: "Excellent Resume",
          message:
            "Your resume is well structured with only minor improvements remaining."
        };

      case "B+":
        return {
          color: "#06b6d4",
          bg: "linear-gradient(135deg,#0891b2,#06b6d4)",
          title: "Very Good Resume",
          message:
            "A strong resume with room to improve ATS optimization."
        };

      case "B":
        return {
          color: "#f59e0b",
          bg: "linear-gradient(135deg,#d97706,#f59e0b)",
          title: "Good Resume",
          message:
            "Your resume is decent but several improvements can increase interview chances."
        };

      case "C":
        return {
          color: "#fb923c",
          bg: "linear-gradient(135deg,#ea580c,#fb923c)",
          title: "Average Resume",
          message:
            "Consider improving skills, projects and resume structure."
        };

      case "D":
        return {
          color: "#ef4444",
          bg: "linear-gradient(135deg,#dc2626,#ef4444)",
          title: "Needs Improvement",
          message:
            "Your resume requires significant improvements before applying."
        };

      default:
        return {
          color: "#6b7280",
          bg: "linear-gradient(135deg,#4b5563,#6b7280)",
          title: "Resume Not Evaluated",
          message:
            "Upload a resume to generate an ATS score and grade."
        };
    }
  };

  const config = getGradeConfig();

  return (
    <div
      style={{
        width: "100%",
        background: "#111827",
        border: "1px solid #2d3748",
        borderRadius: "22px",
        overflow: "hidden",
        boxShadow: "0 10px 30px rgba(0,0,0,0.35)"
      }}
    >
      <div
        style={{
          background: config.bg,
          padding: "28px",
          color: "#ffffff"
        }}
      >
        <h2
          style={{
            margin: 0,
            fontSize: "28px",
            fontWeight: 700
          }}
        >
          Resume Grade
        </h2>

        <p
          style={{
            marginTop: "10px",
            opacity: 0.9,
            fontSize: "15px"
          }}
        >
          AI Evaluation Summary
        </p>
      </div>

      <div
        style={{
          padding: "35px"
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginBottom: "25px"
          }}
        >
          <div
            style={{
              width: "170px",
              height: "170px",
              borderRadius: "50%",
              background: config.bg,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#ffffff",
              fontSize: "60px",
              fontWeight: 800,
              letterSpacing: "2px",
              boxShadow: `0 0 35px ${config.color}`
            }}
          >
            {grade}
          </div>
        </div>

        <h2
          style={{
            textAlign: "center",
            color: config.color,
            marginBottom: "10px"
          }}
        >
          {config.title}
        </h2>

        <p
          style={{
            textAlign: "center",
            color: "#cbd5e1",
            lineHeight: "1.8",
            marginBottom: "35px"
          }}
        >
          {config.message}
        </p>

        <div
          style={{
            width: "100%",
            height: "14px",
            borderRadius: "10px",
            overflow: "hidden",
            background: "#1f2937",
            marginBottom: "15px"
          }}
        >
          <div
            style={{
              width: `${atsScore}%`,
              height: "100%",
              background: config.bg,
              transition: "width 1s ease"
            }}
          />
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            color: "#94a3b8",
            fontSize: "14px"
          }}
        >
          <span>ATS Score</span>

          <strong
            style={{
              color: "#ffffff"
            }}
          >
            {atsScore}/100
          </strong>
        </div>

        <div
          style={{
            marginTop: "35px",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))",
            gap: "18px"
          }}
        >
          <div
            style={{
              background: "#1f2937",
              padding: "20px",
              borderRadius: "16px",
              textAlign: "center"
            }}
          >
            <h3
              style={{
                color: config.color,
                marginBottom: "8px"
              }}
            >
              Recruiter View
            </h3>

            <p
              style={{
                color: "#d1d5db",
                lineHeight: "1.7"
              }}
            >
              ATS score and formatting quality determine your initial screening success.
            </p>
          </div>

          <div
            style={{
              background: "#1f2937",
              padding: "20px",
              borderRadius: "16px",
              textAlign: "center"
            }}
          >
            <h3
              style={{
                color: config.color,
                marginBottom: "8px"
              }}
            >
              Recommendation
            </h3>

            <p
              style={{
                color: "#d1d5db",
                lineHeight: "1.7"
              }}
            >
              Continue improving projects, measurable achievements, and role-specific keywords.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ResumeGrade;