from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime


class Question(BaseModel):
    id: int
    text: str
    options: List[str]
    correct_answer: int
    concept: str


class QuizAttempt(BaseModel):
    question_id: int
    selected_answer: int
    time_taken: float  # seconds
    confidence: int  # 1-5 scale
    is_correct: bool


class StudentSubmission(BaseModel):
    student_id: str
    quiz_id: str
    attempts: List[QuizAttempt]
    timestamp: datetime = None
    
    def __init__(self, **data):
        if data.get('timestamp') is None:
            data['timestamp'] = datetime.now()
        super().__init__(**data)
