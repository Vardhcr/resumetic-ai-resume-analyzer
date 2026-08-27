"""
Static free-resource dataset for the skill-gap ("Job Pole") feature.

Every entry here is a curated, no-signup-required-to-browse, free learning
or free virtual-internship resource. This is deliberately a plain Python
dict rather than an LLM call: it costs nothing to serve, needs no API key,
and never goes down or rate-limits. If you want to expand coverage later,
just add more keys — no other code needs to change.

Lookup is case-insensitive against the skill names produced by
`skill_extractor.py`, so it stays consistent with what the rest of the app
already shows the user as "their skills".
"""

from typing import Dict, Any, List

FREE_RESOURCES: Dict[str, Dict[str, List[Dict[str, str]]]] = {

    "python": {
        "free_courses": [
            {"title": "Python for Everybody", "provider": "Coursera (audit free)", "url": "https://www.coursera.org/specializations/python"},
            {"title": "Scientific Computing with Python", "provider": "freeCodeCamp", "url": "https://www.freecodecamp.org/learn/scientific-computing-with-python/"},
        ],
        "free_practice": [
            {"title": "Python Job Simulations", "provider": "Forage", "url": "https://www.theforage.com/"},
        ],
    },
    "java": {
        "free_courses": [
            {"title": "Java Programming and Software Engineering Fundamentals", "provider": "Coursera (audit free)", "url": "https://www.coursera.org/specializations/java-programming"},
        ],
        "free_practice": [
            {"title": "Java Backend Job Simulation", "provider": "Forage", "url": "https://www.theforage.com/"},
        ],
    },
    "c++": {
        "free_courses": [
            {"title": "C++ Programming", "provider": "freeCodeCamp (YouTube)", "url": "https://www.freecodecamp.org/news/tag/cpp/"},
        ],
        "free_practice": [],
    },
    "javascript": {
        "free_courses": [
            {"title": "JavaScript Algorithms and Data Structures", "provider": "freeCodeCamp", "url": "https://www.freecodecamp.org/learn/javascript-algorithms-and-data-structures/"},
        ],
        "free_practice": [
            {"title": "Frontend Job Simulation", "provider": "Forage", "url": "https://www.theforage.com/"},
        ],
    },
    "typescript": {
        "free_courses": [
            {"title": "Learn TypeScript", "provider": "Scrimba (free tier)", "url": "https://scrimba.com/learn/typescript"},
        ],
        "free_practice": [],
    },
    "html": {
        "free_courses": [
            {"title": "Responsive Web Design", "provider": "freeCodeCamp", "url": "https://www.freecodecamp.org/learn/2022/responsive-web-design/"},
        ],
        "free_practice": [],
    },
    "css": {
        "free_courses": [
            {"title": "Responsive Web Design", "provider": "freeCodeCamp", "url": "https://www.freecodecamp.org/learn/2022/responsive-web-design/"},
        ],
        "free_practice": [],
    },
    "react": {
        "free_courses": [
            {"title": "Front End Development Libraries (React)", "provider": "freeCodeCamp", "url": "https://www.freecodecamp.org/learn/front-end-development-libraries/"},
        ],
        "free_practice": [
            {"title": "React Developer Job Simulation", "provider": "Forage", "url": "https://www.theforage.com/"},
        ],
    },
    "angular": {
        "free_courses": [
            {"title": "Angular - The Complete Guide (free preview modules)", "provider": "Angular.dev official tutorial", "url": "https://angular.dev/tutorials"},
        ],
        "free_practice": [],
    },
    "vue": {
        "free_courses": [
            {"title": "Vue.js Official Guide & Tutorial", "provider": "vuejs.org", "url": "https://vuejs.org/tutorial/"},
        ],
        "free_practice": [],
    },
    "node.js": {
        "free_courses": [
            {"title": "Back End Development and APIs", "provider": "freeCodeCamp", "url": "https://www.freecodecamp.org/learn/back-end-development-and-apis/"},
        ],
        "free_practice": [],
    },
    "fastapi": {
        "free_courses": [
            {"title": "FastAPI Official Tutorial", "provider": "fastapi.tiangolo.com", "url": "https://fastapi.tiangolo.com/tutorial/"},
        ],
        "free_practice": [],
    },
    "django": {
        "free_courses": [
            {"title": "Django Official Tutorial", "provider": "djangoproject.com", "url": "https://docs.djangoproject.com/en/stable/intro/tutorial01/"},
        ],
        "free_practice": [],
    },
    "flask": {
        "free_courses": [
            {"title": "Flask Official Quickstart & Tutorial", "provider": "flask.palletsprojects.com", "url": "https://flask.palletsprojects.com/en/latest/tutorial/"},
        ],
        "free_practice": [],
    },
    "sql": {
        "free_courses": [
            {"title": "Relational Database (SQL)", "provider": "freeCodeCamp", "url": "https://www.freecodecamp.org/learn/relational-database/"},
            {"title": "SQL for Data Science", "provider": "Coursera (audit free)", "url": "https://www.coursera.org/learn/sql-for-data-science"},
        ],
        "free_practice": [
            {"title": "Data Analyst Job Simulation", "provider": "Forage", "url": "https://www.theforage.com/"},
        ],
    },
    "mongodb": {
        "free_courses": [
            {"title": "MongoDB Basics", "provider": "MongoDB University (free)", "url": "https://learn.mongodb.com/"},
        ],
        "free_practice": [],
    },
    "aws": {
        "free_courses": [
            {"title": "AWS Cloud Practitioner Essentials", "provider": "AWS Skill Builder (free tier)", "url": "https://skillbuilder.aws/"},
        ],
        "free_practice": [
            {"title": "AWS Solutions Architect Job Simulation", "provider": "Forage", "url": "https://www.theforage.com/"},
        ],
    },
    "azure": {
        "free_courses": [
            {"title": "Microsoft Azure Fundamentals (AZ-900)", "provider": "Microsoft Learn (free)", "url": "https://learn.microsoft.com/en-us/training/paths/azure-fundamentals/"},
        ],
        "free_practice": [],
    },
    "gcp": {
        "free_courses": [
            {"title": "Google Cloud Skills Boost — free courses", "provider": "Google Cloud (free tier)", "url": "https://www.cloudskillsboost.google/"},
        ],
        "free_practice": [],
    },
    "docker": {
        "free_courses": [
            {"title": "Docker Official Getting Started Guide", "provider": "docs.docker.com", "url": "https://docs.docker.com/get-started/"},
        ],
        "free_practice": [],
    },
    "kubernetes": {
        "free_courses": [
            {"title": "Kubernetes Basics", "provider": "kubernetes.io (free)", "url": "https://kubernetes.io/docs/tutorials/kubernetes-basics/"},
        ],
        "free_practice": [],
    },
    "git": {
        "free_courses": [
            {"title": "Version Control with Git", "provider": "Coursera (audit free)", "url": "https://www.coursera.org/learn/version-control-with-git"},
        ],
        "free_practice": [],
    },
    "machine learning": {
        "free_courses": [
            {"title": "Machine Learning Specialization", "provider": "Coursera / Andrew Ng (audit free)", "url": "https://www.coursera.org/specializations/machine-learning-introduction"},
            {"title": "Intro to Machine Learning", "provider": "Kaggle Learn (free)", "url": "https://www.kaggle.com/learn/intro-to-machine-learning"},
        ],
        "free_practice": [
            {"title": "Data Science / ML Job Simulation", "provider": "Forage", "url": "https://www.theforage.com/"},
        ],
    },
    "deep learning": {
        "free_courses": [
            {"title": "Deep Learning Specialization (audit free)", "provider": "Coursera / DeepLearning.AI", "url": "https://www.coursera.org/specializations/deep-learning"},
        ],
        "free_practice": [],
    },
    "tensorflow": {
        "free_courses": [
            {"title": "Intro to TensorFlow", "provider": "Kaggle Learn (free)", "url": "https://www.kaggle.com/learn/intro-to-deep-learning"},
        ],
        "free_practice": [],
    },
    "pytorch": {
        "free_courses": [
            {"title": "PyTorch Official Tutorials", "provider": "pytorch.org (free)", "url": "https://pytorch.org/tutorials/"},
        ],
        "free_practice": [],
    },
    "pandas": {
        "free_courses": [
            {"title": "Pandas", "provider": "Kaggle Learn (free)", "url": "https://www.kaggle.com/learn/pandas"},
        ],
        "free_practice": [],
    },
    "numpy": {
        "free_courses": [
            {"title": "NumPy Quickstart", "provider": "numpy.org (free)", "url": "https://numpy.org/doc/stable/user/quickstart.html"},
        ],
        "free_practice": [],
    },
    "data structures & algorithms": {
        "free_courses": [
            {"title": "Data Structures and Algorithms", "provider": "freeCodeCamp (YouTube)", "url": "https://www.freecodecamp.org/news/tag/data-structures/"},
        ],
        "free_practice": [
            {"title": "Software Engineering Job Simulation", "provider": "Forage", "url": "https://www.theforage.com/"},
        ],
    },
    "object-oriented programming": {
        "free_courses": [
            {"title": "Object Oriented Programming", "provider": "Coursera (audit free)", "url": "https://www.coursera.org/learn/object-oriented-programming"},
        ],
        "free_practice": [],
    },
    "rest api": {
        "free_courses": [
            {"title": "APIs and Microservices", "provider": "freeCodeCamp", "url": "https://www.freecodecamp.org/learn/back-end-development-and-apis/"},
        ],
        "free_practice": [],
    },
    "cyber security": {
        "free_courses": [
            {"title": "Introduction to Cyber Security", "provider": "Cisco Networking Academy (free)", "url": "https://www.netacad.com/courses/cybersecurity"},
        ],
        "free_practice": [
            {"title": "Cybersecurity Job Simulation", "provider": "Forage", "url": "https://www.theforage.com/"},
        ],
    },
    "computer networks": {
        "free_courses": [
            {"title": "Networking Basics", "provider": "Cisco Networking Academy (free)", "url": "https://www.netacad.com/courses/networking"},
        ],
        "free_practice": [],
    },
    "blockchain": {
        "free_courses": [
            {"title": "Blockchain Basics", "provider": "Coursera (audit free)", "url": "https://www.coursera.org/learn/blockchain-basics"},
        ],
        "free_practice": [],
    },
    "linux": {
        "free_courses": [
            {"title": "Introduction to Linux", "provider": "edX / Linux Foundation (audit free)", "url": "https://www.edx.org/learn/linux"},
        ],
        "free_practice": [],
    },
}

_FALLBACK_RESOURCE = {
    "free_courses": [
        {"title": "Search this skill on freeCodeCamp", "provider": "freeCodeCamp", "url": "https://www.freecodecamp.org/news/search/"},
        {"title": "Search this skill on Coursera (audit free)", "provider": "Coursera", "url": "https://www.coursera.org/search"},
    ],
    "free_practice": [
        {"title": "Browse free virtual job simulations", "provider": "Forage", "url": "https://www.theforage.com/"},
    ],
}


def get_resources_for_skill(skill: str) -> Dict[str, List[Dict[str, str]]]:
    """Return free course + free practice/internship suggestions for a skill.

    Falls back to generic search links for any skill not yet curated above,
    so the response never comes back empty.
    """
    entry = FREE_RESOURCES.get(skill.strip().lower())
    if entry:
        return {"free_courses": entry.get("free_courses", []), "free_practice": entry.get("free_practice", [])}
    return _FALLBACK_RESOURCE
