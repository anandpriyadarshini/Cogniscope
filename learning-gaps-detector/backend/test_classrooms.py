"""
Test script for classroom endpoints
Run this after starting the server: python main.py
Then in another terminal: python test_classrooms.py
"""
import requests
import json

BASE_URL = "http://localhost:8000/api"

def test_create_classroom():
    """Test creating a classroom"""
    print("\n=== TEST 1: Create Classroom ===")
    payload = {
        "name": "Algebra 101",
        "description": "Introduction to Algebra",
        "subject": "Mathematics"
    }
    params = {
        "teacher_id": "teacher_001",
        "teacher_name": "Mr. Johnson"
    }
    
    response = requests.post(f"{BASE_URL}/classrooms", json=payload, params=params)
    print(f"Status: {response.status_code}")
    data = response.json()
    print(json.dumps(data, indent=2))
    return data.get('classroom_id'), data.get('join_code')


def test_get_classroom(classroom_id):
    """Test getting classroom details"""
    print("\n=== TEST 2: Get Classroom Details ===")
    response = requests.get(f"{BASE_URL}/classrooms/{classroom_id}")
    print(f"Status: {response.status_code}")
    print(json.dumps(response.json(), indent=2))


def test_student_join_classroom(classroom_id, join_code):
    """Test student joining classroom"""
    print("\n=== TEST 3: Student Join Classroom ===")
    payload = {
        "student_id": "student_001",
        "student_name": "Alice Smith",
        "join_code": join_code
    }
    
    response = requests.post(f"{BASE_URL}/classrooms/join", json=payload)
    print(f"Status: {response.status_code}")
    print(json.dumps(response.json(), indent=2))


def test_student_join_again(classroom_id, join_code):
    """Test student trying to join again (should fail)"""
    print("\n=== TEST 4: Student Join Again (Should Fail) ===")
    payload = {
        "student_id": "student_001",
        "student_name": "Alice Smith",
        "join_code": join_code
    }
    
    response = requests.post(f"{BASE_URL}/classrooms/join", json=payload)
    print(f"Status: {response.status_code}")
    print(json.dumps(response.json(), indent=2))


def test_add_more_students(classroom_id, join_code):
    """Test adding more students"""
    print("\n=== TEST 5: Add More Students ===")
    students = [
        ("student_002", "Bob Wilson"),
        ("student_003", "Carol Davis"),
        ("student_004", "David Brown")
    ]
    
    for student_id, student_name in students:
        payload = {
            "student_id": student_id,
            "student_name": student_name,
            "join_code": join_code
        }
        response = requests.post(f"{BASE_URL}/classrooms/join", json=payload)
        print(f"✓ {student_name} joined - Status: {response.status_code}")


def test_get_classroom_members(classroom_id):
    """Test getting classroom members"""
    print("\n=== TEST 6: Get Classroom Members ===")
    response = requests.get(f"{BASE_URL}/classrooms/{classroom_id}/members")
    print(f"Status: {response.status_code}")
    print(json.dumps(response.json(), indent=2))


def test_get_teacher_classrooms():
    """Test getting teacher's classrooms"""
    print("\n=== TEST 7: Get Teacher's Classrooms ===")
    response = requests.get(f"{BASE_URL}/teacher-classrooms/teacher_001")
    print(f"Status: {response.status_code}")
    print(json.dumps(response.json(), indent=2))


def test_get_student_classrooms():
    """Test getting student's classrooms"""
    print("\n=== TEST 8: Get Student's Classrooms ===")
    response = requests.get(f"{BASE_URL}/student-classrooms/student_001")
    print(f"Status: {response.status_code}")
    print(json.dumps(response.json(), indent=2))


def test_remove_student(classroom_id):
    """Test removing a student"""
    print("\n=== TEST 9: Remove Student from Classroom ===")
    response = requests.delete(f"{BASE_URL}/classrooms/{classroom_id}/members/student_002")
    print(f"Status: {response.status_code}")
    print(json.dumps(response.json(), indent=2))


def test_invalid_join_code():
    """Test joining with invalid code"""
    print("\n=== TEST 10: Invalid Join Code ===")
    payload = {
        "student_id": "student_999",
        "student_name": "Invalid User",
        "join_code": "INVALID"
    }
    
    response = requests.post(f"{BASE_URL}/classrooms/join", json=payload)
    print(f"Status: {response.status_code}")
    print(json.dumps(response.json(), indent=2))


if __name__ == "__main__":
    print("=" * 50)
    print("CLASSROOM SYSTEM TESTS")
    print("=" * 50)
    
    try:
        # Run tests in order
        classroom_id, join_code = test_create_classroom()
        test_get_classroom(classroom_id)
        test_student_join_classroom(classroom_id, join_code)
        test_student_join_again(classroom_id, join_code)
        test_add_more_students(classroom_id, join_code)
        test_get_classroom_members(classroom_id)
        test_get_teacher_classrooms()
        test_get_student_classrooms()
        test_remove_student(classroom_id)
        test_invalid_join_code()
        
        print("\n" + "=" * 50)
        print("ALL TESTS COMPLETED")
        print("=" * 50)
        
    except Exception as e:
        print(f"\n❌ Error: {e}")
        print("Make sure the server is running: python main.py")
