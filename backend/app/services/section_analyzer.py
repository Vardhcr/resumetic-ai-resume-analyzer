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

    "Volunteer Work": [
        "volunteer",
        "volunteer work",
        "community service",
        "social work"
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

def analyze_resume_sections(text):

    text = text.lower()

    found_sections = []
    missing_sections = []

    for section, aliases in SECTION_PATTERNS.items():

        found = False

        for alias in aliases:

            pattern = r"\b" + re.escape(alias.lower()) + r"\b"

            if re.search(pattern, text):

                found = True
                break

        if found:
            found_sections.append(section)

        else:
            missing_sections.append(section)

    return {

        "found_sections": sorted(found_sections),

        "missing_sections": sorted(missing_sections)

    }