

function ATSScoreCard({
    atsScore = 0,
    grade = "N/A",
    statistics = {},
    feedback = []
}) {

    const radius = 70;
    const stroke = 10;
    const normalizedRadius = radius - stroke * 2;
    const circumference = normalizedRadius * 2 * Math.PI;

    const progress = Math.min(Math.max(atsScore, 0), 100);

    const strokeDashoffset =
        circumference -
        (progress / 100) * circumference;

    const scoreColor = () => {

        if (atsScore >= 90) return "#22c55e";

        if (atsScore >= 75) return "#3b82f6";

        if (atsScore >= 60) return "#f59e0b";

        return "#ef4444";

    };

    const cardStyle = {

        background: "#111827",

        borderRadius: "20px",

        padding: "30px",

        boxShadow:
            "0 10px 30px rgba(0,0,0,0.35)",

        color: "#ffffff",

        border: "1px solid #2d3748",

        width: "100%"

    };

    const statCard = {

        background: "#1f2937",

        borderRadius: "14px",

        padding: "16px",

        textAlign: "center",

        border: "1px solid #374151"

    };

    return (

        <div style={cardStyle}>

            <h2
                style={{
                    marginBottom: "25px",
                    textAlign: "center"
                }}
            >
                ATS Resume Score
            </h2>

            <div

                style={{

                    display: "flex",

                    justifyContent: "center",

                    alignItems: "center",

                    marginBottom: "30px"

                }}

            >

                <svg

                    height={160}

                    width={160}

                >

                    <circle

                        stroke="#374151"

                        fill="transparent"

                        strokeWidth={stroke}

                        r={normalizedRadius}

                        cx="80"

                        cy="80"

                    />

                    <circle

                        stroke={scoreColor()}

                        fill="transparent"

                        strokeWidth={stroke}

                        strokeLinecap="round"

                        strokeDasharray={`${circumference} ${circumference}`}

                        strokeDashoffset={strokeDashoffset}

                        style={{

                            transition:
                                "stroke-dashoffset 1s ease"

                        }}

                        r={normalizedRadius}

                        cx="80"

                        cy="80"

                        transform="rotate(-90 80 80)"

                    />

                    <text

                        x="50%"

                        y="48%"

                        dominantBaseline="middle"

                        textAnchor="middle"

                        fontSize="34"

                        fill="#ffffff"

                        fontWeight="bold"

                    >

                        {atsScore}

                    </text>

                    <text

                        x="50%"

                        y="66%"

                        dominantBaseline="middle"

                        textAnchor="middle"

                        fontSize="13"

                        fill="#9ca3af"

                    >

                        ATS Score

                    </text>

                </svg>

            </div>

            <div

                style={{

                    textAlign: "center",

                    marginBottom: "25px"

                }}

            >

                <span

                    style={{

                        background: scoreColor(),

                        color: "#ffffff",

                        padding: "10px 20px",

                        borderRadius: "50px",

                        fontWeight: "bold",

                        fontSize: "18px"

                    }}

                >

                    Resume Grade : {grade}

                </span>

            </div>

            <div

                style={{

                    display: "grid",

                    gridTemplateColumns:
                        "repeat(auto-fit,minmax(180px,1fr))",

                    gap: "16px",

                    marginBottom: "30px"

                }}

            >

                <div style={statCard}>

                    <h3>

                        {statistics.word_count || 0}

                    </h3>

                    <p>Words</p>

                </div>

                <div style={statCard}>

                    <h3>

                        {statistics.estimated_pages || 0}

                    </h3>

                    <p>Pages</p>

                </div>

                <div style={statCard}>

                    <h3>

                        {statistics.total_skills || 0}

                    </h3>

                    <p>Skills</p>

                </div>

                <div style={statCard}>

                    <h3>

                        {statistics.completed_sections || 0}

                    </h3>

                    <p>Sections Found</p>

                </div>

            </div>

            <div>

                <h3
                    style={{
                        marginBottom: "15px"
                    }}
                >
                    Resume Feedback
                </h3>

                {

                    feedback.length === 0 ? (

                        <p
                            style={{
                                color: "#9ca3af"
                            }}
                        >
                            No feedback available.
                        </p>

                    ) : (

                        <ul
                            style={{
                                paddingLeft: "20px",
                                lineHeight: "2"
                            }}
                        >

                            {

                                feedback.map(
                                    (item, index) => (

                                        <li
                                            key={index}
                                        >

                                            {item}

                                        </li>

                                    )
                                )

                            }

                        </ul>

                    )

                }

            </div>

        </div>

    );

}

export default ATSScoreCard;