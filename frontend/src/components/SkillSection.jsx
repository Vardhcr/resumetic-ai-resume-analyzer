import { useState } from "react";


function SkillsSection({
  skills = {},
  title = "Detected Skills"
}) {
  const [selectedCategory, setSelectedCategory] = useState("All");

  const categories = ["All", ...Object.keys(skills.categories || {})];

  const renderSkills = () => {
    if (selectedCategory === "All") {
      return skills.items || [];
    }

    return skills.categories?.[selectedCategory] || [];
  };

  const badgeStyle = {
    padding: "10px 18px",
    borderRadius: "50px",
    fontWeight: "600",
    background: "#2563eb",
    color: "#fff",
    border: "1px solid #3b82f6",
    transition: ".3s",
    cursor: "pointer"
  };

  return (
    <div
      style={{
        background: "#111827",
        borderRadius: "20px",
        padding: "30px",
        border: "1px solid #2d3748",
        boxShadow: "0 12px 25px rgba(0,0,0,.35)"
      }}
    >
      <h2
        style={{
          color: "#ffffff",
          marginBottom: "25px",
          textAlign: "center"
        }}
      >
        {title}
      </h2>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "10px",
          justifyContent: "center",
          marginBottom: "25px"
        }}
      >
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            style={{
              ...badgeStyle,
              background:
                selectedCategory === category
                  ? "#22c55e"
                  : "#1f2937"
            }}
          >
            {category}
          </button>
        ))}
      </div>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "12px",
          justifyContent: "center",
          minHeight: "100px"
        }}
      >
        {renderSkills().length === 0 ? (
          <p
            style={{
              color: "#94a3b8"
            }}
          >
            No skills detected.
          </p>
        ) : (
          renderSkills().map((skill, index) => (
            <div
              key={index}
              style={{
                padding: "10px 18px",
                borderRadius: "50px",
                background: "#2563eb20",
                border: "1px solid #2563eb",
                color: "#ffffff",
                fontWeight: "600"
              }}
            >
              {skill}
            </div>
          ))
        )}
      </div>

      <div
        style={{
          marginTop: "35px",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
          gap: "20px"
        }}
      >
        {Object.entries(skills.categories || {}).map(
          ([category, values]) => (
            <div
              key={category}
              style={{
                background: "#1f2937",
                borderRadius: "16px",
                padding: "20px"
              }}
            >
              <h3
                style={{
                  color: "#60a5fa",
                  marginBottom: "15px"
                }}
              >
                {category}
              </h3>

              <ul
                style={{
                  color: "#d1d5db",
                  lineHeight: "1.9",
                  paddingLeft: "20px"
                }}
              >
                {values.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>
          )
        )}
      </div>
    </div>
  );
}

export default SkillsSection;