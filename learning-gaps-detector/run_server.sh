#!/bin/bash
cd /Users/priyadarshinianand/Documents/vsc/B2B/Cogniscope/learning-gaps-detector/backend
export PYTHONPATH=.
/Users/priyadarshinianand/Documents/vsc/B2B/.venv/bin/python -m uvicorn main:app --reload --port 8000
