import os
import re
import random
from collections import Counter
from openai import OpenAI
from dotenv import load_dotenv

# ======================================================
# Initialization
# ======================================================

load_dotenv()
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# ======================================================
# Helper: Extract Skills (Safe Version)
# ======================================================


def extract_skills(text: str):
    """
    Extracts known technical skills from text safely using escaped regex.
    Prevents regex errors with special characters like +, #, and .
    """
    keywords = [
        "Python", "Java", "C++", "C#", "SQL", "HTML", "CSS", "JavaScript",
        "React", "Node.js", "Express", "Django", "Flask", "TensorFlow",
        "PyTorch", "AWS", "Azure", "Docker", "Kubernetes", "Pandas",
        "NumPy", "Power BI", "Tableau", "Excel", "Machine Learning",
        "Deep Learning", "Data Analysis", "FastAPI", "NLP", "DevOps", "Git"
    ]

    found = [
        kw for kw in keywords
        if re.search(rf"\b{re.escape(kw.lower())}\b", text.lower())
    ]
    return list(set(found))

# ======================================================
# AI: Resume Analyzer (GPT-4o)
# ======================================================


def analyze_resume(text, target_role):
    """
    Uses GPT to analyze a resume: extracts skills, missing areas, and suggests improvement steps.
    """
    prompt = f"""
    You are an expert AI career mentor. Analyze this resume:
    {text}

    Target role: {target_role}.
    Identify:
    1. Top skills found.
    2. Missing skills to improve.
    3. A short 3-step learning roadmap.
    Return your response in a clear bullet list format.
    """
    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": prompt}]
        )
        ai_text = response.choices[0].message.content
    except Exception as e:
        ai_text = f"⚠️ AI analysis unavailable ({e}). Using fallback."

    extracted_skills = extract_skills(text)
    return {"ai_summary": ai_text, "skills": extracted_skills}

# ======================================================
# AI: Mock Interview (GPT-4o)
# ======================================================


def mock_interview(answer, role):
    """
    Generates dynamic feedback from AI for mock interview answers.
    """
    prompt = f"""
    You are a professional interviewer for the role: {role}.
    Candidate's last answer:
    "{answer}"
    
    Provide constructive feedback and one follow-up question.
    """
    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": prompt}]
        )
        return response.choices[0].message.content
    except Exception as e:
        return f"Mock interview AI failed ({e}). Try again later."

# ======================================================
# AI: Generate Projects (GPT-4o)
# ======================================================


