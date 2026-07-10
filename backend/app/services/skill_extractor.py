import re

# ===========================
# MASTER SKILL DATABASE
# ===========================

SKILLS = {

    "Programming Languages": [
        "Python", "C", "C++", "Java", "JavaScript", "TypeScript",
        "Go", "Rust", "PHP", "Ruby", "Swift", "Kotlin", "R"
    ],

    "Frontend": [
        "HTML", "CSS", "React", "Angular", "Vue",
        "Next.js", "Bootstrap", "Tailwind CSS", "Redux"
    ],

    "Backend": [
        "FastAPI", "Flask", "Django", "Node.js",
        "Express", "Spring Boot", ".NET", "ASP.NET"
    ],

    "Databases": [
        "SQL", "MySQL", "PostgreSQL",
        "MongoDB", "SQLite", "Oracle", "Redis"
    ],

    "Cloud & DevOps": [
        "AWS", "Azure", "Google Cloud", "GCP",
        "Docker", "Kubernetes", "Terraform",
        "Jenkins"
    ],

    "AI / Machine Learning": [
        "Artificial Intelligence",
        "Machine Learning",
        "Deep Learning",
        "TensorFlow",
        "PyTorch",
        "Keras",
        "Scikit-learn",
        "OpenCV",
        "Pandas",
        "NumPy",
        "Matplotlib",
        "Seaborn",
        "LangChain",
        "Hugging Face"
    ],

    "Data Engineering": [
        "Apache Spark",
        "Kafka",
        "Hadoop",
        "Airflow",
        "Snowflake"
    ],

    "Tools": [
        "Git",
        "GitHub",
        "GitLab",
        "Bitbucket",
        "VS Code",
        "Linux",
        "Postman",
        "Jupyter"
    ],

    "Concepts": [
        "Data Structures",
        "Algorithms",
        "DSA",
        "Object-Oriented Programming",
        "OOP",
        "REST API",
        "Microservices",
        "Operating Systems",
        "Computer Networks",
        "DBMS",
        "Blockchain",
        "Cyber Security",
        "Problem Solving",
        "File Handling"
    ]
}


# ====================================
# NORMALIZATION MAP
# ====================================

NORMALIZATION = {

    "DSA": "Data Structures & Algorithms",

    "Data Structures": "Data Structures & Algorithms",

    "Algorithms": "Data Structures & Algorithms",

    "OOP": "Object-Oriented Programming",

    "Object-Oriented Programming": "Object-Oriented Programming",

    "MySQL": "SQL",

    "PostgreSQL": "SQL",

    "SQLite": "SQL",

    "Oracle": "SQL",

    "MongoDB": "MongoDB",

    "GitHub": "Git",

    "GitLab": "Git",

    "Bitbucket": "Git",

    "Google Cloud": "GCP"

}


# ====================================
# SKILL EXTRACTION
# ====================================

def extract_skills(text):

    text = text.lower()

    detected = set()

    for category in SKILLS.values():

        for skill in category:

            pattern = r"\b" + re.escape(skill.lower()) + r"\b"

            if re.search(pattern, text):

                normalized = NORMALIZATION.get(skill, skill)

                detected.add(normalized)

    return sorted(detected)