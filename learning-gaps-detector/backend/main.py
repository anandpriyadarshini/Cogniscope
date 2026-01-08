from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from typing import List, Dict, Any
import json
import os
from datetime import datetime

from models.quiz import StudentSubmission, Question, QuizAttempt
from models.result import LearningGapResult
<<<<<<< Updated upstream
from models.classroom import Classroom, ClassroomCreate, JoinClassroomRequest, ClassroomResponse, ClassroomMember
=======
from models.auth import LoginRequest, SignupRequest, AuthResponse
>>>>>>> Stashed changes
from logic.scoring import LearningGapScorer
from logic.auth import AuthManager

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

# Data storage paths
DATA_DIR = "data"
RESPONSES_FILE = os.path.join(DATA_DIR, "responses.json")
SCORES_FILE = os.path.join(DATA_DIR, "scores.json")
QUESTIONS_FILE = os.path.join(DATA_DIR, "questions.json")
CLASSROOMS_FILE = os.path.join(DATA_DIR, "classrooms.json")

# Ensure data directory exists
os.makedirs(DATA_DIR, exist_ok=True)

# Initialize the scoring system
scorer = LearningGapScorer()

# Initialize auth manager
auth_manager = AuthManager(DATA_DIR)

# Initialize data files if they don't exist
for file_path in [RESPONSES_FILE, SCORES_FILE, QUESTIONS_FILE, CLASSROOMS_FILE]:
    if not os.path.exists(file_path):
        with open(file_path, 'w') as f:
            json.dump([] if file_path != CLASSROOMS_FILE else {}, f)


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


# ==================== AUTHENTICATION ENDPOINTS ====================

@app.post("/api/auth/signup")
async def signup(request: SignupRequest):
    """Register a new user (Student or Teacher)."""
    try:
        result = auth_manager.register_user(
            name=request.name,
            email=request.email,
            password=request.password,
            role=request.role,
            subject=request.subject
        )
        
        if result["success"]:
            return AuthResponse(
                success=True,
                message=result["message"],
                user=result["user"],
                token=result["token"]
            )
        else:
            raise HTTPException(status_code=400, detail=result["message"])
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Signup error: {str(e)}")


@app.post("/api/auth/login")
async def login(request: LoginRequest):
    """Login a user (Student or Teacher) with role validation."""
    try:
        result = auth_manager.login_user(
            email=request.email,
            password=request.password,
            role=request.role
        )
        
        if result["success"]:
            return AuthResponse(
                success=True,
                message=result["message"],
                user=result["user"],
                token=result["token"]
            )
        else:
            # Include registered_role in error response if role mismatch
            registered_role = result.get("registered_role")
            error_detail = result["message"]
            
            if registered_role:
                error_detail += f" (This account is registered as {registered_role})"
            
            raise HTTPException(status_code=401, detail=error_detail)
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Login error: {str(e)}")


@app.get("/api/auth/verify/{token}")
async def verify_token(token: str):
    """Verify if a token is valid."""
    try:
        session = auth_manager.verify_token(token)
        
        if session:
            user = auth_manager.get_user_by_id(session["user_id"])
            return {
                "valid": True,
                "user": user,
                "role": session["role"]
            }
        else:
            raise HTTPException(status_code=401, detail="Invalid or expired token")
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Verification error: {str(e)}")


@app.post("/api/auth/logout/{token}")
async def logout(token: str):
    """Logout a user by invalidating their token."""
    try:
        if auth_manager.logout_user(token):
            return {"success": True, "message": "Logged out successfully"}
        else:
            raise HTTPException(status_code=400, detail="Logout failed")
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Logout error: {str(e)}")


# ==================== QUIZ ENDPOINTS ====================

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


# ============ CLASSROOM MANAGEMENT ENDPOINTS ============

@app.post("/api/classrooms")
async def create_classroom(classroom: ClassroomCreate, teacher_id: str = Query(...), teacher_name: str = Query(...)):
    """Create a new classroom (teacher only)."""
    try:
        # Load existing classrooms
        with open(CLASSROOMS_FILE, 'r') as f:
            classrooms = json.load(f)
        
        # Generate unique classroom ID and join code
        classroom_id = str(datetime.now().timestamp()).replace('.', '')
        join_code = Classroom.generate_join_code()
        
        # Ensure join code is unique
        while any(c['join_code'] == join_code for c in classrooms.values()):
            join_code = Classroom.generate_join_code()
        
        # Create new classroom object
        new_classroom = {
            "classroom_id": classroom_id,
            "teacher_id": teacher_id,
            "teacher_name": teacher_name,
            "name": classroom.name,
            "description": classroom.description,
            "subject": classroom.subject,
            "join_code": join_code,
            "created_at": datetime.now().isoformat(),
            "members": [],
            "quiz_ids": []
        }
        
        # Save classroom
        classrooms[classroom_id] = new_classroom
        with open(CLASSROOMS_FILE, 'w') as f:
            json.dump(classrooms, f, indent=2)
        
        return {
            "message": "Classroom created successfully",
            "classroom_id": classroom_id,
            "join_code": join_code,
            "classroom": new_classroom
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating classroom: {str(e)}")


@app.get("/api/classrooms/{classroom_id}")
async def get_classroom(classroom_id: str):
    """Get classroom details."""
    try:
        with open(CLASSROOMS_FILE, 'r') as f:
            classrooms = json.load(f)
        
        if classroom_id not in classrooms:
            raise HTTPException(status_code=404, detail="Classroom not found")
        
        classroom = classrooms[classroom_id]
        
        return {
            "classroom_id": classroom["classroom_id"],
            "teacher_id": classroom["teacher_id"],
            "teacher_name": classroom["teacher_name"],
            "name": classroom["name"],
            "description": classroom["description"],
            "subject": classroom["subject"],
            "join_code": classroom["join_code"],
            "created_at": classroom["created_at"],
            "members": classroom["members"],
            "quiz_ids": classroom["quiz_ids"],
            "member_count": len(classroom["members"])
        }
        
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="No classrooms found")


