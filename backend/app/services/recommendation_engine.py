# ==========================================
# AI RESUME RECOMMENDATION ENGINE V2
# ==========================================

def generate_recommendations(
    found_sections,
    missing_sections,
    skills,
    ats_score,
    candidate_profile="B.Tech/Fresher",
):

    recommendations = []

    skills = set(skills)

    # ==========================================
    # MISSING SECTIONS
    # ==========================================

    if "Career Objective" in missing_sections:
        recommendations.append(
            "Add a short Career Objective or Professional Summary tailored to the job role."
        )

    if "Experience" in missing_sections:
        recommendations.append(
            "Include internships, freelance work, research projects, or significant personal projects in an Experience section."
        )

    # ==========================================
    # SKILL ANALYSIS
    # ==========================================

    skill_count = len(skills)

    if skill_count < 8:
        recommendations.append(
            "Increase your technical skill set by learning technologies relevant to your target role."
        )

    # Programming Languages

    languages = {
        "Python",
        "Java",
        "C",
        "C++",
        "JavaScript",
        "TypeScript",
        "Go",
        "Rust"
    }

    if len(skills.intersection(languages)) < 2:
        recommendations.append(
            "Learn at least one additional programming language to improve versatility."
        )

    # Cloud

    cloud = {
        "AWS",
        "Azure",
        "GCP"
    }

    if skills.isdisjoint(cloud):
        recommendations.append(
            "Cloud platforms such as AWS, Azure, or Google Cloud are highly valued by recruiters."
        )

    # Databases

    databases = {
        "SQL",
        "MongoDB",
        "PostgreSQL",
        "Redis"
    }

    if skills.isdisjoint(databases):
        recommendations.append(
            "Learn SQL and database fundamentals for software engineering and data-related roles."
        )

    # Version Control

    if "Git" not in skills:
        recommendations.append(
            "Add Git version control experience to your resume."
        )

    # Backend

    backend = {
        "FastAPI",
        "Flask",
        "Django",
        "Node.js",
        "Express",
        "Spring Boot"
    }

    if skills.isdisjoint(backend):
        recommendations.append(
            "Learning one backend framework will strengthen your software development profile."
        )

    # Frontend

    frontend = {
        "React",
        "Angular",
        "Vue"
    }

    if skills.isdisjoint(frontend):
        recommendations.append(
            "Basic frontend development skills can significantly improve full-stack opportunities."
        )

    # DevOps

    devops = {
        "Docker",
        "Kubernetes",
        "Jenkins",
        "Terraform"
    }

    if skills.isdisjoint(devops):
        recommendations.append(
            "Learning Docker and basic DevOps tools will improve your industry readiness."
        )

    # AI

    ai = {
        "Machine Learning",
        "Deep Learning",
        "TensorFlow",
        "PyTorch"
    }

    if not skills.isdisjoint(ai):
        recommendations.append(
            "Include measurable AI or Machine Learning project outcomes with metrics wherever possible."
        )

    # ==========================================
    # ATS SCORE
    # ==========================================

    if ats_score < 60:

        recommendations.append(
            "Your ATS score is low. Focus on improving resume structure, adding missing sections, and including more relevant keywords."
        )

    elif ats_score < 80:

        recommendations.append(
            "Improve ATS compatibility by adding role-specific keywords and stronger project descriptions."
        )

    elif ats_score < 90:

        recommendations.append(
            "Your resume is strong, but adding quantified achievements and more technical depth can further improve it."
        )

    # ==========================================
    # GENERAL RECOMMENDATIONS
    # ==========================================

    recommendations.append(
        "Use action verbs such as Developed, Designed, Built, Implemented, Optimized, and Automated."
    )

    recommendations.append(
        "Quantify achievements using numbers whenever possible (for example: Improved accuracy by 20% or Managed 500+ records)."
    )

    recommendations.append(
        "Tailor your resume for every job application instead of using one generic resume."
    )

    recommendations.append(
        "Keep your resume concise, professional, and ideally limited to one page."
    )

    # ==========================================
    # REMOVE DUPLICATES
    # ==========================================

    recommendations = list(dict.fromkeys(recommendations))

    return recommendations
