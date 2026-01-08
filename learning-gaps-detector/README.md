# 🧠 AI-Resilient Learning Gaps Detector

## 🎯 The Problem We Solve

**Traditional quizzes are broken in the AI era.**

- ✅ Students get high scores using AI tools
- ❌ Teachers can't identify real learning gaps
- ⏰ Learning issues discovered too late
- 🎭 High performance ≠ real understanding

## 💡 Our Solution

**We don't block AI. We detect learning authenticity.**

Instead of measuring *what* students answer, we analyze *how* they answer to identify hidden learning gaps before they become failures.

## 🚀 Key Features

### For Students
- **🎯 Natural Quiz Experience** - No surveillance, just normal quizzes
- **⏱️ Self-Paced Learning** - Take time to think and learn
- **📈 Confidence Tracking** - Build self-assessment skills
- **🎓 Instant Feedback** - Understand your learning patterns

### For Teachers  
- **🚨 Early Warning System** - Identify at-risk students before exams
- **🎯 Targeted Intervention** - Know exactly which concepts need attention
- **📊 Learning Authenticity Detection** - Spot potential AI usage patterns
- **🧩 Concept-Level Insights** - Understand class-wide learning gaps

### Core Intelligence
- **⚡ Response Pattern Analysis** - Timing, confidence, consistency patterns
- **🧠 Authenticity Detection** - AI usage probability scoring
- **📈 Learning Gap Prediction** - Proactive risk assessment
- **🎯 Concept Transfer Analysis** - Deep vs. surface learning detection

## 🏗️ System Architecture

```
Student Quiz Interface  →  FastAPI Backend  →  Teacher Dashboard
       ↓                         ↓                    ↓
  Behavioral Data       Intelligence Engine      Actionable Insights
   - Response time       - Feature extraction     - At-risk students
   - Confidence level    - Rule-based analysis    - Learning gaps
   - Answer patterns     - AI detection          - Interventions
```

## 🛠️ Quick Start

