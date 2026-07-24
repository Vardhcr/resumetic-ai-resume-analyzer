import re

# ==========================================
# SECTION ALIASES
# ==========================================

SECTION_PATTERNS = {

    "Career Objective": [
        "career objective",
        "objective",
        "professional summary",
        "summary",
        "profile",
        "career profile"
    ],

    "Education": [
        "education",
        "academic background",
        "academic qualifications",
        "qualification",
        "qualifications"
    ],

    "Skills": [
        "skills",
        "technical skills",
        "core skills",
        "technical expertise",
        "competencies"
    ],

    "Projects": [
        "projects",
        "project",
        "academic projects",
        "personal projects",
        "major projects",
        "professional projects"
    ],

    "Experience": [
        "experience",
        "work experience",
        "professional experience",
        "employment",
        "internship",
        "internships"
    ],

    "Certifications": [
        "certifications",
        "certification",
        "licenses",
        "training"
    ],

    "Achievements": [
        "achievements",
        "awards",
        "honors",
        "accomplishments",
        "activities",
        "extra-curricular activities",
        "extra curricular activities"
    ],

    "Publications": [
        "publications",
        "research papers",
        "journal publications",
        "conference papers",
        "technical papers"
    ]

}


# ==========================================
# ANALYZE RESUME SECTIONS
# ==========================================

def analyze_resume_sections(text: str):

    text = text.lower()

    found_sections = []
    missing_sections = []
    sections = {}

    for section, aliases in SECTION_PATTERNS.items():

        found = False

        for alias in aliases:

            pattern = r"\b" + re.escape(alias.lower()) + r"\b"

            if re.search(pattern, text):
                found = True
                break

        sections[section] = found

        if found:
            found_sections.append(section)
        else:
            missing_sections.append(section)

    return {

        "sections": sections,

        "found_sections": sorted(found_sections),

        "missing_sections": sorted(missing_sections),

        "summary": {
            "total_sections": len(SECTION_PATTERNS),
            "found": len(found_sections),
            "missing": len(missing_sections),
            "completion_percentage": round(
                (len(found_sections) / len(SECTION_PATTERNS)) * 100
            )
        }

    }
