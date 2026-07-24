import ATSScoreMap from "./ATSScoreMap";

function ATSScoreCard({
  atsScore = 0,
  grade = "N/A",
  statistics = {},
  feedback = [],
  breakdown = [],
  rawPoints = 0,
  maximumPoints = 0,
  candidateProfile = "",
}) {
  const radius = 70;
  const stroke = 10;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const progress = Math.min(Math.max(atsScore, 0), 100);
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  const scoreColor = atsScore >= 90 ? "#51d990" : atsScore >= 75 ? "#75a7ff" : atsScore >= 60 ? "#f6bc5a" : "#ef6b79";
  const priorities = feedback.filter((item) => /consider|add |use |include |needs attention|no clear/i.test(item)).slice(0, 4);
  const stats = [
    [statistics.word_count || 0, "Words"],
    [statistics.estimated_pages || 0, "Pages"],
    [statistics.total_skills || 0, "Skills"],
    [statistics.completed_sections || 0, "Sections found"],
  ];

  return (
    <article style={{ width: "100%", boxSizing: "border-box", padding: "clamp(20px, 3vw, 32px)", borderRadius: "22px", color: "#ffffff", background: "#111827", border: "1px solid #2d3748", boxShadow: "0 10px 30px rgba(0,0,0,0.35)" }}>
      <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", flexWrap: "wrap", marginBottom: "22px" }}>
        <div>
          <p style={{ margin: 0, color: "#a5b4fc", fontSize: "13px", fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase" }}>Resume analysis</p>
          <h2 style={{ margin: "5px 0 0", fontSize: "25px" }}>ATS score calculator</h2>
        </div>
        <span style={{ padding: "8px 13px", borderRadius: "999px", color: "#ffffff", background: scoreColor, fontWeight: 800 }}>Grade {grade}</span>
      </header>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "28px", alignItems: "start" }}>
        <section aria-label="Score summary">
          <div style={{ display: "flex", justifyContent: "center", marginBottom: "20px" }}>
            <svg height="170" width="170" aria-label={`${atsScore} out of 100 ATS score`}>
              <circle stroke="#374151" fill="transparent" strokeWidth={stroke} r={normalizedRadius} cx="85" cy="85" />
              <circle stroke={scoreColor} fill="transparent" strokeWidth={stroke} strokeLinecap="round" strokeDasharray={`${circumference} ${circumference}`} strokeDashoffset={strokeDashoffset} style={{ transition: "stroke-dashoffset 1s ease" }} r={normalizedRadius} cx="85" cy="85" transform="rotate(-90 85 85)" />
              <text x="50%" y="48%" dominantBaseline="middle" textAnchor="middle" fontSize="38" fill="#ffffff" fontWeight="bold">{atsScore}</text>
              <text x="50%" y="66%" dominantBaseline="middle" textAnchor="middle" fontSize="13" fill="#9ca3af">ATS score</text>
            </svg>
          </div>
          {candidateProfile && <p style={{ margin: "0 0 18px", textAlign: "center", color: "#bfcaff" }}>Profile: {candidateProfile}</p>}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "12px" }}>
            {stats.map(([value, label]) => (
              <div key={label} style={{ padding: "16px 10px", borderRadius: "14px", textAlign: "center", background: "#1f2937", border: "1px solid #374151" }}>
                <strong style={{ display: "block", fontSize: "22px" }}>{value}</strong>
                <span style={{ color: "#cbd5e1", fontSize: "13px" }}>{label}</span>
              </div>
            ))}
          </div>
        </section>

        <section aria-label="Score calculation and priority improvements">
          <ATSScoreMap atsScore={atsScore} breakdown={breakdown} rawPoints={rawPoints} maximumPoints={maximumPoints} />
          {priorities.length > 0 && (
            <div style={{ padding: "18px", borderRadius: "14px", background: "#1f2937", border: "1px solid #374151" }}>
              <h3 style={{ margin: "0 0 10px", fontSize: "17px" }}>Priority improvements</h3>
              <ol style={{ display: "grid", gap: "8px", margin: 0, paddingLeft: "20px", color: "#d6def3", lineHeight: 1.45 }}>
                {priorities.map((item) => <li key={item}>{item}</li>)}
              </ol>
            </div>
          )}
        </section>
      </div>
    </article>
  );
}

export default ATSScoreCard;
