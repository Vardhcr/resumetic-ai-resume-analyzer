import re

KNOWN_SKILLS = [
    "Python",
    "C",
    "C++",
    "Java",
    "JavaScript",
    "HTML",
    "CSS",
    "React",
    "Node.js",
    "FastAPI",
    "Git",
    "GitHub",
    "SQL",
    "MySQL",
    "MongoDB",
    "Data Structures",
    "Algorithms",
    "OOP",
    "Blockchain",
    "Cyber Security"
]


def extract_skills(text):

    found_skills = []

    for skill in KNOWN_SKILLS:

        pattern = r"\b" + re.escape(skill) + r"\b"

        if re.search(pattern, text, re.IGNORECASE):
            found_skills.append(skill)

    return found_skills