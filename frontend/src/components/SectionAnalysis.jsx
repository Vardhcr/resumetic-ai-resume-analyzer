

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
    <div
      style={{
        background: "#111827",
        border: "1px solid #2d3748",
        borderRadius: "20px",
        padding: "30px",
        boxShadow: "0 12px 25px rgba(0,0,0,.35)"
      }}
    >
      <h2
        style={{
          color: "#ffffff",
          textAlign: "center",
          marginBottom: "30px"
        }}
      >
        Resume Section Analysis
      </h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
          gap: "20px",
          marginBottom: "35px"
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
          <h1
            style={{
              color: "#22c55e",
              marginBottom: "10px"
            }}
          >
            {summary.found || foundSections.length}
          </h1>

          <p
            style={{
              color: "#d1d5db"
            }}
          >
            Sections Found
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
          <h1
            style={{
              color: "#ef4444",
              marginBottom: "10px"
            }}
          >
            {summary.missing || missingSections.length}
          </h1>

          <p
            style={{
              color: "#d1d5db"
            }}
          >
            Missing Sections
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
          <h1
            style={{
              color: "#3b82f6",
              marginBottom: "10px"
            }}
          >
            {summary.completion_percentage || 0}%
          </h1>

          <p
            style={{
              color: "#d1d5db"
            }}
          >
            Resume Completion
          </p>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(320px,1fr))",
          gap: "25px"
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
              color: "#22c55e",
              marginBottom: "20px"
            }}
          >
            ✅ Sections Present
          </h3>

          {
            foundSections.length === 0 ? (
              <p
                style={{
                  color: "#94a3b8"
                }}
              >
                No sections detected.
              </p>
            ) : (
              <ul
                style={{
                  color: "#e5e7eb",
                  lineHeight: "2",
                  paddingLeft: "22px"
                }}
              >
                {
                  foundSections.map((section, index) => (
                    <li key={index}>
                      {section}
                    </li>
                  ))
                }
              </ul>
            )
          }
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
              color: "#ef4444",
              marginBottom: "20px"
            }}
          >
            ❌ Missing Sections
          </h3>

          {
            missingSections.length === 0 ? (
              <p
                style={{
                  color: "#22c55e"
                }}
              >
                Excellent! No missing sections detected.
              </p>
            ) : (
              <ul
                style={{
                  color: "#e5e7eb",
                  lineHeight: "2",
                  paddingLeft: "22px"
                }}
              >
                {
                  missingSections.map((section, index) => (
                    <li key={index}>
                      {section}
                    </li>
                  ))
                }
              </ul>
            )
          }
        </div>
      </div>

      <div
        style={{
          marginTop: "30px",
          background: "#1f2937",
          padding: "20px",
          borderRadius: "16px"
        }}
      >
        <h3
          style={{
            color: "#60a5fa",
            marginBottom: "15px"
          }}
        >
          AI Insight
        </h3>

        <p
          style={{
            color: "#cbd5e1",
            lineHeight: "1.8"
          }}
        >
          Recruiters generally expect resumes to include Education,
          Technical Skills, Projects, Experience, Certifications,
          and Achievements. Completing missing sections can improve
          both ATS compatibility and recruiter confidence.
        </p>
      </div>
    </div>
  );
}

export default SectionAnalysis;