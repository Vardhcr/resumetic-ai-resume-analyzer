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
    # A project heading earns the base points. The remaining project points are
    # earned below through evidence of active, deployed, or live work.
    "Projects": (8, ("projects", "academic projects", "personal projects", "selected projects")),
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


def detect_candidate_profile(text: str) -> str:
    """Identify the academic context so optional sections are judged fairly."""
    normalized = (text or "").lower()
    if re.search(r"\b(?:ph\.?d\.?|doctorate|doctoral)\b", normalized):
        return "PhD"
    if re.search(r"\b(?:m\.?tech\.?|m\.?s\.?|m\.sc\.?|master(?:'s| of)?)\b", normalized):
        return "M.Tech/MS"
    return "B.Tech/Fresher"


def _project_portfolio_points(text: str) -> tuple[int, str]:
    """Reward proof of software work, which is especially valuable to interns."""
    normalized = text.lower()
    live_markers = re.findall(
        r"\b(?:live demo|live project|deployed|in production|production app|hosted on|"
        r"netlify\.app|vercel\.app|render\.com|railway\.app)\b",
        normalized,
    )
    repository_links = re.findall(r"github\.com/[\w.-]+/[\w.-]+", normalized)
    current_work = bool(re.search(r"\b(?:current project|currently building|ongoing project|in progress)\b", normalized))
    major_project = bool(re.search(r"\b(?:final[ -]year|capstone|major project|thesis project)\b", normalized))

    # One point per distinct live/deployed signal or repository, capped to avoid
    # turning a long URL list into an inflated score. Current work earns one
    # additional point because it demonstrates active practical experience.
    evidence_count = len(set(live_markers)) + len(set(repository_links))
    points = min(evidence_count, 4) + int(current_work) + (2 if major_project else 0)
    points = min(points, 7)

    if points >= 4:
        return points, "Strong project portfolio with live, deployed, or repository evidence"
    if points:
        return points, "Add live demo links, deployed URLs, or GitHub repositories to strengthen project evidence"
    return 0, "Add live projects, deployed links, or GitHub repositories to demonstrate practical software experience"


def _academic_profile_points(text: str, profile: str) -> tuple[int, str]:
    """Score research evidence only when it is appropriate to the profile."""
    if profile == "B.Tech/Fresher":
        return 0, "B.Tech/Fresher profile: project portfolio is weighted above publications and research"

    normalized = text.lower()
    thesis = bool(re.search(r"\b(?:thesis|dissertation)\b", normalized))
    research_experience = bool(re.search(r"\b(?:research experience|research assistant|research intern|researcher|laboratory)\b", normalized))

    if profile == "PhD":
        points = (4 if thesis else 0) + (6 if research_experience else 0)
    else:  # M.Tech/MS
        points = (5 if thesis else 0) + (5 if research_experience else 0)

    if points:
        return points, f"{profile} research profile: thesis and research experience recognised"
    return 0, f"{profile} profile: add relevant thesis or research experience if available"


def _achievement_points(text: str) -> tuple[int, str]:
    """Reward meaningful professional distinctions, with a strict 10-point cap."""
    normalized = text.lower()
    points = 0
    points += 3 if re.search(r"\b(?:hackathon winner|won .*hackathon|hackathon champion)\b", normalized) else 0
    points += 2 if re.search(r"\b(?:aws|azure|google cloud|gcp).{0,40}\bcertif", normalized) else 0
    points += 4 if re.search(r"\b(?:national (?:level )?(?:competition|contest)|research award)\b", normalized) else 0
    points += 3 if re.search(r"\b(?:open[ -]source contributor|contributed to open source|kaggle (?:medal|expert|master))\b", normalized) else 0
    points = min(points, 7)  # + 3 points for the Achievements heading = max 10.

    if points:
        return points, "Professional achievements and certifications strengthen the profile"
    return 0, "Add relevant certifications, hackathons, open-source work, or competition achievements"