def generate_projects(role: str):
    """
    Generates 3 advanced, structured project ideas in JSON format 
    tailored to the user's selected role.
    Each project includes:
      - title
      - description
      - tech_stack
      - difficulty
    """
    prompt = f"""
    You are an expert mentor for the role of {role}.
    Suggest 3 advanced, resume-worthy project ideas suitable for professionals aiming to master this role.

    Return the output in **pure JSON format**, strictly structured as follows:

    [
      {{
        "title": "Project title",
        "description": "A concise 2-3 line description of what the project achieves.",
        "tech_stack": ["Tech1", "Tech2", "Tech3"],
        "difficulty": "Beginner | Intermediate | Advanced"
      }},
      ...
    ]

    Do not include any additional text or explanation outside the JSON.
    """

    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.7
        )
        import json
        raw_output = response.choices[0].message.content.strip()

        # Try parsing JSON safely
        try:
            projects_json = json.loads(raw_output)
        except json.JSONDecodeError:
            # If GPT returns slightly malformed JSON, fix it gracefully
            import re
            cleaned = re.sub(r"```json|```", "", raw_output).strip()
            projects_json = json.loads(cleaned)

        return projects_json

    except Exception as e:
        print(f"[⚠️ Fallback Project Generation Triggered]: {e}")

        # Fallback sample structured data
        fallback_projects = {
            "Data Scientist": [
                {
                    "title": "ML Pipeline for Customer Churn Prediction",
                    "description": "Develop a machine learning pipeline using Python and scikit-learn to predict customer churn from real-world telecom datasets.",
                    "tech_stack": ["Python", "scikit-learn", "Pandas", "Flask", "Docker"],
                    "difficulty": "Intermediate"
                },
                {
                    "title": "Sentiment Analysis Dashboard",
                    "description": "Create a live dashboard that visualizes sentiment analysis of Twitter data using NLP and Plotly Dash.",
                    "tech_stack": ["Python", "NLTK", "Plotly", "Dash", "API Integration"],
                    "difficulty": "Advanced"
                },
                {
                    "title": "AI-Powered Fraud Detection System",
                    "description": "Build a fraud detection model using anomaly detection algorithms and deploy it as a real-time API service.",
                    "tech_stack": ["Python", "TensorFlow", "FastAPI", "MongoDB"],
                    "difficulty": "Advanced"
                }
            ],
            "Full Stack Developer": [
                {
                    "title": "MERN Stack Project Management Tool",
                    "description": "Develop a task tracking and collaboration app with authentication, Kanban boards, and analytics.",
                    "tech_stack": ["MongoDB", "Express.js", "React", "Node.js", "JWT"],
                    "difficulty": "Advanced"
                },
                {
                    "title": "AI Resume Builder Platform",
                    "description": "Create a resume builder powered by GPT suggestions, with PDF export and user authentication.",
                    "tech_stack": ["React", "Flask", "OpenAI API", "MongoDB"],
                    "difficulty": "Intermediate"
                },
                {
                    "title": "E-Commerce Platform with ML Recommendations",
                    "description": "Design a complete e-commerce platform with personalized product recommendations and Stripe payments.",
                    "tech_stack": ["Next.js", "Node.js", "MongoDB", "Machine Learning"],
                    "difficulty": "Advanced"
                }
            ]
        }

        return fallback_projects.get(role, [
            {
                "title": "AI Innovation Hub",
                "description": "Create a web-based AI experimentation platform for deploying and testing AI models.",
                "tech_stack": ["Python", "FastAPI", "React", "TensorFlow"],
                "difficulty": "Advanced"
            }
        ])


# ======================================================
# Logic: Suggest Roles from Skills
# ======================================================


def suggest_roles_from_skills(text):
    """Suggest trending tech roles based on keywords extracted from resume text."""
    skills = extract_skills(text)
    role_map = {
        "Data Scientist": ["Python", "Pandas", "Machine Learning", "Deep Learning", "SQL", "Power BI"],
        "AI Engineer": ["Python", "TensorFlow", "PyTorch", "NLP", "Deep Learning", "AI"],
        "Frontend Developer": ["JavaScript", "React", "HTML", "CSS"],
        "Backend Developer": ["Node.js", "Express", "Flask", "Django", "FastAPI", "SQL", "MongoDB"],
        "DevOps Engineer": ["Docker", "Kubernetes", "AWS", "Git", "CI", "Cloud"],
        "Cybersecurity Analyst": ["Network", "Security", "Firewall", "Cybersecurity", "Encryption"],
        "Full Stack Developer": ["React", "Node.js", "Flask", "MongoDB", "HTML", "CSS"],
        "Data Analyst": ["Excel", "Power BI", "Python", "SQL", "Data Analysis"]
    }

    role_scores = {}
    for role, required in role_map.items():
        overlap = len(set(required) & set(skills))
        if overlap > 0:
            role_scores[role] = overlap

    suggested_roles = [r for r, _ in Counter(role_scores).most_common(5)]
    if not suggested_roles:
        suggested_roles = ["AI Engineer",
                           "Data Scientist", "Full Stack Developer"]

    return suggested_roles

# ======================================================
# Logic: Generate Roadmap
# ======================================================


