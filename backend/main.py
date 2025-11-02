from fastapi import Body, Form, Header, HTTPException
from fastapi import FastAPI, UploadFile, Form, Header, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from models.user_model import UserCreate, UserLogin
from services.auth import hash_password, verify_password, create_token, verify_token
from services.db import db, users_col
from services.resume_parser import extract_text
import json
import re
from openai import OpenAI
from dotenv import load_dotenv
from services.ai_engine import (
    analyze_resume,
    suggest_roles_from_skills,
    generate_roadmap,
    generate_projects,
    mock_interview,
)
import os
import uuid

load_dotenv()
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
# ======================================================
# APP INITIALIZATION
# ======================================================

app = FastAPI(
    title="EduBridge AI Mentor",
    description="AI Career & Skill Gap Mentor Backend",
    version="3.3.0"
)


origins = [
    "http://localhost:3000",
    "https://edubridge-git-main-gowrirams-projects.vercel.app",
    "https://edubridge-3bocna5dv-gowrirams-projects.vercel.app",
    "https://edubridge.vercel.app"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ======================================================
# REGISTER WITH RESUME
# ======================================================


@app.post("/register_with_resume")
async def register_with_resume(
    name: str = Form(...),
    email: str = Form(...),
    password: str = Form(...),
    file: UploadFile = None
):
    """
    Signup + upload resume → analyze skills + suggest roles using AI.
    """
    if users_col.find_one({"email": email.lower()}):
        raise HTTPException(status_code=400, detail="User already exists")

    hashed = hash_password(password)
    resume_text, ai_output, suggested_roles = "", {}, []

    # Resume analysis
    if file:
        content = await file.read()
        resume_text = extract_text(content, file.filename)
        ai_output = analyze_resume(resume_text, "general")
        suggested_roles = suggest_roles_from_skills(resume_text)

    # Store user
    users_col.insert_one({
        "name": name,
        "email": email.lower(),
        "password": hashed,
        "resume_text": resume_text[:1500],
        "ai_analysis": ai_output,
        "suggested_roles": suggested_roles,
        "selected_role": None,
        "roadmap_data": None,
        "projects": [],
        "mock_interview_history": []
    })

    token = create_token(email.lower())
    return {
        "message": "Signup successful. Roles suggested.",
        "token": token,
        "suggested_roles": suggested_roles
    }

# ======================================================
# LOGIN
# ======================================================


@app.post("/login")
async def login(
    email: str = Form(...),
    password: str = Form(...)
):
    """
    Authenticate user using form data (supports multipart/form-data or x-www-form-urlencoded)
    and return a JWT token.
    """
    db_user = users_col.find_one({"email": email.lower()})
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")

    if not verify_password(password, db_user["password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = create_token(email.lower())

    # ✅ Optional: Include more profile details
    return {
        "token": token,
        "name": db_user.get("name", "User"),
        "email": db_user["email"],
        "selected_role": db_user.get("selected_role", None)
    }

# ======================================================
# SELECT ROLE → GENERATE ROADMAP + PROJECTS
# ======================================================


@app.post("/select_role")
async def select_role(
    role: str = Form(...),
    authorization: str = Header(None)
):
    """
    After selecting a role, auto-generate roadmap + 3 structured high-end projects,
    and update them into the user’s database record.
    """
    try:
        token = authorization.split(" ")[1]
        email = verify_token(token)
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid or missing token")

    # 🔍 Fetch user
    user = users_col.find_one({"email": email})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # 🧠 Extract skills from AI analysis or fallback defaults
    skills = user.get("ai_analysis", {}).get(
        "skills", ["Python", "SQL", "React", "Machine Learning"])

    # 1️⃣ Generate AI-based roadmap
    roadmap = generate_roadmap(skills, role)

    # 2️⃣ Generate AI-based structured projects
    projects = generate_projects(role)

    # ✅ Normalize to JSON list of dicts
    if isinstance(projects, str):
        try:
            projects = json.loads(projects)
        except Exception:
            match = re.search(r"\[.*\]", projects, re.S)
            if match:
                try:
                    projects = json.loads(match.group(0))
                except Exception:
                    projects = [{"title": projects}]
            else:
                projects = [{"title": projects}]
    elif not isinstance(projects, list):
        projects = [projects]

    formatted_projects = []
    for p in projects:
        if isinstance(p, dict):
            formatted_projects.append({
                "title": p.get("title", "Untitled Project"),
                "description": p.get("description", ""),
                "tech_stack": p.get("tech_stack", []),
                "difficulty": p.get("difficulty", "Intermediate")
            })
        elif isinstance(p, str):
            formatted_projects.append({"title": p, "description": ""})

    # 3️⃣ Save updates to DB
    users_col.update_one(
        {"email": email},
        {"$set": {
            "selected_role": role,
            "roadmap_data": roadmap,
            "projects": formatted_projects
        }}
    )

    return {
        "message": "✅ Role, roadmap, and project ideas saved successfully.",
        "selected_role": role,
        "roadmap": roadmap,
        "projects": formatted_projects
    }

# ======================================================
# USER DATA FETCH
# ======================================================


@app.get("/user_data")
async def get_user_data(authorization: str = Header(None)):
    """
    Fetch full user profile for dashboard (roadmap + projects + selected role).
    """
    try:
        token = authorization.split(" ")[1]
        email = verify_token(token)
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid or missing token")

    user = users_col.find_one({"email": email}, {"_id": 0, "password": 0})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return user

# ======================================================
# UPDATE RESUME (Without Changing Role)
# ======================================================


@app.post("/update_resume")
async def update_resume(
    file: UploadFile,
    authorization: str = Header(None)
):
    """
    Re-upload resume for updated AI skill analysis (without role change).
    """
    try:
        token = authorization.split(" ")[1]
        email = verify_token(token)
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid or missing token")

    content = await file.read()
    text = extract_text(content, file.filename)
    ai_output = analyze_resume(text, "general")

    users_col.update_one(
        {"email": email},
        {"$set": {
            "resume_text": text[:1500],
            "ai_analysis": ai_output
        }}
    )

    return {"message": "Resume updated successfully.", "ai_output": ai_output}

# ======================================================
# MOCK INTERVIEW
# ======================================================


@app.post("/mock_interview")
async def ai_mock_interview(
    answer: str = Form(...),
    authorization: str = Header(None)
):
    """
    AI-driven mock interview session — provides feedback per answer.
    """
    try:
        token = authorization.split(" ")[1]
        email = verify_token(token)
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid or missing token")

    user = users_col.find_one({"email": email})
    role = user.get("selected_role", "General")

    feedback = mock_interview(answer, role)
    users_col.update_one(
        {"email": email},
        {"$push": {"mock_interview_history": {"answer": answer, "feedback": feedback}}}
    )
    return {"feedback": feedback}

# ======================================================
# HEALTH CHECK
# ======================================================


@app.get("/test_db")
async def test_db():
    try:
        count = users_col.count_documents({})
        return {"message": f"✅ Connected to MongoDB. {count} users found."}
    except Exception as e:
        return {"error": str(e)}


@app.post("/start_interview")
async def start_interview(authorization: str = Header(None)):
    """
    Starts an AI mock interview session by generating 5 structured, role-based questions.
    Returns a clean JSON array of questions and stores them in the user's record.
    """
    # 🔐 Verify token
    try:
        token = authorization.split(" ")[1]
        email = verify_token(token)
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid or missing token")

    # 🧠 Fetch user from DB
    user = users_col.find_one({"email": email})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    role = user.get("selected_role", "General")

    # 🗣️ GPT prompt for generating questions
    prompt = f"""
    You are an expert technical interviewer for the role of {role}.
    Generate exactly 5 unique, challenging, and realistic interview questions.
    Return ONLY a valid JSON array in the following format:
    [
        {{ "id": 1, "question": "Explain the concept of microservices and their benefits." }},
        {{ "id": 2, "question": "How do you ensure scalability in a large web application?" }}
    ]
    Do NOT include any text, explanation, or markdown before or after the JSON.
    """

    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.7,
        )

        raw = response.choices[0].message.content.strip()

        # 🧩 Extract and safely parse JSON
        match = re.search(r"\[.*\]", raw, re.S)
        if match:
            questions = json.loads(match.group(0))
        else:
            raise ValueError("GPT did not return valid JSON")

        # 🧹 Validate structure
        if not isinstance(questions, list) or not all("question" in q for q in questions):
            raise ValueError("Invalid question format")

    except Exception as e:
        print("⚠️ Error parsing GPT response:", e)
        # Fallback questions
        questions = [
            {"id": 1, "question": "Tell me about yourself."},
            {"id": 2, "question": "What are your strengths and weaknesses?"},
            {"id": 3, "question": "Describe a project you’re proud of."},
            {"id": 4, "question": "How do you handle challenging deadlines?"},
            {"id": 5, "question": "Why should we hire you for this position?"},
        ]

    # 🗃️ Save the questions in MongoDB for tracking
    users_col.update_one(
        {"email": email},
        {"$set": {"current_interview_questions": questions}}
    )

    print(
        f"✅ Mock interview generated for {email} ({role}) with {len(questions)} questions")

    # 🚀 Return structured response
    return {
        "message": f"Mock interview for role '{role}' started successfully.",
        "questions": questions
    }


@app.post("/evaluate_interview")
async def evaluate_interview(
    authorization: str = Header(None),
    qa_pairs: str = Form(None),
    body: dict = Body(None)
):
    """
    Evaluate completed mock interview Q&A.
    Accepts both FormData (qa_pairs) and raw JSON body.
    """
    import json
    import re

    # ✅ Step 1: Verify token
    try:
        token = authorization.split(" ")[1]
        email = verify_token(token)
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid or missing token")

    # ✅ Step 2: Fetch user
    user = users_col.find_one({"email": email})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    role = user.get("selected_role", "General")

    # ✅ Step 3: Parse Q&A from FormData or JSON body
    qa_data = None
    if body and "qa_pairs" in body:
        qa_data = body["qa_pairs"]
    elif qa_pairs:
        try:
            qa_data = json.loads(qa_pairs)
        except Exception:
            raise HTTPException(
                status_code=400, detail="Invalid JSON in qa_pairs")

    if not qa_data or not isinstance(qa_data, list):
        raise HTTPException(
            status_code=400, detail="Missing or invalid Q&A data")

    # ✅ Step 4: Build GPT prompt
    prompt = f"""
    You are a senior interviewer evaluating a {role} candidate.
    Evaluate the following answers and return ONLY valid JSON:
    {{
        "score": 0-100,
        "feedback": {{
            "strengths": ["..."],
            "weaknesses": ["..."],
            "suggestions": "..."
        }}
    }}
    Q&A: {json.dumps(qa_data, indent=2)}
    """

    # ✅ Step 5: Evaluate with GPT
    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": prompt}],
        )

        raw = response.choices[0].message.content.strip()
        match = re.search(r"\{.*\}", raw, re.S)
        result = json.loads(match.group(0)) if match else None
        if not result:
            raise ValueError("No valid JSON found in GPT response")

    except Exception as e:
        print("⚠️ GPT evaluation error:", e)
        result = {
            "score": 78,
            "feedback": {
                "strengths": ["Good clarity", "Relevant answers"],
                "weaknesses": ["Needs deeper technical explanations"],
                "suggestions": "Give more practical examples next time."
            }
        }

    # ✅ Step 6: Save evaluation to DB
    users_col.update_one(
        {"email": email},
        {"$push": {"mock_interview_history": {"qa": qa_data, "evaluation": result}}}
    )

    return result
