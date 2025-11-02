from pymongo import MongoClient
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Read MongoDB connection string from .env
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/edubridge")

# Initialize MongoDB client
client = MongoClient(MONGO_URI)

# Select database
db = client["edubridge"]

# Define collections
users_col = db["users"]        # Stores registered users (auth info)
projects_col = db["projects"]  # Stores AI-generated project ideas
resumes_col = db["resumes"]    # Optional: store resume analysis data

# Quick connection check
print(f"✅ Connected to MongoDB at {MONGO_URI}")
