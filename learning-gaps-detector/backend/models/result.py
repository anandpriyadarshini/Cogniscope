from typing import Dict, List
from pydantic import BaseModel
from datetime import datetime


class ConceptGap(BaseModel):
    concept: str
    gap_score: float  # 0.0 = no gap, 1.0 = severe gap
    risk_level: str  # "safe", "watch", "at_risk"
    indicators: List[str]  # reasons for the score


class LearningGapResult(BaseModel):
    student_id: str
    quiz_id: str
    overall_score: float
    overall_risk: str
    concept_gaps: List[ConceptGap]
    timestamp: datetime
    recommendations: List[str]


class StudentAnalytics(BaseModel):
    student_id: str
    avg_response_time: float
    confidence_accuracy_ratio: float
    consistency_score: float
    concept_transfer_score: float
