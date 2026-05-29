def calculate_ats_score(text, skills):

    score = 0
    feedback = []

    text_lower = text.lower()

    if "education" in text_lower:
        score += 15
        feedback.append("Education section found")

    if "technical skills" in text_lower or "skills" in text_lower:
        score += 20
        feedback.append("Skills section found")

    if "projects" in text_lower:
        score += 20
        feedback.append("Projects section found")

    if "certifications" in text_lower:
        score += 15
        feedback.append("Certifications section found")

    if "achievements" in text_lower:
        score += 10
        feedback.append("Achievements section found")

    if len(skills) >= 5:
        score += 20
        feedback.append("Strong skill coverage detected")

    return {
        "ats_score": score,
        "feedback": feedback
    }
