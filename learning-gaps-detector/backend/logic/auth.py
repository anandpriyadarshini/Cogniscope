import json
import os
from datetime import datetime
import hashlib
import uuid
from typing import Optional, Dict, Any

class AuthManager:
    """Manages user authentication and storage"""
    
    def __init__(self, data_dir: str = "data"):
        self.data_dir = data_dir
        self.users_file = os.path.join(data_dir, "users.json")
        self.sessions_file = os.path.join(data_dir, "sessions.json")
        
        # Ensure data directory exists
        os.makedirs(data_dir, exist_ok=True)
        
        # Initialize files if they don't exist
        if not os.path.exists(self.users_file):
            with open(self.users_file, 'w') as f:
                json.dump([], f)
        
        if not os.path.exists(self.sessions_file):
            with open(self.sessions_file, 'w') as f:
                json.dump({}, f)
    
    @staticmethod
    def hash_password(password: str) -> str:
        """Hash password using SHA256"""
        return hashlib.sha256(password.encode()).hexdigest()
    
    @staticmethod
    def verify_password(password: str, password_hash: str) -> bool:
        """Verify password against hash"""
        return AuthManager.hash_password(password) == password_hash
    
    @staticmethod
    def generate_token() -> str:
        """Generate a unique session token"""
        return str(uuid.uuid4())
    
    def load_users(self) -> list:
        """Load all users from file"""
        try:
            with open(self.users_file, 'r') as f:
                return json.load(f)
        except Exception as e:
            print(f"Error loading users: {e}")
            return []
    
    def save_users(self, users: list) -> bool:
        """Save users to file"""
        try:
            with open(self.users_file, 'w') as f:
                json.dump(users, f, indent=2, default=str)
            return True
        except Exception as e:
            print(f"Error saving users: {e}")
            return False
    
    def load_sessions(self) -> dict:
        """Load all sessions from file"""
        try:
            with open(self.sessions_file, 'r') as f:
                return json.load(f)
        except Exception as e:
            print(f"Error loading sessions: {e}")
            return {}
    
    def save_sessions(self, sessions: dict) -> bool:
        """Save sessions to file"""
        try:
            with open(self.sessions_file, 'w') as f:
                json.dump(sessions, f, indent=2, default=str)
            return True
        except Exception as e:
            print(f"Error saving sessions: {e}")
            return False
    
    def email_exists(self, email: str) -> bool:
        """Check if email already exists"""
        users = self.load_users()
        return any(user['email'].lower() == email.lower() for user in users)
    
    def register_user(self, name: str, email: str, password: str, role: str, subject: Optional[str] = None) -> Dict[str, Any]:
        """Register a new user"""
        
        # Validate input
        if not name or not email or not password or not role:
            return {"success": False, "message": "All fields are required"}
        
        if role not in ['student', 'teacher']:
            return {"success": False, "message": "Invalid role"}
        
        if self.email_exists(email):
            return {"success": False, "message": "Email already registered"}
        
        if len(password) < 6:
            return {"success": False, "message": "Password must be at least 6 characters"}
        
        # Create user
        users = self.load_users()
        user = {
            "id": str(uuid.uuid4()),
            "name": name,
            "email": email.lower(),
            "password_hash": self.hash_password(password),
            "role": role,
            "subject": subject,
            "created_at": datetime.now().isoformat(),
            "last_login": None
        }
        
        users.append(user)
        
        if self.save_users(users):
            # Generate session token
            token = self.generate_token()
            sessions = self.load_sessions()
            sessions[token] = {
                "user_id": user["id"],
                "email": user["email"],
                "role": user["role"],
                "created_at": datetime.now().isoformat()
            }
            self.save_sessions(sessions)
            
            return {
                "success": True,
                "message": "User registered successfully",
                "user": {
                    "id": user["id"],
                    "name": user["name"],
                    "email": user["email"],
                    "role": user["role"]
                },
                "token": token
            }
        
        return {"success": False, "message": "Error registering user"}
    
    def login_user(self, email: str, password: str, role: Optional[str] = None) -> Dict[str, Any]:
        """Login a user with optional role verification"""
        
        if not email or not password:
            return {"success": False, "message": "Email and password required"}
        
        users = self.load_users()
        user = None
        
        # Find user by email
        for u in users:
            if u['email'].lower() == email.lower():
                user = u
                break
        
        if not user:
            return {"success": False, "message": "Invalid email or password"}
        
        # Check if role is provided and matches
        if role and user['role'] != role:
            return {
                "success": False, 
                "message": f"This account is registered as a {user['role'].capitalize()}. Please login with the correct role.",
                "registered_role": user['role']
            }
        
        # Verify password
        if not self.verify_password(password, user['password_hash']):
            return {"success": False, "message": "Invalid email or password"}
        
        # Update last login
        user['last_login'] = datetime.now().isoformat()
        self.save_users(users)
        
        # Generate session token
        token = self.generate_token()
        sessions = self.load_sessions()
        sessions[token] = {
            "user_id": user["id"],
            "email": user["email"],
            "role": user["role"],
            "created_at": datetime.now().isoformat()
        }
        self.save_sessions(sessions)
        
        return {
            "success": True,
            "message": "Login successful",
            "user": {
                "id": user["id"],
                "name": user["name"],
                "email": user["email"],
                "role": user["role"]
            },
            "token": token
        }
    
    def verify_token(self, token: str) -> Optional[Dict[str, Any]]:
        """Verify if token is valid"""
        sessions = self.load_sessions()
        return sessions.get(token)
    
    def logout_user(self, token: str) -> bool:
        """Logout a user by removing their token"""
        sessions = self.load_sessions()
        if token in sessions:
            del sessions[token]
            return self.save_sessions(sessions)
        return False
    
    def get_user_by_id(self, user_id: str) -> Optional[Dict[str, Any]]:
        """Get user by ID"""
        users = self.load_users()
        for user in users:
            if user['id'] == user_id:
                return {
                    "id": user["id"],
                    "name": user["name"],
                    "email": user["email"],
                    "role": user["role"],
                    "subject": user.get("subject")
                }
        return None
