# Authentication Flow - Complete Documentation

## 🔐 Authentication System Overview

Complete end-to-end authentication system implemented for Cogniscope with proper role-based redirects.

---

## 📊 Authentication Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                     COGNISCOPE AUTH FLOW                         │
└─────────────────────────────────────────────────────────────────┘

1. LANDING PAGE (index.html)
   ├── Hero Section
   ├── About Section
   └── CTA: "Get Started" → login.html

2. LOGIN/SIGNUP PAGE (login.html)
   ├── Role Selection
   │   ├── Student
   │   └── Teacher
   ├── Tab Selection
   │   ├── Login
   │   └── Sign Up
   └── Form Submission
       ├── API: POST /api/auth/signup
       ├── API: POST /api/auth/login
       └── Response: { token, user }

3. STORE AUTH DATA (localStorage)
   ├── auth_token (session token)
   ├── user_role (student/teacher)
   ├── user_name (user's full name)
   └── user_email (user's email)

4. REDIRECT TO DASHBOARD
   ├── Student → frontend/student/index.html
   └── Teacher → frontend/teacher/index.html

5. AUTHENTICATION CHECK
   ├── Page loads
   ├── Check localStorage for auth_token
   ├── Verify role matches page type
   └── If not authenticated → redirect to login.html

6. DISPLAY USER INFO & LOGOUT
   ├── Show "Welcome, [User Name]! 👋"
   ├── Logout button clears localStorage
   └── Redirect to login.html
```

---

## 🔑 LocalStorage Keys

After successful authentication, the following keys are stored:

```javascript
{
  "auth_token": "uuid-session-token",     // Session token from backend
  "user_role": "student" | "teacher",     // User role
  "user_name": "John Doe",                // User's full name
  "user_email": "john@example.com"        // User's email address
}
```

---

## 📱 Page Structure & Auth Checks

### 1. Landing Page (frontend/index.html)
- **Authentication Required**: ❌ No
- **Description**: Public landing page with hero, about, and CTA sections
- **Links**: 
  - Login button → `login.html`
  - Get Started CTA → `login.html`

### 2. Login Page (frontend/login.html)
- **Authentication Required**: ❌ No (Public)
- **Description**: Combined login/signup interface
- **Features**:
  - Role selection (Student/Teacher)
  - Tab switching (Login/Sign Up)
  - Form validation
  - Error/success messages
  - API integration

### 3. Student Dashboard (frontend/student/index.html)
- **Authentication Required**: ✅ Yes
- **Required Role**: `student`
- **Check Implemented**: `checkAuthentication()` in quiz.js
- **On Auth Failure**: Redirects to `login.html`
- **Features**:
  - Auth header with user name and logout button
  - Welcome greeting with user name
  - Quiz interface
  - Confidence scoring
  - Results analysis

### 4. Teacher Dashboard (frontend/teacher/index.html)
- **Authentication Required**: ✅ Yes
- **Required Role**: `teacher`
- **Check Implemented**: `initializeTeacherPage()` on page load
- **On Auth Failure**: Redirects to `login.html`
- **Features**:
  - Auth header with user name and logout button
  - Welcome greeting with user name
  - Navigation to quiz setup
  - Navigation to analytics dashboard

---

## 🔄 Complete Authentication Flow

### Step 1: User Navigates to Login
```
User clicks "Get Started" or "Login" → login.html
```

### Step 2: User Selects Role
```javascript
// In frontend/login.html
<button class="role-btn active" data-role="student">
    <span class="role-icon">👨‍🎓</span>
    <span>Student</span>
</button>
```

### Step 3: User Fills Form
**Student Signup:**
- Name
- Email
- Password
- Confirm Password

**Teacher Signup:**
- Name
- Email
- Subject/Department
- Password
- Confirm Password

### Step 4: Form Submission
```javascript
// In frontend/index.js - redirectTo() function
fetch('http://localhost:8000/api/auth/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(formData)
})
```

### Step 5: Backend Authentication
```python
# In backend/main.py - /api/auth/signup endpoint
POST /api/auth/signup
├── Validate input
├── Hash password
├── Check email uniqueness
├── Create user
├── Generate session token
└── Return { token, user }
```

### Step 6: Store Auth Data
```javascript
// In frontend/index.js - after successful response
localStorage.setItem('auth_token', data.token);
localStorage.setItem('user_role', data.user.role);
localStorage.setItem('user_name', data.user.name);
localStorage.setItem('user_email', data.user.email);
```

### Step 7: Redirect to Dashboard
```javascript
// In frontend/index.js - redirectTo() function
setTimeout(() => {
    if (role === 'student') {
        window.location.href = './student/index.html';
    } else if (role === 'teacher') {
        window.location.href = './teacher/index.html';
    }
}, 1000);
```

### Step 8: Auth Check on Dashboard
**Student Page:**
```javascript
// In frontend/student/quiz.js - checkAuthentication() method
const authToken = localStorage.getItem('auth_token');
const userRole = localStorage.getItem('user_role');

if (!authToken || userRole !== 'student') {
    window.location.href = '../login.html';
}
```

**Teacher Page:**
```javascript
// In frontend/teacher/index.html - initializeTeacherPage() function
const authToken = localStorage.getItem('auth_token');
const userRole = localStorage.getItem('user_role');

if (!authToken || userRole !== 'teacher') {
    window.location.href = '../login.html';
}
```

### Step 9: Display User Info
```javascript
const greeting = document.getElementById('user-greeting');
const userName = localStorage.getItem('user_name');

if (userName) {
    greeting.textContent = `Welcome, ${userName}! 👋`;
}
```

### Step 10: Logout
```javascript
// In both student and teacher pages - logout() function
function logout() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_role');
        localStorage.removeItem('user_name');
        localStorage.removeItem('user_email');
        
        window.location.href = '../login.html';
    }
}
```

---

## 🧪 Testing the Auth Flow

### Test Case 1: Student Signup & Login
1. Open `frontend/login.html`
2. Select "Student" role
3. Click "Sign Up" tab
4. Fill in all fields:
   - Name: John Doe
   - Email: student@example.com
   - Password: password123
   - Confirm: password123
5. Click "Create Account & Login"
6. Should redirect to `frontend/student/index.html`
7. Should see "Welcome, John Doe! 👋"

### Test Case 2: Student Login
1. Open `frontend/login.html`
2. Select "Student" role
3. Keep "Login" tab active
4. Enter email and password
5. Click "Login as Student"
6. Should redirect to `frontend/student/index.html`

### Test Case 3: Teacher Signup & Login
1. Open `frontend/login.html`
2. Select "Teacher" role
3. Click "Sign Up" tab
4. Fill in all fields:
   - Name: Jane Smith
   - Email: teacher@example.com
   - Subject: Mathematics
   - Password: password123
   - Confirm: password123
5. Click "Create Account & Login"
6. Should redirect to `frontend/teacher/index.html`
7. Should see "Welcome, Jane Smith! 👋"

### Test Case 4: Logout
1. From either student or teacher page
2. Click "Logout" button
3. Confirm logout
4. Should redirect to `frontend/login.html`
5. localStorage should be cleared

### Test Case 5: Direct Page Access (No Auth)
1. Open DevTools
2. Clear localStorage
3. Navigate to `frontend/student/index.html`
4. Should automatically redirect to `login.html`
5. Same for teacher page

### Test Case 6: Wrong Role Access
1. Login as student
2. Manually navigate to `frontend/teacher/index.html`
3. Should redirect to `login.html` (role mismatch)

---

## 📝 API Reference

### POST /api/auth/signup
```json
Request:
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "student",
  "subject": null
}

