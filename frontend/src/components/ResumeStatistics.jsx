

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
    {
      title: "Word Count",
      value: word_count,
      icon: "📝",
      color: "#3b82f6"
    },
    {
      title: "Estimated Pages",
      value: estimated_pages,
      icon: "📄",
      color: "#8b5cf6"
    },
    {
      title: "Detected Skills",
      value: total_skills,
      icon: "💡",
      color: "#22c55e"
    },
    {
      title: "Sections Found",
      value: completed_sections,
      icon: "✅",
      color: "#14b8a6"
    },
    {
      title: "Missing Sections",
      value: missing_sections,
      icon: "⚠️",
      color: "#ef4444"
    },
    {
      title: "Resume Grade",
      value: resume_grade,
      icon: "🏆",
      color: "#f59e0b"
    }
  ];

  return (
    <div
      style={{
        width: "100%",
        background: "#111827",
        borderRadius: "22px",
        padding: "30px",
        border: "1px solid #2d3748",
        boxShadow: "0 12px 30px rgba(0,0,0,.35)"
      }}
    >
      <h2
        style={{
          color: "#ffffff",
          marginBottom: "30px",
          textAlign: "center"
        }}
      >
        Resume Statistics
      </h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
          gap: "20px"
        }}
      >
        {cards.map((card, index) => (
          <div
            key={index}
            style={{
              background: "#1f2937",
              borderRadius: "18px",
              padding: "25px",
              border: `1px solid ${card.color}40`,
              transition: "0.3s"
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center"
              }}
            >
              <div
                style={{
                  fontSize: "40px"
                }}
              >
                {card.icon}
              </div>

              <div
                style={{
                  width: "16px",
                  height: "16px",
                  borderRadius: "50%",
                  background: card.color
                }}
              />
            </div>

            <h1
              style={{
                color: card.color,
                margin: "25px 0 10px 0",
                fontSize: "40px"
              }}
            >
              {card.value}
            </h1>

            <p
              style={{
                color: "#d1d5db",
                margin: 0,
                fontSize: "15px"
              }}
            >
              {card.title}
            </p>
          </div>
        ))}
      </div>

      <div
        style={{
          marginTop: "35px"
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            color: "#ffffff",
            marginBottom: "10px"
          }}
        >
          <span>Overall ATS Optimization</span>

          <strong>{ats_score}%</strong>
        </div>

        <div
          style={{
            width: "100%",
            height: "14px",
            background: "#374151",
            borderRadius: "50px",
            overflow: "hidden"
          }}
        >
          <div
            style={{
              width: `${ats_score}%`,
              height: "100%",
              borderRadius: "50px",
              background:
                ats_score >= 90
                  ? "#22c55e"
                  : ats_score >= 75
                  ? "#3b82f6"
                  : ats_score >= 60
                  ? "#f59e0b"
                  : "#ef4444",
              transition: "width 1s ease"
            }}
          />
        </div>
      </div>

      <div
        style={{
          marginTop: "30px",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(250px,1fr))",
          gap: "20px"
        }}
      >
        <div
          style={{
            background: "#1f2937",
            borderRadius: "16px",
            padding: "20px"
          }}
        >
          <h3
            style={{
              color: "#60a5fa",
              marginBottom: "10px"
            }}
          >
            📊 Resume Health
          </h3>

          <p
            style={{
              color: "#cbd5e1",
              lineHeight: "1.8"
            }}
          >
            Your statistics summarize the completeness of your resume,
            the amount of technical content, and ATS readiness.
          </p>
        </div>

        <div
          style={{
            background: "#1f2937",
            borderRadius: "16px",
            padding: "20px"
          }}
        >
          <h3
            style={{
              color: "#22c55e",
              marginBottom: "10px"
            }}
          >
            🚀 AI Suggestion
          </h3>

          <p
            style={{
              color: "#cbd5e1",
              lineHeight: "1.8"
            }}
          >
            Increasing relevant projects, certifications, measurable
            achievements and role-specific keywords will improve both ATS
            performance and recruiter impressions.
          </p>
        </div>
      </div>
    </div>
  );
}

export default ResumeStatistics;