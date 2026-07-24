import unittest

from app.services.ats_scorer import calculate_ats_score


class AtsScorerTests(unittest.TestCase):
    def test_section_words_in_prose_do_not_receive_section_points(self):
        text = """I improved my education and skills through projects.
        My experience includes training and awards from school."""

        result = calculate_ats_score(text, [])

        self.assertLess(result["ats_score"], 20)
        self.assertIn("Consider adding a clear Education section", result["feedback"])

    def test_well_structured_concise_resume_scores_well(self):
        text = """Jane Doe | jane@example.com | linkedin.com/in/jane | github.com/jane
        Professional Summary
        Software engineer focused on reliable web applications.
        Education
        B.Tech in Computer Science
        Technical Skills
        Python, React, SQL, Docker
        Experience
        Developed and optimized APIs, reducing response time by 30% for 1000 users.
        Projects
        Built an analytics platform used by 50 customers.
        Certifications
        AWS Certified Cloud Practitioner
        Achievements
        Awarded first place in a university hackathon."""

        result = calculate_ats_score(text, [
            "Python", "JavaScript", "TypeScript", "React", "SQL", "Docker",
            "Git", "FastAPI", "AWS", "PostgreSQL", "Linux", "Kubernetes",
        ])

        self.assertGreaterEqual(result["ats_score"], 80)


if __name__ == "__main__":
    unittest.main()