Response:
{
  "success": true,
  "message": "User registered successfully",
  "user": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "student"
  },
  "token": "uuid-token"
}
```

### POST /api/auth/login
```json
Request:
{
  "email": "john@example.com",
  "password": "password123"
}

Response:
{
  "success": true,
  "message": "Login successful",
  "user": {...},
  "token": "uuid-token"
}
```

### GET /api/auth/verify/{token}
```json
Request:
GET /api/auth/verify/uuid-token

Response:
{
  "valid": true,
  "user": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "student"
  },
  "role": "student"
}
```

### POST /api/auth/logout/{token}
```json
Request:
POST /api/auth/logout/uuid-token

Response:
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

## 🔒 Security Notes

### Implemented:
✅ Password hashing (SHA256)
✅ Email validation
✅ Session tokens (UUID)
✅ Role-based access control
✅ CORS enabled

### For Production (TODO):
⚠️ Use bcrypt or argon2 for password hashing
⚠️ Implement JWT with expiration
⚠️ Use HTTPS/SSL
⚠️ Add rate limiting
⚠️ Implement email verification
⚠️ Add password strength requirements
⚠️ Use secure cookies with httpOnly flag
⚠️ Implement CSRF protection

---

## 📂 Files Modified

1. **frontend/index.js** (updated)
   - Real API integration
   - Saves user_email to localStorage
   - Proper error handling

2. **frontend/student/index.html** (updated)
   - Added auth header
   - User greeting section
   - Logout button

3. **frontend/student/quiz.js** (updated)
   - `checkAuthentication()` method
   - Auth validation on page load
   - Auto-redirect if not authenticated
   - `logout()` function

4. **frontend/teacher/index.html** (updated)
   - Added auth header
   - User greeting section
   - Logout button
   - `initializeTeacherPage()` function
   - `logout()` function

---

## 🎯 Summary

✅ Complete authentication system implemented
✅ Role-based redirects (Student ↔ Teacher)
✅ Auth checks on protected pages
✅ User info display with greetings
✅ Logout functionality
✅ localStorage-based session management
✅ Error handling and user feedback

**Status**: Ready for production testing! 🚀
