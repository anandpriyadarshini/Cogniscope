# Cogniscope Authentication System - Implementation Guide

## Overview
Complete authentication system implemented for both frontend and backend, supporting Student and Teacher roles with secure login/signup functionality.

---

## Backend Implementation

### 1. Authentication Model (`backend/models/auth.py`)
- **User Model**: Stores user credentials, role, and metadata
- **LoginRequest**: Email and password for login
- **SignupRequest**: Name, email, password, role, and optional subject (for teachers)
- **AuthResponse**: Returns success status, user info, and authentication token

### 2. Authentication Manager (`backend/logic/auth.py`)
**Features:**
- ✅ User registration with validation
- ✅ Password hashing using SHA256
- ✅ Email uniqueness verification
- ✅ Session token generation (UUID-based)
- ✅ Password verification
- ✅ User login with last_login tracking
- ✅ Token-based session management
- ✅ User lookup by ID
- ✅ Data persistence (JSON file-based)

**Key Methods:**
```python
- register_user(name, email, password, role, subject)
- login_user(email, password)
- verify_token(token)
- logout_user(token)
- get_user_by_id(user_id)
- hash_password(password)
- verify_password(password, password_hash)
```

**Data Storage:**
- `data/users.json` - Stores all registered users
- `data/sessions.json` - Stores active session tokens

### 3. API Endpoints (`backend/main.py`)

#### POST `/api/auth/signup`
Register a new user
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
  "token": "session-token-uuid"
}
```

#### POST `/api/auth/login`
Login an existing user
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
  "token": "session-token-uuid"
}
```

#### GET `/api/auth/verify/{token}`
Verify if a token is valid
```json
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

#### POST `/api/auth/logout/{token}`
Logout a user by invalidating their session
```json
Response:
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

## Frontend Implementation

### 1. Updated JavaScript (`frontend/index.js`)

**New Features:**
- ✅ Real API integration with backend
- ✅ Form data collection and validation
- ✅ Error/success message display
- ✅ Token storage in localStorage
- ✅ User info persistence
- ✅ Proper error handling

**Key Functions:**
```javascript
- redirectTo(role) - Handles login/signup with API calls
- getFormData(form) - Collects form input data
- validateForm(form) - Validates required fields
- showError(message) - Displays error messages
- showSuccess(message) - Displays success messages
```

### 2. Authentication Flow

**Signup Flow:**
1. User fills in signup form (Name, Email, Password, Confirm Password)
2. Form validation checks:
   - All fields filled
   - Passwords match
   - Email format valid
3. API call to `/api/auth/signup`
4. On success:
   - Token saved to localStorage
   - User info saved to localStorage
   - Redirect to dashboard (student or teacher)
5. On error:
   - Display error message
   - Allow retry

**Login Flow:**
1. User fills in login form (Email, Password)
2. Form validation checks:
   - All fields filled
   - Email format valid
3. API call to `/api/auth/login`
4. On success:
   - Token saved to localStorage
   - User info saved to localStorage
   - Redirect to dashboard
5. On error:
   - Display error message
   - Allow retry

### 3. LocalStorage Keys
```javascript
localStorage.getItem('auth_token')      // Session token
localStorage.getItem('user_role')       // 'student' or 'teacher'
localStorage.getItem('user_name')       // User's full name
```

### 4. Updated CSS (`frontend/style.css`)
- Added error and success message styling
- Added slide-down animation for messages
- Professional color scheme matching brand

---

## File Changes Summary

### Created Files:
1. `backend/models/auth.py` - Authentication models
2. `backend/logic/auth.py` - Authentication manager logic

### Modified Files:
1. `backend/main.py` - Added auth endpoints
2. `frontend/index.js` - Implemented real authentication
3. `frontend/style.css` - Added message styling
4. `backend/requirements.txt` - Added email validation dependency

---

## Security Considerations

### Current Implementation:
- ✅ Passwords hashed using SHA256
- ✅ Email validation using Pydantic EmailStr
- ✅ Unique email enforcement
- ✅ Token-based sessions (UUID)
- ✅ CORS enabled for frontend communication

### Recommendations for Production:
⚠️ **IMPORTANT:** This is a development implementation. For production:
1. Use bcrypt or argon2 instead of SHA256 for password hashing
2. Implement JWT tokens with expiration
3. Add database (PostgreSQL/MongoDB) instead of JSON files
4. Implement HTTPS/SSL
5. Add rate limiting on auth endpoints
6. Implement password strength requirements
7. Add email verification
8. Add refresh token mechanism
9. Implement proper logging and monitoring

---

## Testing the Authentication

### Local Setup:
```bash
# Install dependencies
pip install -r backend/requirements.txt

# Run backend server
cd backend
python main.py
# Server runs on http://localhost:8000

# Open frontend
Open frontend/login.html in browser
```

### Test Cases:

**Test 1: Student Registration**
- Go to login page
- Select "Student"
- Click "Sign Up"
- Fill form with test data
- Click "Create Account & Login"
- Should redirect to student quiz page

**Test 2: Student Login**
- After registration, go to login page
- Select "Student"
- Click "Login"
- Enter registered email and password
- Should redirect to student quiz page

**Test 3: Teacher Registration**
- Go to login page
- Select "Teacher"
- Click "Sign Up"
- Fill form including subject
- Click "Create Account & Login"
- Should redirect to teacher dashboard

**Test 4: Teacher Login**
- After registration, go to login page
- Select "Teacher"
- Click "Login"
- Enter registered email and password
- Should redirect to teacher dashboard

**Test 5: Error Cases**
- Try signing up with existing email → Should show error
- Try logging in with wrong password → Should show error
- Submit empty form → Should show validation error

---

## Next Steps

1. **Protect Routes**: Add authentication checks in student/teacher pages
2. **Profile Pages**: Create user profile management pages
3. **Password Reset**: Implement forgot password functionality
4. **Email Verification**: Add email verification on signup
5. **Dashboard Integration**: Connect auth with existing dashboards
6. **Database Migration**: Move from JSON to proper database
7. **Enhanced Security**: Implement JWT and refresh tokens

---

## API Base URL Configuration

If backend is running on different host/port, update in `frontend/index.js`:
```javascript
const API_BASE_URL = 'http://your-backend-url:port/api';
```

Current: `http://localhost:8000/api`

---

## File Locations

```
learning-gaps-detector/
├── backend/
│   ├── main.py (updated)
│   ├── requirements.txt (updated)
│   ├── logic/
│   │   └── auth.py (NEW)
│   └── models/
│       └── auth.py (NEW)
└── frontend/
    ├── login.html
    ├── index.html
    ├── index.js (updated)
    └── style.css (updated)
```

---

**Status**: ✅ Authentication system fully implemented and ready for testing!
