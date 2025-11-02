from passlib.context import CryptContext
from jose import jwt, JWTError
import os
import datetime
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# JWT configuration
SECRET_KEY = os.getenv("SECRET_KEY", "secretkey")
ALGORITHM = "HS256"

# Password hashing setup
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str):
    """
    Hash a password safely.
    Bcrypt only supports passwords up to 72 bytes, so we truncate.
    """
    password = password[:72]
    return pwd_context.hash(password)


def verify_password(plain: str, hashed: str):
    """
    Verify a plain-text password against its hash.
    """
    plain = plain[:72]
    return pwd_context.verify(plain, hashed)


def create_token(email: str):
    """
    Generate a JWT token for a given email with 3-hour expiry.
    """
    expire = datetime.datetime.utcnow() + datetime.timedelta(hours=3)
    payload = {"sub": email, "exp": expire}
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


def verify_token(token: str):
    """
    Verify and decode JWT token; returns user email if valid.
    Raises ValueError if invalid or expired.
    """
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email = payload.get("sub")
        if not email:
            raise ValueError("Invalid token payload")
        return email
    except JWTError as e:
        raise ValueError(f"Invalid or expired token: {e}")
