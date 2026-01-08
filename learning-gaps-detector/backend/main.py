from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from typing import List, Dict, Any
import json
import os
from datetime import datetime

from models.quiz import StudentSubmission, Question, QuizAttempt
from models.result import LearningGapResult
from logic.scoring import LearningGapScorer

app = FastAPI(title="AI-Resilient Learning Gaps Detector", version="1.0.0")

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files for frontend
import os
frontend_dir = os.path.join(os.path.dirname(__file__), "..", "frontend")
app.mount("/student", StaticFiles(directory=os.path.join(frontend_dir, "student"), html=True), name="student")
app.mount("/teacher", StaticFiles(directory=os.path.join(frontend_dir, "teacher"), html=True), name="teacher")
app.mount("/shared", StaticFiles(directory=os.path.join(frontend_dir, "shared")), name="shared")

# Initialize the scoring system
scorer = LearningGapScorer()

# Data storage paths
DATA_DIR = "data"
RESPONSES_FILE = os.path.join(DATA_DIR, "responses.json")
SCORES_FILE = os.path.join(DATA_DIR, "scores.json")
QUESTIONS_FILE = os.path.join(DATA_DIR, "questions.json")

# Ensure data directory exists
os.makedirs(DATA_DIR, exist_ok=True)

# Initialize data files if they don't exist
for file_path in [RESPONSES_FILE, SCORES_FILE, QUESTIONS_FILE]:
    if not os.path.exists(file_path):
        with open(file_path, 'w') as f:
            json.dump([], f)


# Sample questions for demo
SAMPLE_QUESTIONS = [
    {
        "id": 1,
        "text": "What is the slope of the line y = 3x + 2?",
        "options": ["2", "3", "5", "Cannot be determined"],
        "correct_answer": 1,
        "concept": "Linear Functions"
    },
    {
        "id": 2,
        "text": "If f(x) = x², what is f(4)?",
        "options": ["8", "16", "4", "2"],
        "correct_answer": 1,
        "concept": "Functions"
    },
    {
        "id": 3,
        "text": "What is the y-intercept of y = 2x - 7?",
        "options": ["2", "-7", "7", "0"],
        "correct_answer": 1,
        "concept": "Linear Functions"
    },
    {
        "id": 4,
        "text": "If g(x) = 2x + 1, what is g(3)?",
        "options": ["6", "7", "5", "9"],
        "correct_answer": 1,
        "concept": "Functions"
    },
    {
        "id": 5,
        "text": "Which of these represents a quadratic function?",
        "options": ["y = 3x + 1", "y = x² + 2x", "y = 1/x", "y = 2ˣ"],
        "correct_answer": 1,
        "concept": "Quadratic Functions"
    }
]


@app.get("/")
async def root():
    return {"message": "AI-Resilient Learning Gaps Detector API"}


@app.get("/api/questions")
async def get_questions():
    """Get quiz questions for students."""
    # Try to load from file first, fall back to SAMPLE_QUESTIONS
    try:
        if os.path.exists(QUESTIONS_FILE):
            with open(QUESTIONS_FILE, 'r') as f:
                questions = json.load(f)
                if questions and len(questions) > 0:
                    return {"questions": questions}
    except Exception as e:
        print(f"Error loading questions: {e}")
    
    return {"questions": SAMPLE_QUESTIONS}


