import { useState } from "react";

const SIZE = 360;
const CENTER = SIZE / 2;
const OUTER_RADIUS = 154;
const INNER_RADIUS = 108;

function point(angle, radius) {
  const radians = ((angle - 90) * Math.PI) / 180;
  return {
    x: CENTER + radius * Math.cos(radians),
    y: CENTER + radius * Math.sin(radians),
  };
}

function segmentPath(startAngle, endAngle) {
  const outerStart = point(startAngle, OUTER_RADIUS);
  const outerEnd = point(endAngle, OUTER_RADIUS);
  const innerEnd = point(endAngle, INNER_RADIUS);
  const innerStart = point(startAngle, INNER_RADIUS);

  return [
    `M ${outerStart.x} ${outerStart.y}`,
    `A ${OUTER_RADIUS} ${OUTER_RADIUS} 0 0 1 ${outerEnd.x} ${outerEnd.y}`,
    `L ${innerEnd.x} ${innerEnd.y}`,
    `A ${INNER_RADIUS} ${INNER_RADIUS} 0 0 0 ${innerStart.x} ${innerStart.y}`,
    "Z",
  ].join(" ");
}

function segmentColor(item) {
  const ratio = item.maximum ? item.points / item.maximum : 0;
  if (ratio >= 0.75) return "#51d990";
  if (ratio >= 0.4) return "#f6bc5a";
  return "#ef6b79";
}

function ATSScoreMap({ atsScore, breakdown, rawPoints, maximumPoints }) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const selected = breakdown[selectedIndex] || breakdown[0];
  const step = 360 / Math.max(breakdown.length, 1);

  if (!breakdown.length) return null;

  return (
    <section style={{ marginBottom: "20px" }} aria-labelledby="score-map-title">
      <h3 id="score-map-title" style={{ margin: "0 0 6px", textAlign: "center", fontSize: "1.1rem" }}>
        How this score is calculated
      </h3>
      <p style={{ margin: "0 0 14px", color: "#9ca3af", fontSize: "0.82rem", textAlign: "center" }}>
        Hover, focus, or tap a ring segment to inspect its score contribution.
      </p>

      <svg viewBox={`0 0 ${SIZE} ${SIZE}`} role="img" aria-label="Interactive ATS score calculation map" style={{ width: "min(100%, 320px)", display: "block", margin: "0 auto" }}>
        <circle cx={CENTER} cy={CENTER} r={INNER_RADIUS - 10} fill="#1f2937" stroke="#374151" />
        <text x={CENTER} y={CENTER - 10} textAnchor="middle" fill="#ffffff" fontSize="44" fontWeight="700">{atsScore}</text>
        <text x={CENTER} y={CENTER + 22} textAnchor="middle" fill="#9ca3af" fontSize="14">ATS score</text>

        {breakdown.map((item, index) => {
          const start = index * step + 1.5;
          const end = (index + 1) * step - 1.5;
          const isSelected = index === selectedIndex;
          return (
            <path
              key={item.label}
              d={segmentPath(start, end)}
              fill={segmentColor(item)}
              fillOpacity={isSelected ? 1 : 0.65}
              stroke={isSelected ? "#ffffff" : "transparent"}
              strokeWidth={isSelected ? 2 : 0}
              role="button"
              tabIndex="0"
              aria-label={`${item.label}: ${item.points} out of ${item.maximum} points`}
              onMouseEnter={() => setSelectedIndex(index)}
              onFocus={() => setSelectedIndex(index)}
              onClick={() => setSelectedIndex(index)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") setSelectedIndex(index);
              }}
              style={{ cursor: "pointer", transition: "fill-opacity 160ms ease", touchAction: "manipulation" }}
            >
              <title>{`${item.label}: ${item.points}/${item.maximum}`}</title>
            </path>
          );
        })}
      </svg>

      <div style={{ marginTop: "12px", minHeight: "64px", padding: "12px 14px", borderRadius: "12px", background: "#1f2937", border: "1px solid #374151", textAlign: "left" }} aria-live="polite">
        <strong style={{ display: "block", color: "#ffffff", fontSize: "0.95rem" }}>{selected.label}: {selected.points}/{selected.maximum}</strong>
        <span style={{ color: "#cbd5e1", fontSize: "0.85rem" }}>
          {selected.points ? "This category contributes positively to your ATS score." : "No points detected in this category yet."}
        </span>
      </div>
      <p style={{ margin: "10px 0 0", color: "#9ca3af", fontSize: "0.8rem", textAlign: "center" }}>
        Raw points: {rawPoints}/{maximumPoints}, normalized to 100.
      </p>
    </section>
  );
}

export default ATSScoreMap;