def calculate_ats_score(text: str, skills: list[str]):
    """Calculate a 0–100 ATS-readiness score from extracted resume text."""
    text = text or ""
    normalized_text = text.lower()
    headings = _heading_lines(text)
    words = re.findall(r"\b[\w+#.-]+\b", text)
    word_count = len(words)
    feedback = []
    breakdown = []
    candidate_profile = detect_candidate_profile(text)

    # Standard headings, detected only as headings, not prose.
    for label, (weight, aliases) in SECTION_RULES.items():
        present = _has_section(headings, aliases)
        points = weight if present else 0
        breakdown.append({"label": label, "points": points, "maximum": weight})
        feedback.append(_quality_feedback(label, present))

    # 5 points: practical project evidence is a valid substitute for formal
    # employment when evaluating internship and entry-level candidates.
    project_points, project_feedback = _project_portfolio_points(text)
    breakdown.append({"label": "Project portfolio", "points": project_points, "maximum": 7})
    feedback.append(project_feedback)

    research_points, research_feedback = _academic_profile_points(text, candidate_profile)
    if candidate_profile != "B.Tech/Fresher":
        breakdown.append({"label": "Research profile", "points": research_points, "maximum": 10})
    feedback.append(research_feedback)

    achievement_points, achievement_feedback = _achievement_points(text)
    breakdown.append({"label": "Professional achievements", "points": achievement_points, "maximum": 7})
    feedback.append(achievement_feedback)

    # 10 points: a useful, but not inflated, technical skill inventory.
    skill_count = len(set(skills))
    skill_points = 10 if skill_count >= 12 else 8 if skill_count >= 8 else 5 if skill_count >= 4 else 0
    breakdown.append({"label": "Technical skill coverage", "points": skill_points, "maximum": 10})
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
    breakdown.append({"label": "Measurable impact", "points": impact_points, "maximum": 8})
    if impact_points < 5:
        feedback.append("Use action verbs and quantified outcomes in project and experience bullets")
    else:
        feedback.append("Good use of action verbs and measurable outcomes")

    # 4 points: reachable professional contact links.
    has_linkedin = "linkedin.com" in normalized_text
    has_github = "github.com" in normalized_text
    has_email = bool(re.search(r"\b[\w.+-]+@[\w-]+\.[\w.-]+\b", text))
    link_points = int(has_linkedin) + int(has_github) + int(has_email) + int(has_linkedin and has_github)
    breakdown.append({"label": "Contact and professional links", "points": link_points, "maximum": 4})
    if link_points < 3:
        feedback.append("Include a professional email and relevant LinkedIn or GitHub links")

    # 10 points: reward concise, recruiter-friendly length; do not call it "one page"
    # because page count cannot be reliably inferred from extracted PDF text.
    if 300 <= word_count <= 900:
        length_points = 10
        feedback.append("Resume length is concise and recruiter friendly")
    elif 200 <= word_count < 300 or 900 < word_count <= 1200:
        length_points = 6
        feedback.append("Resume length is acceptable but could be tightened")
    else:
        length_points = 0
        if word_count:
            feedback.append("Resume length needs attention; aim for focused, relevant content")
    breakdown.append({"label": "Resume length", "points": length_points, "maximum": 10})

    # 8 points: readability from a sufficient number of distinct heading lines.
    heading_count = len(headings.intersection({
        _normalise_heading(alias)
        for _, aliases in SECTION_RULES.values()
        for alias in aliases
    }))
    readability_points = 8 if heading_count >= 5 else 5 if heading_count >= 3 else 2 if heading_count else 0
    breakdown.append({"label": "ATS-readable headings", "points": readability_points, "maximum": 8})
    if readability_points < 8:
        feedback.append("Use clear, standalone section headings for reliable ATS parsing")

    raw_points = sum(item["points"] for item in breakdown)
    maximum_points = sum(item["maximum"] for item in breakdown)
    score = round((raw_points / maximum_points) * 100) if maximum_points else 0
    strength = "Excellent" if score >= 90 else "Very Good" if score >= 80 else "Good" if score >= 70 else "Average" if score >= 60 else "Needs Improvement"

    return {
        "ats_score": score,
        "resume_strength": strength,
        "candidate_profile": candidate_profile,
        "score_breakdown": breakdown,
        "raw_points": raw_points,
        "maximum_points": maximum_points,
        "feedback": feedback,
    }