@app.post("/api/save-questions")
async def save_questions(data: Dict[str, Any]):
    """Save quiz questions from teacher."""
    try:
        questions = data.get('questions', [])
        
        if not questions:
            raise HTTPException(status_code=400, detail="No questions provided")
        
        # Save to file
        with open(QUESTIONS_FILE, 'w') as f:
            json.dump(questions, f, indent=2)
        
        return {
            "message": "Questions saved successfully",
            "count": len(questions)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error saving questions: {str(e)}")


@app.post("/api/submit-quiz")
async def submit_quiz(submission: StudentSubmission):
    """Submit a completed quiz for analysis."""
    try:
        # Validate submission
        if not submission.attempts:
            raise HTTPException(status_code=400, detail="No attempts provided")
        
        # Load existing responses
        with open(RESPONSES_FILE, 'r') as f:
            responses = json.load(f)
        
        # Convert submission to dict for storage
        submission_dict = submission.dict()
        submission_dict['timestamp'] = submission.timestamp.isoformat()
        
        # Add to responses
        responses.append(submission_dict)
        
        # Save responses
        with open(RESPONSES_FILE, 'w') as f:
            json.dump(responses, f, indent=2)
        
        # Generate learning gap analysis
        result = scorer.score_submission(submission)
        
        # Load existing scores
        with open(SCORES_FILE, 'r') as f:
            scores = json.load(f)
        
        # Convert result to dict for storage
        result_dict = result.dict()
        result_dict['timestamp'] = result.timestamp.isoformat()
        
        # Add to scores
        scores.append(result_dict)
        
        # Save scores
        with open(SCORES_FILE, 'w') as f:
            json.dump(scores, f, indent=2)
        
        return {
            "message": "Quiz submitted successfully",
            "student_id": submission.student_id,
            "analysis": result_dict
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing submission: {str(e)}")


@app.get("/api/student-results/{student_id}")
async def get_student_results(student_id: str):
    """Get learning gap analysis for a specific student."""
    try:
        with open(SCORES_FILE, 'r') as f:
            scores = json.load(f)
        
        student_scores = [score for score in scores if score['student_id'] == student_id]
        
        if not student_scores:
            raise HTTPException(status_code=404, detail="No results found for student")
        
        return {"results": student_scores}
        
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="No results available")


@app.get("/api/teacher-dashboard")
async def get_teacher_dashboard():
    """Get dashboard data for teachers."""
    try:
        with open(SCORES_FILE, 'r') as f:
            scores = json.load(f)
        
        if not scores:
            return {
                "summary": {
                    "total_students": 0,
                    "at_risk_students": 0,
                    "safe_students": 0,
                    "watch_students": 0
                },
                "students": [],
                "concept_analysis": {}
            }
        
        # Calculate summary statistics
        total_students = len(set(score['student_id'] for score in scores))
        risk_counts = {"at_risk": 0, "watch": 0, "safe": 0}
        
        # Get latest score for each student
        latest_scores = {}
        for score in scores:
            student_id = score['student_id']
            if student_id not in latest_scores or score['timestamp'] > latest_scores[student_id]['timestamp']:
                latest_scores[student_id] = score
        
        # Count risk levels
        for score in latest_scores.values():
            risk_level = score.get('overall_risk', 'safe')
            if risk_level in risk_counts:
                risk_counts[risk_level] += 1
        
        # Analyze concepts
        concept_analysis = {}
        for score in latest_scores.values():
            for concept_gap in score.get('concept_gaps', []):
                concept_name = concept_gap['concept']
                if concept_name not in concept_analysis:
                    concept_analysis[concept_name] = {
                        'total_students': 0,
                        'avg_gap_score': 0,
                        'at_risk_count': 0
                    }
                
                concept_analysis[concept_name]['total_students'] += 1
                concept_analysis[concept_name]['avg_gap_score'] += concept_gap['gap_score']
                if concept_gap['risk_level'] == 'at_risk':
                    concept_analysis[concept_name]['at_risk_count'] += 1
        
        # Calculate averages
        for concept_data in concept_analysis.values():
            if concept_data['total_students'] > 0:
                concept_data['avg_gap_score'] /= concept_data['total_students']
        
        # Prepare student list with risk indicators
        students = []
        for student_id, score in latest_scores.items():
            students.append({
                'student_id': student_id,
                'overall_risk': score.get('overall_risk', 'safe'),
                'overall_score': score.get('overall_score', 0),
                'timestamp': score.get('timestamp'),
                'top_concerns': score.get('recommendations', [])[:2]
            })
        
        # Sort students by risk level (at_risk first)
        risk_priority = {'at_risk': 0, 'watch': 1, 'safe': 2}
        students.sort(key=lambda x: (risk_priority.get(x['overall_risk'], 2), -x['overall_score']))
        
        return {
            "summary": {
                "total_students": total_students,
                "at_risk_students": risk_counts['at_risk'],
                "watch_students": risk_counts['watch'],
                "safe_students": risk_counts['safe']
            },
            "students": students,
            "concept_analysis": concept_analysis
        }
        
    except FileNotFoundError:
        return {
            "summary": {
                "total_students": 0,
                "at_risk_students": 0,
                "watch_students": 0,
                "safe_students": 0
            },
            "students": [],
            "concept_analysis": {}
        }


@app.get("/api/student-detail/{student_id}")
async def get_student_detail(student_id: str):
    """Get detailed analysis for a specific student."""
    try:
        with open(SCORES_FILE, 'r') as f:
            scores = json.load(f)
        
        with open(RESPONSES_FILE, 'r') as f:
            responses = json.load(f)
        
        student_scores = [score for score in scores if score['student_id'] == student_id]
        student_responses = [resp for resp in responses if resp['student_id'] == student_id]
        
        if not student_scores:
            raise HTTPException(status_code=404, detail="Student not found")
        
        # Get latest analysis
        latest_score = max(student_scores, key=lambda x: x['timestamp'])
        
        return {
            "student_id": student_id,
            "latest_analysis": latest_score,
            "history": student_scores,
            "raw_responses": student_responses
        }
        
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="No data available")


@app.delete("/api/reset-data")
async def reset_data():
    """Reset all data (for demo purposes)."""
    try:
        for file_path in [RESPONSES_FILE, SCORES_FILE]:
            with open(file_path, 'w') as f:
                json.dump([], f)
        
        return {"message": "All data reset successfully"}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error resetting data: {str(e)}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
