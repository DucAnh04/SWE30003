from typing import Optional
from fastapi import APIRouter, HTTPException, Depends, File, UploadFile, Form
import shutil
import os
import bcrypt
import jwt
import datetime
from db.connection import get_connection

SECRET_KEY = "eyJhbGciOiJIUzI1NiJ9.eyJSb2xlIjoiQWRtaW4iLCJJc3N1ZXIiOiJJc3N1ZXIiLCJVc2VybmFtZSI6IkphdmFJblVzZSIsImV4cCI6MTc0Mjk4MjgxNiwiaWF0IjoxNzQyOTgyODE2fQ.Fzvu-o4TeN2FbOHnBXc5FJCO7wjrGb2kixHcQ6em-kU"
ALGORITHM = "HS256"

router = APIRouter()
UPLOAD_DIR = "data/image"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/")
def create_user(
    name: str = Form(...),
    email: str = Form(...),
    password: str = Form(...),
    user_type: str = Form(...),
    profile_picture: Optional[UploadFile] = File(None),
    conn = Depends(get_connection)
):
    cursor = conn.cursor()
    
    # Hash the password with bcrypt
    hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    
    # Save the profile picture if uploaded
    profile_picture_path = None
    if profile_picture:
        profile_picture_path = f"{profile_picture.filename}"
        with open(profile_picture_path, "wb") as buffer:
            shutil.copyfileobj(profile_picture.file, buffer)
    
    try:
        cursor.execute(
            """
            INSERT INTO users (name, email, password_hash, user_type, profile_picture)
            VALUES (%s, %s, %s, %s, %s)
            """,
            (name, email, hashed_password, user_type, profile_picture_path)
        )
        conn.commit()
        return {"message": "User created successfully"}
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        cursor.close()

@router.post("/authenticate")
def authenticate_user(
    email: str = Form(...),
    password: str = Form(...),
    conn = Depends(get_connection)
):
    print(email, password)
    cursor = conn.cursor()
    
    try:
        cursor.execute("SELECT id, password_hash, name FROM users WHERE email = %s", (email,))
        user = cursor.fetchone()
        
        if user is None or not bcrypt.checkpw(password.encode('utf-8'), user[1].encode('utf-8')):
            raise HTTPException(status_code=401, detail="Invalid email or password")
        
        print(user)
        # Generate JWT token
        payload = {
            "user_id": user[0],
            "name": user[2],
            "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=24)
        }
        token = jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)
        
        return {"message": "Authentication successful", "token": token}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        cursor.close()

@router.get("/me")
def get_user_data(
    token: str,
    conn = Depends(get_connection)
):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("user_id")
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token")
        
        cursor = conn.cursor()
        cursor.execute("SELECT id, name, email, user_type, profile_picture FROM users WHERE id = %s", (user_id,))
        user = cursor.fetchone()
        cursor.close()
        
        if user is None:
            raise HTTPException(status_code=404, detail="User not found")
        
        return {
            "id": user[0],
            "name": user[1],
            "email": user[2],
            "user_type": user[3],
            "profile_picture": user[4]
        }
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired")
    except jwt.DecodeError:
        raise HTTPException(status_code=401, detail="Invalid token")

@router.post("/change-password")
def change_password(
    token: str = Form(...),
    current_password: str = Form(...),
    new_password: str = Form(...),
    conn = Depends(get_connection)
):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("user_id")
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token")
        
        cursor = conn.cursor()
        cursor.execute("SELECT password_hash FROM users WHERE id = %s", (user_id,))
        user = cursor.fetchone()
        
        if user is None or not bcrypt.checkpw(current_password.encode('utf-8'), user[0].encode('utf-8')):
            raise HTTPException(status_code=401, detail="Current password is incorrect")
        
        new_hashed_password = bcrypt.hashpw(new_password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        cursor.execute("UPDATE users SET password_hash = %s WHERE id = %s", (new_hashed_password, user_id))
        conn.commit()
        
        return {"message": "Password changed successfully"}
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired")
    except jwt.DecodeError:
        raise HTTPException(status_code=401, detail="Invalid token")
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        cursor.close()
