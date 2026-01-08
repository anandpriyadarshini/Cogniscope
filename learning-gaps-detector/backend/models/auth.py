from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

class User(BaseModel):
    """User model for authentication"""
    id: Optional[str] = None
    name: str
    email: EmailStr
    password_hash: str
    role: str  # 'student' or 'teacher'
    subject: Optional[str] = None  # For teachers
    created_at: Optional[datetime] = None
    last_login: Optional[datetime] = None

class LoginRequest(BaseModel):
    """Login request model"""
    email: str
    password: str
    role: str  # 'student' or 'teacher' - to validate against registered role

class SignupRequest(BaseModel):
    """Signup request model"""
    name: str
    email: EmailStr
    password: str
    role: str  # 'student' or 'teacher'
    subject: Optional[str] = None  # For teachers

class AuthResponse(BaseModel):
    """Authentication response model"""
    success: bool
    message: str
    user: Optional[dict] = None
    token: Optional[str] = None
