# Cogniscope - Quick Start Guide

## ✅ Backend Status
The backend server is now **RUNNING** on `http://localhost:8000`

---

## 🚀 Starting the Application

### Option 1: Separate Terminals (Recommended)

**Terminal 1 - Backend:**
```bash
cd D:\Cogniscope\learning-gaps-detector\backend
python main.py
```
Server starts on: `http://localhost:8000`

**Terminal 2 - Frontend:**
Open in browser:
```
file:///D:\Cogniscope\learning-gaps-detector\frontend\index.html
```

### Option 2: Batch File (Windows)
Create `run.bat` in the root directory:
```batch
@echo off
start cmd /k "cd backend && python main.py"
start "" "D:\Cogniscope\learning-gaps-detector\frontend\index.html"
pause
```

---

## 📱 Accessing the Application

1. **Landing Page**: 
   - `file:///D:\Cogniscope\learning-gaps-detector\frontend\index.html`
   
2. **Login Page**:
   - `file:///D:\Cogniscope\learning-gaps-detector\frontend\login.html`

3. **API Documentation**:
   - `http://localhost:8000/docs` (Interactive Swagger UI)
   - `http://localhost:8000/redoc` (ReDoc documentation)

---

## 🔑 Test Accounts

After creating accounts, use these to test:

**Student Account:**
- Email: student@example.com
- Password: password123
- Role: Student

**Teacher Account:**
- Email: teacher@example.com
- Password: password123
- Role: Teacher
- Subject: Mathematics

---

## 📝 API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/verify/{token}` - Verify token
- `POST /api/auth/logout/{token}` - Logout user

### Quiz Management
- `GET /api/questions` - Get quiz questions
- `POST /api/submit-quiz` - Submit quiz responses
- `GET /api/student-results/{student_id}` - Get student analysis

### Teacher Dashboard
- `GET /api/teacher-dashboard` - Get dashboard summary
- `GET /api/student-detail/{student_id}` - Get detailed student info
- `POST /api/save-questions` - Save quiz questions

---

## 🗂️ Data Storage

All data is stored in `backend/data/`:
- `users.json` - Registered users
- `sessions.json` - Active sessions
- `responses.json` - Quiz responses
- `scores.json` - Learning analysis results
- `questions.json` - Quiz questions

---

## 🔧 Frontend Configuration

If backend is on different host/port, update in `frontend/index.js`:

```javascript
const API_BASE_URL = 'http://localhost:8000/api';
```

---

## ✨ Features Implemented

### Frontend
✅ Modern landing page
✅ Responsive login/signup page
✅ Student & Teacher role selection
✅ Form validation
✅ Error/success messages
✅ Token-based authentication
✅ LocalStorage persistence

### Backend
✅ User registration & login
✅ Password hashing
✅ Session token management
✅ Email validation
✅ CORS enabled
✅ JSON-based data persistence
✅ Quiz submission & analysis
✅ Teacher dashboard

---

## 🐛 Troubleshooting

### Backend won't start
```bash
# Install missing dependencies
pip install -r requirements.txt

# Clear Python cache
find . -type d -name __pycache__ -exec rm -r {} +
```

### Frontend can't connect to backend
- Ensure backend is running: `http://localhost:8000`
- Check API_BASE_URL in `frontend/index.js`
- Allow CORS in browser (should work by default)

### Data not persisting
- Check `backend/data/` directory exists and has proper permissions
- Verify files like `users.json` are created

---

## 📊 Next Steps

1. ✅ Test authentication (signup/login)
2. ✅ Create test student and teacher accounts
3. ⬜ Connect student quiz page to API
4. ⬜ Connect teacher dashboard to API
5. ⬜ Implement password reset
6. ⬜ Add email verification
7. ⬜ Migrate to database (PostgreSQL)

---

**Status**: Backend running ✅ | Frontend ready ✅ | Authentication implemented ✅
