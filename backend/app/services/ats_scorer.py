import re


# ==========================================
# ATS SCORING ENGINE V2
# ==========================================

SECTION_WEIGHTS = {
    "Education": 15,
    "Skills": 20,
    "Projects": 20,
    "Experience": 20,
    "Certifications": 10,
    "Achievements": 5,
    "Career Objective": 5
}


def section_exists(text, aliases):

    text = text.lower()

    for alias in aliases:
        pattern = r"\b" + re.escape(alias.lower()) + r"\b"

        if re.search(pattern, text):
            return True

    return False


def calculate_ats_score(text, skills):

    text = text.lower()

    score = 0

    feedback = []

    # ==========================================
    # EDUCATION
    # ==========================================

    if section_exists(text, [
        "education",
        "academic background",
        "academic qualifications"
    ]):
        score += 15
        feedback.append("Education section found")
    else:
        feedback.append("Consider adding an Education section")

    # ==========================================
    # SKILLS
    # ==========================================

    if section_exists(text, [
        "skills",
        "technical skills",
        "core skills"
    ]):
        score += 20
        feedback.append("Skills section found")
    else:
        feedback.append("Skills section missing")

    # ==========================================
    # PROJECTS
    # ==========================================

    if section_exists(text, [
        "projects",
        "project",
        "academic projects",
        "personal projects"
    ]):
        score += 20
        feedback.append("Projects section found")
    else:
        feedback.append("Projects section missing")

    # ==========================================
    # EXPERIENCE
    # ==========================================

    if section_exists(text, [
        "experience",
        "work experience",
        "professional experience",
        "employment",
        "internship",
        "internships"
    ]):
        score += 20
        feedback.append("Experience section found")
    else:
        feedback.append("No professional experience detected")

    # ==========================================
    # CERTIFICATIONS
    # ==========================================

    if section_exists(text, [
        "certifications",
        "certification",
        "training"
    ]):
        score += 10
        feedback.append("Certifications section found")
    else:
        feedback.append("Consider adding certifications")

    # ==========================================
    # ACHIEVEMENTS
    # ==========================================

    if section_exists(text, [
        "achievements",
        "awards",
        "honors",
        "activities",
        "extra-curricular activities"
    ]):
        score += 5
        feedback.append("Achievements section found")
    else:
        feedback.append("Achievements section missing")

    # ==========================================
    # CAREER OBJECTIVE
    # ==========================================

    if section_exists(text, [
        "career objective",
        "objective",
        "summary",
        "professional summary",
        "profile"
    ]):
        score += 5
        feedback.append("Career Objective/Summary found")
    else:
        feedback.append("Career Objective or Summary missing")

    # ==========================================
    # SKILL COVERAGE BONUS
    # ==========================================

    skill_count = len(skills)

    if skill_count >= 20:
        score += 5
        feedback.append("Excellent technical skill coverage")

    elif skill_count >= 15:
        score += 4
        feedback.append("Very good technical skill coverage")

    elif skill_count >= 10:
        score += 3
        feedback.append("Good technical skill coverage")

    elif skill_count >= 5:
        score += 2
        feedback.append("Basic technical skill coverage")

    else:
        feedback.append("Add more relevant technical skills")

    # ==========================================
    # LINKS BONUS
    # ==========================================

    if "linkedin.com" in text:
        score += 2
        feedback.append("LinkedIn profile included")

    if "github.com" in text:
        score += 3
        feedback.append("GitHub profile included")

    # ==========================================
    # ONE PAGE BONUS
    # ==========================================

    word_count = len(text.split())

    if word_count <= 700:
        score += 2
        feedback.append("Resume length is ATS friendly")

    # ==========================================
    # LIMIT SCORE
    # ==========================================

    score = min(score, 100)

    # ==========================================
    # RESUME STRENGTH
    # ==========================================

    if score >= 90:
        strength = "Excellent"

    elif score >= 80:
        strength = "Very Good"

    elif score >= 70:
        strength = "Good"

    elif score >= 60:
        strength = "Average"

    else:
        strength = "Needs Improvement"

    return {
        "ats_score": score,
        "resume_strength": strength,
        "feedback": feedback
    }