### Prerequisites
- **Docker** and **Docker Compose** installed ([Install Docker](https://docs.docker.com/get-docker/))
- Modern web browser (Chrome, Firefox, Safari, Edge)

### ⚡ Quick Start with Docker (Recommended)

This is the easiest way to run the entire system:

```bash
# Navigate to project directory
cd learning-gaps-detector

# Build the Docker image
docker-compose build

# Start the application
docker-compose up
```

---

## 📱 How to Use the System

Follow these steps to experience the complete workflow:

### **Step 1️⃣: Start the Application**

```bash
docker-compose up
```

Open your browser and go to: **http://localhost:8000/login.html**

### **Step 2️⃣: Create Two Browser Sessions**

You'll need to work with both student and teacher roles:

- **Browser/Tab 1**: Student portal 
- **Browser/Tab 2**: Teacher portal 

---

### **Step 3️⃣: Teacher - Create a Classroom**

**In Browser Tab 2 (Teacher):**

1. Go to **http://localhost:8000/login.html**
   - **What to expect**: You'll see the login/signup page with two role buttons at the top
   
2. Click **"Educator/Teacher"** button
   - **What to expect**: The page switches to teacher signup mode, form labels change to teacher-specific fields
   
3. Sign up with credentials:
   - **Name**: `John Smith` (or your name)
   - **Email**: `teacher@school.com` (or any email)
   - **Password**: `secure123`
   - **Subject**: `Mathematics` 
   
4. Click **"Sign Up"** button
   - **What to expect**: Brief loading message, then redirects to teacher dashboard
   
5. You'll be redirected to **Teacher Portal**
   - **What to expect**: 
     - Welcome message: "Welcome, John Smith!"
     - Empty classroom list (since you haven't created any yet)
     - Button labeled "Create New Classroom"
   
6. Click **"Create New Classroom"** button
   - **What to expect**: Modal/form appears with input fields
   
7. Fill in classroom details:
   - **Classroom Name**: `Algebra 101`
   - **Grade Level**: `10` (or any grade)
   - **Subject**: `Mathematics`
   
   ```
   Example Form:
   ┌─────────────────────────────────┐
   │ Create New Classroom            │
   ├─────────────────────────────────┤
   │ Classroom Name: [Algebra 101___]│
   │ Grade Level:    [10____________]│
   │ Subject:        [Mathematics___]│
   │                                 │
   │       [Cancel]  [Create]        │
   └─────────────────────────────────┘
   ```
   
8. Click **"Create Classroom"**
   - **What to expect**: Success message, classroom appears in list
   
9. Go to **"View Classroom"**
   - **What to expect**: 
     - Classroom details displayed (name, subject, students)
     - Empty quiz list
     - "Create Quiz" button
     - **Unique Classroom Code** displayed (example: `CLASS-ABC123`)
   
10. 📋 **Copy the "Unique Classroom Code"** 
    - **What to expect**: Button says "Copy Code" or "📋 Code: CLASS-ABC123"
    - You'll use this in Step 4 with the student account
    - **IMPORTANT**: Save this code in a notepad - you'll paste it in the student browser!

---

### **Step 4️⃣: Student - Join the Classroom**

**In Browser Tab 1 (Student - use incognito/private window):**

1. Go to **http://localhost:8000/login.html**
   - **What to expect**: Same login page, "Student" role should be pre-selected
   
2. Click **"Student"** button (default)
   - **What to expect**: Form shows student signup fields
   
3. Sign up with credentials:
   - **Name**: `Alice Johnson` (or any name)
   - **Email**: `student@school.com` (different from teacher email)
   - **Password**: `secure123`
   
   ```
   Example Form:
   ┌─────────────────────────────────┐
   │ Student Sign Up                 │
   ├─────────────────────────────────┤
   │ Full Name: [Alice Johnson_______│
   │ Email:     [student@school.com_]│
   │ Password:  [••••••••••••••••••__]│
   │                                 │
   │   [Create Account]              │
   └─────────────────────────────────┘
   ```
   
4. Click **"Sign Up"** button
   - **What to expect**: Brief loading, redirects to student portal
   
5. You'll be redirected to **Student Portal - Classrooms**
   - **What to expect**:
     - Welcome message: "Welcome, Alice Johnson!"
     - Empty classroom list
     - Button: "Join Classroom" or text field to enter code
   
6. Click **"Join Classroom"** button or text field
   - **What to expect**: Input field/modal appears for classroom code
   
7. 📌 **Paste the classroom code** from Step 3
   - **Input Example**: `CLASS-ABC123` (from teacher's classroom view)
   - **What to expect**: Text field accepts the code
   
   ```
   Example Modal:
   ┌─────────────────────────────────┐
   │ Join Classroom                  │
   ├─────────────────────────────────┤
   │ Classroom Code:                 │
   │ [CLASS-ABC123_________________] │
   │                                 │
   │      [Cancel]  [Join]           │
   └─────────────────────────────────┘
   ```
   
8. Click **"Join"** button
   - **What to expect**: 
     - Success message appears
     - Classroom "Algebra 101" now appears in your classroom list
     - You see class details: teacher name (John Smith), subject, etc.

---

### **Step 5️⃣: Teacher - Create a Quiz**

**Back to Browser Tab 2 (Teacher):**

1. Go back to **"View Classroom"** for "Algebra 101"
   - **What to expect**: Classroom details page with empty quiz list
   
2. Click **"Create Quiz"** button
   - **What to expect**: Modal/form appears with quiz creation fields
   
3. Fill in quiz details:
   - **Quiz Title**: `Chapter 3 Assessment`
   - **Description**: `Test your knowledge of linear equations`
   - **Due Date**: (select any future date)
   
   ```
   Example Quiz Form:
   ┌────────────────────────────────────┐
   │ Create New Quiz                    │
   ├────────────────────────────────────┤
   │ Quiz Title:                        │
   │ [Chapter 3 Assessment____________] │
   │                                    │
   │ Description:                       │
   │ [Test your knowledge of linear____│
   │  equations____________________] │
   │                                    │
   │ Due Date: [Jan 15, 2026_______]   │
   │                                    │
   │     [Cancel]  [Create Quiz]       │
   └────────────────────────────────────┘
   ```
   
4. Click **"Create Quiz"**
   - **What to expect**: 
     - Success notification
     - Quiz appears in classroom quiz list
     - Shows status: "Active" or "Pending"

---

### **Step 6️⃣: Student - Take the Quiz**

**Back to Browser Tab 1 (Student):**

1. In the **Student Portal - Classrooms**
   - **What to expect**: Classroom "Algebra 101" is visible
   
2. Click on the **"Algebra 101"** classroom
   - **What to expect**: Classroom details and quiz list loads
   
3. Click **"View Quizzes"** button
   - **What to expect**: 
     - Quizzes list appears
     - Shows "Chapter 3 Assessment" with status "Available"
     - Button: "Take Quiz"
   
4. Click **"Take Quiz"** button
   - **What to expect**: Quiz interface loads with first question
   
5. **For each question**, follow this pattern:
   - 📖 Read the question carefully
   - ⭕ Select your answer (radio button)
   - 📊 Set your **confidence level** (slider 1-5)
   - ✓ Click **"Next"** to move to the next question
   
   ```
   Example Question Screen:
   ┌──────────────────────────────────────┐
   │ Question 1 of 5                      │
   ├──────────────────────────────────────┤
   │ What is the slope of y = 3x + 2?    │
   │                                      │
   │ ○ 2                                  │
   │ ◉ 3                                  │
   │ ○ 5                                  │
   │ ○ Cannot be determined               │
   │                                      │
   │ Your Confidence Level:               │
   │ [Guessing........Very Confident]    │
   │ Position:  ●  (4 out of 5)          │
   │                                      │
   │   [Previous]  [Next Question]       │
   └──────────────────────────────────────┘
   ```
   
   **Confidence Level Guide:**
   - **1 (Left)**: Just guessing, no idea
   - **2**: Not sure, probably wrong
   - **3**: Somewhat confident
   - **4**: Pretty confident
   - **5 (Right)**: Very confident, sure I'm right
   
6. After all questions, click **"Submit Quiz"**
   - **What to expect**: Quiz submits and analysis begins
   
7. 📊 **View Results page shows:**
   
   ```
   Results Dashboard:
   ┌──────────────────────────────────────┐
   │ Quiz: Chapter 3 Assessment           │
   ├──────────────────────────────────────┤
   │ Your Score: 4/5 (80%)                │
   │ Time Taken: 4 minutes 32 seconds     │
   │                                      │
   │ Learning Gap Assessment:             │
   │ 🟢 SAFE - No learning gaps detected  │
   │                                      │
   │ Performance by Question:             │
   │ Q1: ✓ Correct (Confidence: 4/5)    │
   │ Q2: ✓ Correct (Confidence: 5/5)    │
   │ Q3: ✗ Wrong   (Confidence: 3/5)    │
   │ Q4: ✓ Correct (Confidence: 4/5)    │
   │ Q5: ✓ Correct (Confidence: 5/5)    │
   │                                      │
   │ Insights:                            │
   │ • Good calibration between          │
   │   confidence and accuracy            │
   │ • Average response time: 50 sec      │
   │ • Strongest concept: Functions      │
   │ • Needs practice: Linear Equations  │
   │                                      │
   │   [Back to Classroom]  [Print]      │
   └──────────────────────────────────────┘
   ```

---

### **Step 7️⃣: Teacher - View Student Analytics**

**Back to Browser Tab 2 (Teacher):**

1. Go to **"View Classroom"** for "Algebra 101"
   - **What to expect**: Classroom details page
   
2. Click **"View Results"** or **"Student Progress"** tab
   - **What to expect**: Results dashboard loads
   
3. **Analytics Dashboard shows:**

   ```
   Teacher Results View:
   ┌─────────────────────────────────────┐
   │ Algebra 101 - Quiz Results          │
   ├─────────────────────────────────────┤
   │ Quiz: Chapter 3 Assessment          │
   │ Submissions: 1                      │
   │                                     │
   │ STUDENT PERFORMANCE TABLE:          │
   │┌────────────┬──────┬───────┬──────┐│
   ││ Student    │Score │ Risk  │ Time ││
   │├────────────┼──────┼───────┼──────┤│
   ││ Alice J.   │ 80%  │ 🟢OK  │ 4m   ││
   │└────────────┴──────┴───────┴──────┘│
   │                                     │
   │ CONCEPT ANALYSIS:                   │
   │ Linear Functions:    ✓ (100%)       │
   │ Quadratic Func:      ✓ (100%)       │
   │ Functions:           ✓ (100%)       │
   │                                     │
   │ LEARNING GAPS DETECTED:             │
   │ None - Student is performing well   │
   │                                     │
   │ AI DETECTION ANALYSIS:              │
   │ Risk Score: 10% (Very Low)          │
   │ Assessment: Authentic responses     │
   │                                     │
   │   [View Student Details]            │
   │   [Export Results] [Email Student]  │
   └─────────────────────────────────────┘
   ```

4. **Key Metrics Explained:**

   | Metric | Meaning | Example |
   |--------|---------|---------|
   | **Score** | Percentage of correct answers | 80% = 4 out of 5 correct |
   | **Risk Level** 🟢🟡🔴 | Learning risk assessment | 🟢 Safe, 🟡 Watch, 🔴 At Risk |
   | **Time** | Total quiz duration | 4m = 4 minutes |
   | **AI Detection** | Likelihood of AI assistance | 10% Low → 90% High |
   | **Confidence Calibration** | Does confidence match accuracy? | Good = knows what they know |
   | **Learning Gaps** | Concepts needing practice | "Linear Equations (45% concept gap)" |

---

## 🎓 Complete Workflow Summary

| Step | Role | Action | Location |
|------|------|--------|----------|
| 1 | Both | Start Docker & open browser | `docker-compose up` → http://localhost:8000/login.html |
| 2 | Both | Sign up (different tabs/windows) | Login page |
| 3 | Teacher | Create classroom & copy code | Teacher Portal |
| 4 | Student | Paste code and join classroom | Student Portal |
| 5 | Teacher | Create a quiz | Classroom view |
| 6 | Student | Take quiz with confidence levels | Quiz interface |
| 7 | Teacher | View analytics and learning gaps | Results dashboard |

---


### **Add Python Dependencies**
If you add new packages to `requirements.txt`:
```bash
docker-compose down
docker-compose build --no-cache
docker-compose up
```

### **View Logs**
```bash
docker-compose logs -f
```

### **Stop the Application**
```bash
docker-compose down
```

---

## 📝 Alternative: Run Without Docker

If you prefer traditional setup:

```bash
# Backend
cd backend
pip install -r requirements.txt
python main.py

# Frontend (in another terminal)
cd frontend
python -m http.server 8080
```

Then open: **http://localhost:8000/login.html**

## 📊 What Makes Our Detection Smart

### 🔍 Behavioral Signal Analysis

| Signal | What It Detects | Example Pattern |
|--------|-----------------|-----------------|
| **Response Time** | Unnatural speed patterns | Consistently <5s on complex problems |
| **Confidence-Accuracy** | Shallow understanding | High confidence on wrong answers |
| **Consistency** | Unstable knowledge | Erratic performance across concepts |
| **Transfer Patterns** | Memorization vs. understanding | Good on similar, poor on variations |

### 🎯 AI Usage Indicators

- **Speed + Accuracy + Confidence** combo (classic AI pattern)
- **Unnatural timing consistency** across questions
- **Perfect performance without learning curve**
- **High confidence on incorrect conceptual transfers**

### ⚠️ Learning Gap Detection

```
Gap Score = (Behavioral Inconsistencies × 0.7) + (AI Probability × 0.3)

🟢 Safe (0-30%):     Continue current approach
🟡 Watch (30-60%):   Monitor closely, provide support
🔴 At Risk (60%+):   Immediate intervention needed
```

## 🗂️ Project Structure

```
learning-gaps-detector/
├── � Dockerfile                       # Docker container configuration
├── 📄 docker-compose.yml               # Docker Compose multi-container setup
├── 📄 .dockerignore                    # Files excluded from Docker build
│
├── 📁 backend/                         # FastAPI Intelligence Engine
│   ├── main.py                        # FastAPI application & API endpoints
│   ├── requirements.txt               # Python dependencies
│   ├── __init__.py                    # Package initialization
│   ├── test_classrooms.py             # Unit tests for classrooms
│   ├── test_real_data.py              # Unit tests with real data
│   │
│   ├── 📁 models/                     # Data schemas & models
│   │   ├── auth.py                    # Authentication models
│   │   ├── quiz.py                    # Quiz submission models
│   │   ├── classroom.py               # Classroom management models
│   │   └── result.py                  # Analysis result models
│   │
│   ├── 📁 logic/                      # 🧠 Core Intelligence Engine
│   │   ├── auth.py                    # Authentication logic
│   │   ├── authenticity.py            # AI usage detection
│   │   ├── features.py                # Behavioral feature extraction
│   │   ├── rules.py                   # Rule-based gap detection
│   │   └── scoring.py                 # Final scoring & gap calculation
│   │
│   ├── 📁 data/                       # JSON storage (persisted in Docker)
│   │   ├── responses.json             # Student quiz submissions
│   │   ├── scores.json                # Gap analysis results
│   │   ├── questions.json             # Quiz questions database
│   │   ├── classrooms.json            # Classroom registry
│   │   ├── sessions.json              # User sessions
│   │   └── users.json                 # User accounts
│   │
│   └── 📁 utils/                      # Utility functions
│       └── time_utils.py              # Time analysis utilities
│
├── 📁 frontend/                        # User Interfaces
│   ├── 📄 index.html                  # Main entry point
│   ├── 📄 index.js                    # Authentication logic
│   ├── 📄 login.html                  # Login/Signup page
│   ├── 📄 style.css                   # Global styles
│   │
│   ├── 📁 student/                    # Student Portal
│   │   ├── index.html                 # Student home
│   │   ├── classrooms.html            # View & join classrooms
│   │   ├── classroom-quizzes.html     # Quizzes in classroom
│   │   ├── quiz.html                  # Quiz interface
│   │   ├── quiz.js                    # Timing & confidence logic
│   │   ├── quiz-report.html           # Quiz results & report
│   │   └── style.css                  # Student UI styling
│   │
│   ├── 📁 teacher/                    # Teacher Dashboard
│   │   ├── index.html                 # Teacher home
│   │   ├── classrooms.html            # Manage classrooms
│   │   ├── dashboard.html             # Analytics dashboard
│   │   ├── dashboard.js               # Data visualization
│   │   ├── quiz-setup.html            # Create quizzes
│   │   ├── quiz-setup.js              # Quiz creation logic
│   │   └── style.css                  # Dashboard styling
│   │
│   └── 📁 shared/                     # Shared resources
│       └── config.js                  # Frontend configuration
│
├── 📄 README.md                        # This file
├── 📄 DOCKER_SETUP.md                 # Docker setup guide
├── 📄 QUICKSTART.md                   # Quick start guide
├── 📄 AUTHENTICATION_GUIDE.md          # Authentication documentation
├── 📄 AUTH_FLOW.md                    # Auth flow diagram
├── 📄 ROLE_VALIDATION.md              # Role validation details
│
└── 📄 run_server.sh                   # Bash script to run server (legacy)
```

## 📦 Key Directories Explained

| Directory | Purpose | Important Files |
|-----------|---------|-----------------|
| `backend/` | FastAPI server & intelligence engine | `main.py`, `requirements.txt` |
| `backend/models/` | Data structures & schemas | `auth.py`, `quiz.py`, `classroom.py` |
| `backend/logic/` | Learning gap detection algorithms | `authenticity.py`, `scoring.py` |
| `backend/data/` | JSON data storage (persisted) | `responses.json`, `classrooms.json` |
| `frontend/` | Web user interfaces | `index.html`, `login.html` |
| `frontend/student/` | Student quiz portal | `quiz.html`, `quiz.js` |
| `frontend/teacher/` | Teacher analytics dashboard | `dashboard.html`, `quiz-setup.html` |
| `frontend/shared/` | Shared frontend resources | `config.js` |

## 🐳 Docker Files

| File | Purpose |
|------|---------|
| `Dockerfile` | Defines Docker image (Python 3.11, FastAPI, dependencies) |
| `docker-compose.yml` | Orchestrates container with volume mounts for live development |
| `.dockerignore` | Excludes unnecessary files from Docker build |

## 🧪 Testing the System

### Simulate Different Learning Patterns
````

### Simulate Different Learning Patterns

1. **✅ Authentic Learner**:
   - Take 15-30 seconds per question
   - Lower confidence on difficult questions  
   - Some wrong answers with low confidence

2. **🤖 AI-Assisted Pattern**:
   - Very fast responses (5-8 seconds)
   - High confidence across all answers
   - High accuracy with consistent timing

3. **😰 Struggling Learner**:
   - Long response times (45+ seconds)
   - Low confidence even on correct answers
   - Inconsistent performance across concepts

4. **🎭 Overconfident Pattern**:
   - Fast responses with high confidence
   - Wrong answers with confidence 4-5
   - Shows learning gaps through overconfidence

## 📈 Sample Output

### Teacher Dashboard View
```
🎯 STUDENT RISK ANALYSIS
┌──────────────┬──────────────┬───────────┬──────────────────┐
│ Student ID   │ Risk Level   │ Gap Score │ Key Indicators   │
├──────────────┼──────────────┼───────────┼──────────────────┤
│ student_123  │ 🚨 AT RISK   │ 78%       │ AI assistance    │
│ student_456  │ ⚠️ WATCH     │ 45%       │ Overconfident    │
│ student_789  │ ✅ SAFE      │ 12%       │ Good calibration │
└──────────────┴──────────────┴───────────┴──────────────────┘

📊 CONCEPT HEATMAP
Linear Functions:     🔴 High Risk (65% avg gap)
Quadratic Functions:  🟡 Medium Risk (35% avg gap)  
Basic Functions:      🟢 Low Risk (15% avg gap)
```

## 🔧 API Documentation

### Key Endpoints

#### `GET /api/questions`
Returns quiz questions for students
```json
{
  "questions": [
    {
      "id": 1,
      "text": "What is the slope of y = 3x + 2?",
      "options": ["2", "3", "5", "Cannot be determined"],
      "correct_answer": 1,
      "concept": "Linear Functions"
    }
  ]
}
```

#### `POST /api/submit-quiz`
Submit completed quiz for analysis
```json
{
  "student_id": "student_123",
  "quiz_id": "quiz_12345",
  "attempts": [
    {
      "question_id": 1,
      "selected_answer": 1,
      "time_taken": 12.5,
      "confidence": 4,
      "is_correct": true
    }
  ]
}
```

#### `GET /api/teacher-dashboard`
Get complete dashboard data for teachers
```json
{
  "summary": {
    "total_students": 15,
    "at_risk_students": 3,
    "watch_students": 5,
    "safe_students": 7
  },
  "students": [...],
  "concept_analysis": {...}
}
```

## 🎓 Educational Impact

### For Students
- **🎯 Better Self-Awareness**: Learn to calibrate confidence with knowledge
- **📚 Authentic Learning**: Focus on understanding vs. just getting answers
- **🔄 Growth Mindset**: See gaps as opportunities, not failures

### For Teachers  
- **⏰ Early Intervention**: Catch problems before they become crises
- **🎯 Targeted Teaching**: Focus time on concepts that need attention
- **📊 Evidence-Based Decisions**: Data-driven teaching strategies

### For Education System
- **🔮 Predictive Analytics**: Proactive rather than reactive support
- **🤖 AI-Adapted Assessment**: Work with technology, not against it
- **📈 Learning Authenticity**: Maintain educational integrity in digital age

## 🚀 Deployment Options

### Development
```bash
# Backend
cd backend && python main.py

# Frontend (simple)
cd frontend && python -m http.server 8080
```

### Production
- **Backend**: Docker, Heroku, AWS Lambda, Google Cloud Run
- **Frontend**: Netlify, Vercel, GitHub Pages, S3 Static Hosting
- **Database**: PostgreSQL, MongoDB (replace JSON files)


## 🤝 Contributing

This project was built for Build2Break. For questions or collaboration:



