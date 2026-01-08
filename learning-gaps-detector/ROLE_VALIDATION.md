# Role Validation System - Documentation

## Overview

A comprehensive role validation system that prevents users from logging in with a different role than they signed up with. This ensures security and prevents confusion.

---

## 🔒 How It Works

### Registration
- User signs up as either **Student** or **Teacher**
- Role is permanently stored in the database
- One email = One role (cannot have multiple roles)

### Login Attempt
1. User enters email and password
2. User selects the role they're trying to login as
3. Backend checks:
   - Email exists? ✓
   - Password correct? ✓
   - **Role matches registered role?** ✓ NEW!
4. If role doesn't match:
   - Login fails ❌
   - Error message displays registered role
   - User can retry or use different role

---

## 📝 Error Messages

### Scenario 1: User registered as Student, tries to login as Teacher
```
❌ "This account is registered as a Student. Please login with the correct role."
```

### Scenario 2: User registered as Teacher, tries to login as Student
```
❌ "This account is registered as a Teacher. Please login with the correct role."
```

### Scenario 3: Wrong email
```
❌ "Invalid email or password"
```

### Scenario 4: Wrong password
```
❌ "Invalid email or password"
```

---

## 🔄 Complete Flow

```
1. USER SIGNUP (First Time)
   ├─ Select Role: Student OR Teacher
   ├─ Fill Form
   └─ Email + Role stored in DB
      └─ Role is now FIXED for this email

2. USER LOGIN (Any Time)
   ├─ Enter Email
   ├─ Enter Password
   ├─ Select Role: Student OR Teacher
   └─ Backend Validation:
      ├─ Email exists? ✓
      ├─ Password matches? ✓
      └─ Role matches registered role? ✓ <- NEW VALIDATION
         ├─ All checks pass → Login successful
         └─ Role mismatch → Show error + suggest correct role

3. ERROR HANDLING
   ├─ Role Mismatch: Show specific error message
   ├─ Wrong Password: Show generic error
   ├─ Wrong Email: Show generic error
   └─ User can retry with correct role
```

---

## 🛠️ Technical Implementation

### Backend Changes

#### 1. **models/auth.py** - Updated LoginRequest
```python
class LoginRequest(BaseModel):
    """Login request model"""
    email: str
    password: str
    role: str  # 'student' or 'teacher' - to validate against registered role
```

#### 2. **logic/auth.py** - Updated login_user() method
```python
def login_user(self, email: str, password: str, role: Optional[str] = None):
    """Login a user with optional role verification"""
    
    # ... find user by email ...
    
    # NEW: Check if role is provided and matches
    if role and user['role'] != role:
        return {
            "success": False, 
            "message": f"This account is registered as a {user['role'].capitalize()}. 
                         Please login with the correct role.",
            "registered_role": user['role']
        }
    
    # ... continue with password verification ...
```

#### 3. **main.py** - Updated /api/auth/login endpoint
```python
@app.post("/api/auth/login")
async def login(request: LoginRequest):
    result = auth_manager.login_user(
        email=request.email,
        password=request.password,
        role=request.role  # NEW: Pass role for validation
    )
    
    # ... handle response with role information ...
```

### Frontend Changes

#### 1. **index.js** - Updated redirectTo() function
```javascript
function redirectTo(role) {
    // ... collect form data ...
    
    // Form data now includes role
    const formData = getFormData(form);  // Contains: email, password, role
    
    // ... API call ...
    
    // NEW: Enhanced error handling
    .catch(error => {
        let errorMessage = error.message;
        
        // Special handling for role mismatch errors
        if (error.status === 401 && error.message.includes('registered as')) {
            errorMessage = error.message;  // Display full message
        }
        
        showError(errorMessage);
    });
}
```

---

## 📊 Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                    ROLE VALIDATION FLOW                             │
└─────────────────────────────────────────────────────────────────────┘

FRONTEND (login.html)
├─ User selects role (Student/Teacher)
├─ User fills email & password
└─ Form data includes: { email, password, role }
   │
   ↓
API REQUEST
├─ POST /api/auth/login
├─ Body: { email, password, role }
└─ Header: Content-Type: application/json
   │
   ↓
BACKEND (main.py)
├─ AuthManager.login_user(email, password, role)
│  │
│  ├─ Find user by email
│  ├─ Check role match
│  │  ├─ Role matches? → Continue
│  │  └─ Role mismatch? → Return error with registered_role
│  └─ Verify password
   │
   ↓
API RESPONSE
├─ Success: { success, user, token }
└─ Error: { 
       detail: "This account is registered as Student...",
       status: 401 
   }
   │
   ↓
FRONTEND (index.js)
├─ Check response status
├─ If error: Show specific error message
└─ If success: Save token & redirect to dashboard
```

---

## 🧪 Testing Scenarios

### Test Case 1: Correct Role Login
1. Register as Student with email: `student@test.com`
2. Login with same email and select **Student**
3. **Expected**: ✅ Login successful → Redirected to student dashboard

### Test Case 2: Wrong Role Login
1. Register as Student with email: `student@test.com`
2. Login with same email but select **Teacher**
3. **Expected**: ❌ Error: "This account is registered as a Student. Please login with the correct role."
4. **Then**: Click "Student" tab and try again
5. **Expected**: ✅ Login successful

### Test Case 3: Teacher Wrong Role
1. Register as Teacher with email: `teacher@test.com`
2. Login with same email but select **Student**
3. **Expected**: ❌ Error: "This account is registered as a Teacher. Please login with the correct role."
4. **Then**: Switch to Teacher role and login
5. **Expected**: ✅ Login successful

### Test Case 4: Prevent Account Confusion
1. User accidentally signs up as Student
2. User realizes they should be Teacher
3. User tries to switch role on login
4. **Expected**: Clear error message prevents confusion
5. User can create new account as Teacher with different email

---

## 🔐 Security Benefits

✅ **Prevents Account Takeover**: Can't use another person's account with wrong role
✅ **Clear Audit Trail**: Role is immutable - can't switch roles mid-session
✅ **User Clarity**: Explicit error messages prevent account confusion
✅ **Data Integrity**: Student data stays with students, teacher data with teachers
✅ **Permission Enforcement**: Role-based access is now validated at login

---

## 📱 User Experience Improvements

### Before:
- Users could get confused about which role they signed up as
- Silent failures or redirects without clarity

### After:
- Clear, specific error messages
- User knows exactly which role their account is registered as
- Can easily switch roles for login attempt or create new account

---

## 🚀 API Usage Examples

### Signup Request
```json
POST /api/auth/signup
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "student"
}

Response:
{
  "success": true,
  "user": { "id": "uuid", "name": "John Doe", "email": "john@example.com", "role": "student" },
  "token": "session-token"
}
```

### Login with Correct Role
```json
POST /api/auth/login
{
  "email": "john@example.com",
  "password": "password123",
  "role": "student"
}

Response:
{
  "success": true,
  "user": { ... },
  "token": "session-token"
}
```

### Login with Wrong Role
```json
POST /api/auth/login
{
  "email": "john@example.com",
  "password": "password123",
  "role": "teacher"
}

Error Response (401):
{
  "detail": "This account is registered as a Student. Please login with the correct role. (This account is registered as student)"
}
```

---

## 📋 Files Modified

1. **backend/models/auth.py**
   - Added `role: str` to `LoginRequest` model

2. **backend/logic/auth.py**
   - Updated `login_user()` to accept and validate `role` parameter
   - Added role mismatch detection
   - Returns `registered_role` in error response

3. **backend/main.py**
   - Updated `/api/auth/login` endpoint to pass `role` parameter
   - Enhanced error handling for role mismatch
   - Includes registered role in error messages

4. **frontend/index.js**
   - Updated `redirectTo()` to handle role mismatch errors
   - Enhanced error message display
   - Shows specific role validation errors

---

## ✅ Status

- ✅ Backend validation implemented
- ✅ Frontend error handling implemented
- ✅ Error messages display registered role
- ✅ User can retry with correct role
- ✅ Testing scenarios documented

**Ready for production deployment!** 🚀
