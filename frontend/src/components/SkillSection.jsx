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

  return (
    <div className="card-container">
      <h2 style={{ color: "#ffffff", marginBottom: "20px", textAlign: "center", fontSize: "1.45rem" }}>
        {title}
      </h2>

      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", justifyContent: "center", marginBottom: "20px" }}>
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className="skill-tag"
            style={{
              cursor: "pointer",
              minHeight: "38px",
              padding: "8px 16px",
              background: selectedCategory === category ? "#22c55e" : "#1f2937",
              color: "#ffffff",
              borderColor: selectedCategory === category ? "#22c55e" : "#374151"
            }}
          >
            {category}
          </button>
        ))}
      </div>

      <div className="skills-container" style={{ justifyContent: "center", minHeight: "60px" }}>
        {renderSkills().length === 0 ? (
          <p style={{ color: "#94a3b8" }}>No skills detected.</p>
        ) : (
          renderSkills().map((skill, index) => (
            <span key={index} className="skill-tag">
              {skill}
            </span>
          ))
        )}
      </div>

      {Object.keys(skills.categories || {}).length > 0 && (
        <div style={{ marginTop: "24px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }}>
          {Object.entries(skills.categories || {}).map(([category, values]) => (
            <div key={category} style={{ background: "#1f2937", borderRadius: "14px", padding: "16px" }}>
              <h3 style={{ color: "#60a5fa", margin: "0 0 10px 0", fontSize: "1.05rem" }}>{category}</h3>
              <ul style={{ color: "#d1d5db", margin: 0, paddingLeft: "18px", fontSize: "0.88rem", lineHeight: "1.7" }}>
                {values.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default SkillsSection;