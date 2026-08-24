import unittest

from app.services.ats_scorer import calculate_ats_score
from app.services.section_analyzer import analyze_resume_sections


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

        self.assertGreaterEqual(result["ats_score"], 70)

    def test_live_projects_and_current_work_improve_entry_level_score(self):
        base_text = """Projects
        Inventory dashboard built with React and FastAPI."""
        portfolio_text = """Projects
        Inventory dashboard — github.com/jane/inventory-dashboard
        Deployed live demo: https://inventory-dashboard.netlify.app
        Currently building an analytics extension as an ongoing project."""

        base = calculate_ats_score(base_text, [])
        portfolio = calculate_ats_score(portfolio_text, [])

        self.assertGreater(portfolio["ats_score"], base["ats_score"])
        self.assertIn("Strong project portfolio with live, deployed, or repository evidence", portfolio["feedback"])

    def test_postgraduate_research_is_scored_but_not_required_for_freshers(self):
        fresher = calculate_ats_score("Education\nB.Tech in Computer Science", [])
        postgrad = calculate_ats_score(
            "Education\nM.Tech in Computer Science\nThesis\nResearch assistant\nPublications\nConference paper",
            [],
        )

        self.assertEqual(fresher["candidate_profile"], "B.Tech/Fresher")
        self.assertEqual(postgrad["candidate_profile"], "M.Tech/MS")
        self.assertGreater(postgrad["ats_score"], fresher["ats_score"])

    def test_publications_are_not_an_expected_section(self):
        sections = analyze_resume_sections("Education\nM.Tech", "M.Tech/MS")

        self.assertNotIn("Publications", sections["sections"])


if __name__ == "__main__":
    unittest.main()
