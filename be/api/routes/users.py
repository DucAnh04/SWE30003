from typing import Optional
from fastapi import APIRouter, HTTPException, Depends, File, UploadFile, Form
import shutil
import os
import bcrypt
import jwt
import datetime
from db.connection import get_connection
import uuid

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
    
    # New driver-specific parameters
    vehicle_number: Optional[str] = Form(None),
    vehicle_type: Optional[str] = Form(None),
    license_number: Optional[str] = Form(None),
    
    conn = Depends(get_connection)
):
    cursor = conn.cursor()
    
    # Hash the password with bcrypt
    hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    
    # Function to save uploaded file with unique filename
    def save_uploaded_file(file: Optional[UploadFile], prefix: str = '') -> Optional[str]:
        if not file:
            return None
        
        # Generate unique filename
        file_extension = os.path.splitext(file.filename)[1]
        unique_filename = f"{prefix}_{uuid.uuid4()}{file_extension}"
        file_path = os.path.join('uploads', unique_filename)
        
        # Ensure uploads directory exists
        os.makedirs('uploads', exist_ok=True)
        
        # Save file
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        return unique_filename

    # Save profile picture
    profile_picture_path = save_uploaded_file(profile_picture, 'profile')
    
    try:
        # Begin transaction
        conn.start_transaction()
        
        # Insert into users table
        cursor.execute(
            """
            INSERT INTO users (name, email, password_hash, user_type, profile_picture)
            VALUES (%s, %s, %s, %s, %s)
            """,
            (name, email, hashed_password, user_type, profile_picture_path)
        )
        
        # Get the last inserted user ID
        user_id = cursor.lastrowid
        
        # If user is a driver, insert additional details
        if user_type == 'Driver':
            # Validate driver-specific required fields
            if not all([vehicle_number, vehicle_type, license_number]):
                raise HTTPException(
                    status_code=400, 
                    detail="Missing required driver information"
                )
            
            
            cursor.execute(
                """
                INSERT INTO drivers (id, vehicle_number, vehicle_type, license_number)
                VALUES (%s, %s, %s, %s)
                """,
                (user_id, vehicle_number, vehicle_type, license_number)
            )
        
        # Commit transaction
        conn.commit()
        
        return {"message": "User created successfully", "user_id": user_id}
    
    except Exception as e:
        # Rollback transaction in case of error
        conn.rollback()
        
        # Log the error for debugging
        print(f"Registration error: {str(e)}")
        
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
        cursor.execute("SELECT id, password_hash, name, user_type FROM users WHERE email = %s", (email,))
        user = cursor.fetchone()
        
        if user is None or not bcrypt.checkpw(password.encode('utf-8'), user[1].encode('utf-8')):
            raise HTTPException(status_code=401, detail="Invalid email or password")
        
        print(user)
        # Generate JWT token
        payload = {
            "user_id": user[0],
            "name": user[2],
            "user_type": user[3],
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
        
        cursor = conn.cursor(dictionary=True)
        
        # Fetch basic user information
        cursor.execute("""
            SELECT id, name, email, user_type, profile_picture 
            FROM users 
            WHERE id = %s
        """, (user_id,))
        user = cursor.fetchone()
        
        if user is None:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Initialize response with basic user data
        response = {
            "id": user['id'],
            "name": user['name'],
            "email": user['email'],
            "user_type": user['user_type'],
            "profile_picture": user['profile_picture']
        }
        
        # If user is a driver, fetch additional driver information
        if user['user_type'] == 'Driver':
            cursor.execute("""
                SELECT 
                    d.vehicle_number, 
                    d.vehicle_type, 
                    d.license_number, 
                    d.status,
                    COUNT(r.id) as total_rides,
                    AVG(r.rating) as average_rating
                FROM 
                    drivers d
                LEFT JOIN 
                    rides r ON r.driver_id = d.id
                WHERE 
                    d.id = %s
                GROUP BY 
                    d.id
            """, (user_id,))
            
            driver_details = cursor.fetchone()
            
            if driver_details:
                # Add driver-specific information to the response
                response.update({
                    "driver_details": {
                        "vehicle_number": driver_details['vehicle_number'],
                        "vehicle_type": driver_details['vehicle_type'],
                        "license_number": driver_details['license_number'],
                        "current_status": driver_details['status'],
                        "total_rides": driver_details['total_rides'] or 0,
                        "average_rating": round(driver_details['average_rating'], 2) if driver_details['average_rating'] else None
                    }
                })
        
        cursor.close()
        return response
    
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired")
    except jwt.DecodeError:
        raise HTTPException(status_code=401, detail="Invalid token")
    except Exception as e:
        # Log the error for debugging
        print(f"Error fetching user data: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

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
