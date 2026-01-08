# Docker Setup Guide

## Quick Start

### Prerequisites
- Docker installed ([Install Docker](https://docs.docker.com/get-docker/))
- Docker Compose installed (comes with Docker Desktop)

### Build and Run

```bash
# Navigate to project directory
cd learning-gaps-detector

# Build the Docker image
docker-compose build

# Start the application
docker-compose up
```

The application will be available at: **http://localhost:8000**

### Access the Application

- **Student Portal**: http://localhost:8000/student
- **Teacher Portal**: http://localhost:8000/teacher
- **Login Page**: http://localhost:8000/login.html

## Making Changes After Containerization

Yes! You can make changes even after containerization. The setup includes **volume mounts** for live development:

### Code Changes
All code changes are **immediately reflected** in the running container without rebuilding:

1. **Backend Changes**: Edit files in `backend/` → Changes appear instantly in container
2. **Frontend Changes**: Edit files in `frontend/` → Changes appear instantly in container

Example:
```bash
# While container is running, edit a file
# Edit backend/main.py or frontend/index.js
# Save the file → The application reloads automatically (--reload flag enabled)
```

### Data Persistence
- The `backend/data/` directory is mounted as a volume
- All JSON data files persist between container restarts
- Your responses, scores, classrooms, etc. are saved

### Useful Docker Commands

```bash
# Start in background mode
docker-compose up -d

# Stop the application
docker-compose down

# View logs
docker-compose logs -f

# Restart the application
docker-compose restart

# Access container shell (for debugging)
docker-compose exec app bash

# Run a one-off command in container
docker-compose exec app python -c "import sys; print(sys.version)"
```

### Rebuilding After Dependency Changes

If you modify `requirements.txt`:

```bash
# Rebuild the image with new dependencies
docker-compose build --no-cache

# Start with the new image
docker-compose up
```

### Development Workflow

1. **Start container**: `docker-compose up`
2. **Make code changes** in your editor (anywhere in backend/ or frontend/)
3. **Save files** → Application auto-reloads
4. **Check logs**: `docker-compose logs -f` for any errors
5. **Test changes**: Open browser and refresh (http://localhost:8000)

## Project Structure

```
learning-gaps-detector/
├── Dockerfile                 # Container image definition
├── docker-compose.yml         # Multi-container orchestration
├── .dockerignore              # Files to exclude from Docker build
├── backend/
│   ├── main.py               # FastAPI application
│   ├── requirements.txt       # Python dependencies
│   ├── data/                 # JSON data files (persisted)
│   ├── logic/                # Business logic
│   ├── models/               # Data models
│   └── utils/                # Utilities
└── frontend/
    ├── index.html
    ├── login.html
    └── student/, teacher/    # Portal UIs
```

## Environment Variables

To add custom environment variables, edit `docker-compose.yml`:

```yaml
environment:
  - PYTHONUNBUFFERED=1
  - YOUR_VARIABLE=value
```

## Troubleshooting

### Port 8000 Already in Use
```bash
# Change the port in docker-compose.yml
# Change "8000:8000" to "8001:8000"
docker-compose up
```

### Need to Rebuild Everything
```bash
docker-compose down -v  # Remove containers and volumes
docker-compose build --no-cache
docker-compose up
```

### Permission Issues (Linux/Mac)
```bash
sudo docker-compose up
```

## Next Steps

- [View Authentication Guide](AUTHENTICATION_GUIDE.md)
- [Check Role Validation](ROLE_VALIDATION.md)
- [Read Quickstart](QUICKSTART.md)
