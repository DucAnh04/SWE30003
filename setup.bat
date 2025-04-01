@echo off
echo Setup script started.

cd be
call python -m venv .venv
call .venv\Scripts\activate.bat
call pip install -r requirements.txt
start cmd /k "fastapi dev main.py"

cd ..
cd fe
call npm install
start cmd /k "npm start"