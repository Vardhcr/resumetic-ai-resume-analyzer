"""Deterministic, explainable ATS-readiness scoring.

This is an ATS-readiness signal, not a prediction of whether a candidate will
be hired.  It deliberately rewards real resume structure and useful content,
rather than awarding points because a section name appears in body text.
"""

import re
from collections.abc import Iterable


SECTION_RULES = {
    "Education": (10, ("education", "academic background", "academic qualifications", "qualifications")),
    "Skills": (13, ("skills", "technical skills", "core skills", "technical expertise", "competencies")),
    "Projects": (13, ("projects", "academic projects", "personal projects", "selected projects")),
    "Experience": (14, ("experience", "work experience", "professional experience", "work history", "employment history", "internships")),
    "Certifications": (4, ("certifications", "licenses", "training")),
    "Achievements": (3, ("achievements", "awards", "honors", "accomplishments")),
    "Career Objective": (3, ("career objective", "professional summary", "summary", "profile")),
}

ACTION_VERBS = {
    "achieved", "automated", "built", "created", "delivered", "designed",
    "developed", "improved", "implemented", "increased", "launched",
    "led", "managed", "optimized", "reduced", "streamlined",
}


def _normalise_heading(value: str) -> str:
    """Return a comparison-friendly version of a possible section heading."""
    value = re.sub(r"^[\s\-•*#]+|[\s:|\-–—]+$", "", value.lower())
    return re.sub(r"\s+", " ", value)


def _heading_lines(text: str) -> set[str]:
    """Extract short, standalone lines that can credibly be section headings."""
    headings = set()
    for line in text.splitlines():
        heading = _normalise_heading(line)
        # Long prose lines such as "add your skills..." must never count.
        if heading and len(heading) <= 48 and len(heading.split()) <= 6:
            headings.add(heading)
    return headings


def _has_section(headings: set[str], aliases: Iterable[str]) -> bool:
    return any(_normalise_heading(alias) in headings for alias in aliases)


def _quality_feedback(label: str, present: bool) -> str:
    return f"{label} section found" if present else f"Consider adding a clear {label} section"


def calculate_ats_score(text: str, skills: list[str]):
    """Calculate a 0–100 ATS-readiness score from extracted resume text."""
    text = text or ""
    normalized_text = text.lower()
    headings = _heading_lines(text)
    words = re.findall(r"\b[\w+#.-]+\b", text)
    word_count = len(words)
    score = 0
    feedback = []

    # 60 points: standard headings, detected only as headings, not prose.
    for label, (weight, aliases) in SECTION_RULES.items():
        present = _has_section(headings, aliases)
        if present:
            score += weight
        feedback.append(_quality_feedback(label, present))

    # 10 points: a useful, but not inflated, technical skill inventory.
    skill_count = len(set(skills))
    skill_points = 10 if skill_count >= 12 else 8 if skill_count >= 8 else 5 if skill_count >= 4 else 0
    score += skill_points
    if skill_points == 10:
        feedback.append("Strong technical skill coverage")
    elif skill_points:
        feedback.append("Add more role-relevant technical skills")
    else:
        feedback.append("No clear technical skills detected")

    # 8 points: evidence of impact in experience/project descriptions.
    action_verb_count = len(set(re.findall(r"\b[a-z]+\b", normalized_text)).intersection(ACTION_VERBS))
    metric_count = len(re.findall(r"(?:\b\d+(?:\.\d+)?\s*%|\b\d+[+x]|\$\s*\d+|\b\d+\s+(?:users|customers|hours|days|months|records|projects))", normalized_text))
    impact_points = min(action_verb_count, 4) + min(metric_count, 4)
    score += impact_points
    if impact_points < 5:
        feedback.append("Use action verbs and quantified outcomes in project and experience bullets")
    else:
        feedback.append("Good use of action verbs and measurable outcomes")

    # 4 points: reachable professional contact links.
    has_linkedin = "linkedin.com" in normalized_text
    has_github = "github.com" in normalized_text
    has_email = bool(re.search(r"\b[\w.+-]+@[\w-]+\.[\w.-]+\b", text))
    link_points = int(has_linkedin) + int(has_github) + int(has_email) + int(has_linkedin and has_github)
    score += link_points
    if link_points < 3:
        feedback.append("Include a professional email and relevant LinkedIn or GitHub links")

    # 10 points: reward concise, recruiter-friendly length; do not call it "one page"
    # because page count cannot be reliably inferred from extracted PDF text.
    if 300 <= word_count <= 900:
        score += 10
        feedback.append("Resume length is concise and recruiter friendly")
    elif 200 <= word_count < 300 or 900 < word_count <= 1200:
        score += 6
        feedback.append("Resume length is acceptable but could be tightened")
    elif word_count:
        feedback.append("Resume length needs attention; aim for focused, relevant content")

    # 8 points: readability from a sufficient number of distinct heading lines.
    heading_count = len(headings.intersection({
        _normalise_heading(alias)
        for _, aliases in SECTION_RULES.values()
        for alias in aliases
    }))
    readability_points = 8 if heading_count >= 5 else 5 if heading_count >= 3 else 2 if heading_count else 0
    score += readability_points
    if readability_points < 8:
        feedback.append("Use clear, standalone section headings for reliable ATS parsing")

    score = min(score, 100)
    strength = "Excellent" if score >= 90 else "Very Good" if score >= 80 else "Good" if score >= 70 else "Average" if score >= 60 else "Needs Improvement"

    return {"ats_score": score, "resume_strength": strength, "feedback": feedback}
