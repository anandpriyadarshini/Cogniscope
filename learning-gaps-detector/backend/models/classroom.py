from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime
import uuid
import string
import random


class ClassroomCreate(BaseModel):
    """Model for creating a new classroom"""
    name: str
    description: Optional[str] = None
    subject: Optional[str] = None


class ClassroomMember(BaseModel):
    """Model for classroom membership"""
    student_id: str
    student_name: str
    joined_at: datetime


class Classroom(BaseModel):
    """Model for a classroom"""
    classroom_id: str
    teacher_id: str
    teacher_name: str
    name: str
    description: Optional[str] = None
    subject: Optional[str] = None
    join_code: str
    created_at: datetime
    members: List[ClassroomMember] = []
    quiz_ids: List[str] = []  # IDs of quizzes in this classroom

    @staticmethod
    def generate_join_code() -> str:
        """Generate a unique 6-character join code"""
        characters = string.ascii_uppercase + string.digits
        return ''.join(random.choice(characters) for _ in range(6))


class JoinClassroomRequest(BaseModel):
    """Model for student joining a classroom"""
    student_id: str
    student_name: str
    join_code: str


class ClassroomResponse(BaseModel):
    """Model for classroom response"""
    classroom_id: str
    teacher_id: str
    teacher_name: str
    name: str
    description: Optional[str] = None
    subject: Optional[str] = None
    join_code: str
    created_at: str
    member_count: int
    quiz_count: int
    is_member: bool = False
