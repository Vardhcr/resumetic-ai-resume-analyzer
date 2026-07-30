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
    <article className="card-container">
      <header className="card-header">
        <div>
          <p className="card-subtitle">Resume analysis</p>
          <h2 className="card-title">ATS score calculator</h2>
        </div>
        <span className="grade-badge" style={{ background: scoreColor }}>Grade {grade}</span>
      </header>

      <div className="score-grid">
        <section aria-label="Score summary">
          <div className="gauge-wrapper">
            <svg viewBox="0 0 170 170" className="gauge-svg" aria-label={`${atsScore} out of 100 ATS score`}>
              <circle stroke="#374151" fill="transparent" strokeWidth={stroke} r={normalizedRadius} cx="85" cy="85" />
              <circle stroke={scoreColor} fill="transparent" strokeWidth={stroke} strokeLinecap="round" strokeDasharray={`${circumference} ${circumference}`} strokeDashoffset={strokeDashoffset} style={{ transition: "stroke-dashoffset 1s ease" }} r={normalizedRadius} cx="85" cy="85" transform="rotate(-90 85 85)" />
              <text x="50%" y="48%" dominantBaseline="middle" textAnchor="middle" fontSize="36" fill="#ffffff" fontWeight="bold">{atsScore}</text>
              <text x="50%" y="66%" dominantBaseline="middle" textAnchor="middle" fontSize="13" fill="#9ca3af">ATS score</text>
            </svg>
          </div>
          {candidateProfile && <p style={{ margin: "0 0 18px", textAlign: "center", color: "#bfcaff", fontSize: "0.9rem" }}>Profile: {candidateProfile}</p>}
          <div className="stats-grid-compact">
            {stats.map(([value, label]) => (
              <div key={label} className="stat-box-compact">
                <strong className="stat-number">{value}</strong>
                <span className="stat-label">{label}</span>
              </div>
            ))}
          </div>
        </section>

        <section aria-label="Score calculation and priority improvements">
          <ATSScoreMap atsScore={atsScore} breakdown={breakdown} rawPoints={rawPoints} maximumPoints={maximumPoints} />
          {priorities.length > 0 && (
            <div className="priority-box">
              <h3 className="priority-title">Priority improvements</h3>
              <ol className="priority-list">
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
