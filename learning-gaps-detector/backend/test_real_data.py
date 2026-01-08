#!/usr/bin/env python3
"""
Test classroom system - Creates, joins, and displays classrooms
Saves data to backend/data/classrooms.json
"""
import requests
import json
from pathlib import Path

API = "http://localhost:8000/api"

print("=" * 60)
print("CLASSROOM SYSTEM - REAL DATA TEST")
print("=" * 60)

# Teacher creates classroom
print("\n[1] TEACHER CREATES CLASSROOM")
print("-" * 60)

payload = {
    "name": "Algebra 101",
    "description": "Introduction to Algebra",
    "subject": "Mathematics"
}

try:
    response = requests.post(
        f"{API}/classrooms",
        json=payload,
        params={
            "teacher_id": "teacher_001",
            "teacher_name": "Mr. Johnson"
        }
    )
    
    if response.status_code == 200:
        data = response.json()
        classroom_id = data['classroom_id']
        join_code = data['join_code']
        
        print(f"✅ SUCCESS!")
        print(f"   Classroom ID: {classroom_id}")
        print(f"   Join Code: {join_code}")
        print(f"   Name: {data['classroom']['name']}")
        print(f"   Saved to: backend/data/classrooms.json")
    else:
        print(f"❌ FAILED: {response.status_code}")
        print(f"   Error: {response.json()}")
        exit(1)

except requests.exceptions.ConnectionError:
    print("❌ CANNOT CONNECT TO SERVER")
    print("   Start server first: cd backend && python main.py")
    exit(1)

# Student joins classroom
print("\n[2] STUDENT JOINS CLASSROOM")
print("-" * 60)

join_payload = {
    "student_id": "student_001",
    "student_name": "Alice Smith",
    "join_code": join_code
}

response = requests.post(f"{API}/classrooms/join", json=join_payload)

if response.status_code == 200:
    data = response.json()
    print(f"✅ SUCCESS!")
    print(f"   Student: {join_payload['student_name']}")
    print(f"   Joined: {data['classroom_name']}")
    print(f"   Message: {data['message']}")
else:
    print(f"❌ FAILED: {response.status_code}")
    print(f"   Error: {response.json()}")

# Add more students
print("\n[3] MORE STUDENTS JOIN")
print("-" * 60)

students = [
    ("student_002", "Bob Wilson"),
    ("student_003", "Carol Davis")
]

for sid, sname in students:
    response = requests.post(
        f"{API}/classrooms/join",
        json={
            "student_id": sid,
            "student_name": sname,
            "join_code": join_code
        }
    )
    if response.status_code == 200:
        print(f"   ✅ {sname} joined")
    else:
        print(f"   ❌ {sname} failed")

# Show classroom members
print("\n[4] VIEW CLASSROOM MEMBERS")
print("-" * 60)

response = requests.get(f"{API}/classrooms/{classroom_id}/members")
data = response.json()

print(f"Classroom: {data['classroom_name']}")
print(f"Teacher: {data['teacher_name']}")
print(f"Members ({data['member_count']}):")
for member in data['members']:
    print(f"   • {member['student_name']} (joined: {member['joined_at'][:10]})")

# Show teacher's classrooms
print("\n[5] TEACHER VIEW - MY CLASSROOMS")
print("-" * 60)

response = requests.get(f"{API}/teacher-classrooms/teacher_001")
data = response.json()

for c in data['classrooms']:
    print(f"\n📚 {c['name']}")
    print(f"   Join Code: {c['join_code']}")
    print(f"   Members: {c['member_count']}")
    print(f"   Created: {c['created_at'][:10]}")

# Show student's classrooms
print("\n[6] STUDENT VIEW - MY CLASSROOMS")
print("-" * 60)

response = requests.get(f"{API}/student-classrooms/student_001")
data = response.json()

for c in data['classrooms']:
    print(f"\n📚 {c['name']}")
    print(f"   Teacher: {c['teacher_name']}")
    print(f"   Subject: {c['subject']}")
    print(f"   Classmates: {c['member_count']}")

# Show actual stored data
print("\n[7] DATA FILE CONTENTS")
print("-" * 60)

data_file = Path("data/classrooms.json")
if data_file.exists():
    with open(data_file) as f:
        data = json.load(f)
    print(f"File: {data_file.absolute()}")
    print(f"Size: {len(data)} classroom(s)")
    print(f"\nJSON Preview:")
    print(json.dumps(data, indent=2)[:500] + "...")
else:
    print("❌ Data file not found")

print("\n" + "=" * 60)
print("✅ ALL TESTS COMPLETED")
print("=" * 60)