def generate_roadmap(skills, target_role):
    """
    Uses GPT to generate a *detailed, structured, and multi-phase learning roadmap*
    based on the user's current skills and target career role.
    """

    from openai import OpenAI
    import os
    import json
    import random
    from dotenv import load_dotenv

    load_dotenv()
    client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

    # 🔍 Construct a richer and more directive prompt
    prompt = f"""
    You are an expert AI career coach.

    The user has these current skills:
    {skills}

    The user wants to become a **{target_role}**.

    Create a detailed, multi-phase learning roadmap that will guide the user 
    from beginner/intermediate level to a professional {target_role}.
    
    Requirements:
    - Divide the roadmap into **5 to 7 phases**.
    - Each phase must include:
      1. A **phase title** (e.g., "Phase 2: Core Development Skills")
      2. A short **objective** (1–2 sentences)
      3. A list of **key topics or tools to learn**
      4. Expected **duration in weeks**
      5. 1–2 **practical tasks or mini-projects**

    Return the output **strictly in JSON** format like this:

    {{
        "target_role": "{target_role}",
        "timeline_weeks": <total_estimated_weeks>,
        "roadmap": [
            {{
                "phase": "Phase 1: <title>",
                "objective": "<brief goal of this phase>",
                "focus": ["topic1", "topic2", "topic3"],
                "projects": ["mini project idea 1", "mini project idea 2"],
                "duration_weeks": <int>
            }},
            ...
        ]
    }}
    """

    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system",
                    "content": "You are a precise and structured AI roadmap generator."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.75,
        )

        ai_text = response.choices[0].message.content.strip()

        # ✅ Parse GPT output safely
        try:
            roadmap_json = json.loads(ai_text)
        except json.JSONDecodeError:
            print("⚠️ GPT returned non-JSON text, fallback applied.")
            roadmap_json = {
                "target_role": target_role,
                "timeline_weeks": random.randint(12, 24),
                "roadmap": [
                    {
                        "phase": "Phase 1: Foundations",
                        "objective": "Learn core concepts and tools for the role.",
                        "focus": ["Core Programming", "Version Control", "Linux Basics"],
                        "projects": ["CLI-based utility project"],
                        "duration_weeks": 3
                    },
                    {
                        "phase": "Phase 2: Intermediate Practice",
                        "objective": "Work on key role-specific tools and frameworks.",
                        "focus": ["Cloud Basics", "Automation", "APIs"],
                        "projects": ["Deploy a small app on AWS"],
                        "duration_weeks": 4
                    },
                    {
                        "phase": "Phase 3: Advanced Topics",
                        "objective": "Focus on scalability and performance.",
                        "focus": ["CI/CD", "Monitoring", "Kubernetes"],
                        "projects": ["Implement a CI/CD pipeline"],
                        "duration_weeks": 5
                    },
                    {
                        "phase": "Phase 4: Capstone Project",
                        "objective": "Integrate all skills into a final project.",
                        "focus": ["Integration", "Testing", "Documentation"],
                        "projects": ["Full deployment automation project"],
                        "duration_weeks": 4
                    }
                ]
            }

        return roadmap_json

    except Exception as e:
        print("❌ GPT Roadmap Generation Failed:", e)

        # 🔁 Static fallback
        return {
            "target_role": target_role,
            "timeline_weeks": random.randint(10, 20),
            "roadmap": [
                {
                    "phase": "Phase 1: Strengthen Fundamentals",
                    "objective": "Revisit key foundational skills.",
                    "focus": ["Python", "Git", "Networking Basics"],
                    "projects": ["Build CLI monitoring tool"],
                    "duration_weeks": 3
                },
                {
                    "phase": "Phase 2: Intermediate Concepts",
                    "objective": "Develop core technical and practical experience.",
                    "focus": ["Docker", "CI/CD", "APIs"],
                    "projects": ["Automate app deployment with Docker"],
                    "duration_weeks": 4
                },
                {
                    "phase": "Phase 3: Advanced Topics",
                    "objective": "Dive deep into cloud and scaling.",
                    "focus": ["AWS", "Kubernetes", "Security"],
                    "projects": ["Kubernetes deployment pipeline"],
                    "duration_weeks": 4
                },
                {
                    "phase": "Phase 4: Capstone Project",
                    "objective": "Combine all knowledge into a major final project.",
                    "focus": ["Integration", "Optimization"],
                    "projects": ["Full DevOps system automation"],
                    "duration_weeks": 3
                }
            ]
        }