@app.get("/api/teacher-classrooms/{teacher_id}")
async def get_teacher_classrooms(teacher_id: str):
    """Get all classrooms for a teacher."""
    try:
        with open(CLASSROOMS_FILE, 'r') as f:
            classrooms = json.load(f)
        
        teacher_classrooms = [c for c in classrooms.values() if c["teacher_id"] == teacher_id]
        
        return {
            "classrooms": [
                {
                    "classroom_id": c["classroom_id"],
                    "name": c["name"],
                    "description": c["description"],
                    "subject": c["subject"],
                    "join_code": c["join_code"],
                    "created_at": c["created_at"],
                    "member_count": len(c["members"]),
                    "quiz_count": len(c["quiz_ids"])
                }
                for c in teacher_classrooms
            ]
        }
        
    except FileNotFoundError:
        return {"classrooms": []}


@app.get("/api/student-classrooms/{student_id}")
async def get_student_classrooms(student_id: str):
    """Get all classrooms that a student is enrolled in."""
    try:
        with open(CLASSROOMS_FILE, 'r') as f:
            classrooms = json.load(f)
        
        student_classrooms = []
        for classroom in classrooms.values():
            for member in classroom["members"]:
                if member["student_id"] == student_id:
                    student_classrooms.append({
                        "classroom_id": classroom["classroom_id"],
                        "teacher_id": classroom["teacher_id"],
                        "teacher_name": classroom["teacher_name"],
                        "name": classroom["name"],
                        "description": classroom["description"],
                        "subject": classroom["subject"],
                        "created_at": classroom["created_at"],
                        "member_count": len(classroom["members"]),
                        "quiz_count": len(classroom["quiz_ids"]),
                        "joined_at": member["joined_at"]
                    })
                    break
        
        return {"classrooms": student_classrooms}
        
    except FileNotFoundError:
        return {"classrooms": []}


@app.post("/api/classrooms/join")
async def join_classroom(request: JoinClassroomRequest):
    """Join a classroom using a join code."""
    try:
        with open(CLASSROOMS_FILE, 'r') as f:
            classrooms = json.load(f)
        
        # Find classroom by join code
        target_classroom = None
        for classroom in classrooms.values():
            if classroom["join_code"] == request.join_code:
                target_classroom = classroom
                break
        
        if not target_classroom:
            raise HTTPException(status_code=404, detail="Invalid join code")
        
        # Check if student is already a member
        for member in target_classroom["members"]:
            if member["student_id"] == request.student_id:
                raise HTTPException(status_code=400, detail="Student already enrolled in this classroom")
        
        # Add student to classroom
        new_member = {
            "student_id": request.student_id,
            "student_name": request.student_name,
            "joined_at": datetime.now().isoformat()
        }
        target_classroom["members"].append(new_member)
        
        # Save updated classroom
        with open(CLASSROOMS_FILE, 'w') as f:
            json.dump(classrooms, f, indent=2)
        
        return {
            "message": "Successfully joined classroom",
            "classroom_id": target_classroom["classroom_id"],
            "classroom_name": target_classroom["name"],
            "teacher_name": target_classroom["teacher_name"]
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error joining classroom: {str(e)}")


@app.get("/api/classrooms/{classroom_id}/members")
async def get_classroom_members(classroom_id: str):
    """Get all members of a classroom."""
    try:
        with open(CLASSROOMS_FILE, 'r') as f:
            classrooms = json.load(f)
        
        if classroom_id not in classrooms:
            raise HTTPException(status_code=404, detail="Classroom not found")
        
        classroom = classrooms[classroom_id]
        
        return {
            "classroom_id": classroom_id,
            "classroom_name": classroom["name"],
            "teacher_name": classroom["teacher_name"],
            "members": classroom["members"],
            "member_count": len(classroom["members"])
        }
        
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="Classroom not found")


@app.delete("/api/classrooms/{classroom_id}/members/{student_id}")
async def remove_student_from_classroom(classroom_id: str, student_id: str):
    """Remove a student from a classroom."""
    try:
        with open(CLASSROOMS_FILE, 'r') as f:
            classrooms = json.load(f)
        
        if classroom_id not in classrooms:
            raise HTTPException(status_code=404, detail="Classroom not found")
        
        classroom = classrooms[classroom_id]
        
        # Find and remove student
        original_count = len(classroom["members"])
        classroom["members"] = [m for m in classroom["members"] if m["student_id"] != student_id]
        
        if len(classroom["members"]) == original_count:
            raise HTTPException(status_code=404, detail="Student not found in classroom")
        
        # Save updated classroom
        with open(CLASSROOMS_FILE, 'w') as f:
            json.dump(classrooms, f, indent=2)
        
        return {"message": "Student removed from classroom"}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error removing student: {str(e)}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
