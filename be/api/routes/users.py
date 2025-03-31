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

# Edit Profile
@router.put("/edit-profile")
def edit_profile(
    token: str = Form(...),
    name: Optional[str] = Form(None),
    email: Optional[str] = Form(None),
    profile_picture: Optional[UploadFile] = File(None),
    
    # Optional driver-specific updates
    vehicle_number: Optional[str] = Form(None),
    vehicle_type: Optional[str] = Form(None),
    license_number: Optional[str] = Form(None),
    status: Optional[str] = Form(None), 
    
    conn = Depends(get_connection)
):
    try:
        # Decode and validate the token
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("user_id")
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token")
        
        cursor = conn.cursor(dictionary=True)
        
        # Function to save uploaded file (reusing from create_user)
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

        # Begin transaction
        conn.start_transaction()
        
        # Fetch current user details
        cursor.execute("SELECT * FROM users WHERE id = %s", (user_id,))
        current_user = cursor.fetchone()
        
        if current_user is None:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Prepare update data
        update_data = {}
        
        # Update name if provided
        if name is not None:
            update_data['name'] = name
        
        # Update email if provided and validate
        if email is not None:
            # Optional: Add email validation logic
            if email != current_user['email']:
                # Check if email already exists
                cursor.execute("SELECT id FROM users WHERE email = %s", (email,))
                existing_email = cursor.fetchone()
                if existing_email:
                    raise HTTPException(status_code=400, detail="Email already in use")
                update_data['email'] = email
        
        # Handle profile picture upload
        if profile_picture:
            # Delete old profile picture if it exists
            if current_user['profile_picture']:
                old_picture_path = os.path.join('uploads', current_user['profile_picture'])
                if os.path.exists(old_picture_path):
                    os.remove(old_picture_path)
            
            # Save new profile picture
            new_profile_picture = save_uploaded_file(profile_picture, 'profile')
            update_data['profile_picture'] = new_profile_picture
        
        # Update user table if there are changes
        if update_data:
            update_query = "UPDATE users SET " + ", ".join([f"{k} = %s" for k in update_data.keys()]) + " WHERE id = %s"
            update_values = list(update_data.values()) + [user_id]
            cursor.execute(update_query, update_values)
        
        # Update driver-specific information if user is a driver
        if current_user['user_type'] == 'Driver':
            driver_update_data = {}
            
            if vehicle_number is not None:
                driver_update_data['vehicle_number'] = vehicle_number
            
            if vehicle_type is not None:
                driver_update_data['vehicle_type'] = vehicle_type
            
            if license_number is not None:
                driver_update_data['license_number'] = license_number
            
            # Add status update for drivers
            if status is not None:
                # Validate status against ENUM values
                valid_statuses = ['Available', 'On Ride', 'Offline']
                if status not in valid_statuses:
                    raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of {valid_statuses}")
                driver_update_data['status'] = status
            
            # Update drivers table if there are changes
            if driver_update_data:
                update_driver_query = "UPDATE drivers SET " + ", ".join([f"{k} = %s" for k in driver_update_data.keys()]) + " WHERE id = %s"
                driver_update_values = list(driver_update_data.values()) + [user_id]
                cursor.execute(update_driver_query, driver_update_values)
        
        # Commit transaction
        conn.commit()
        
        # Fetch and return updated user details
        cursor.execute("""
            SELECT u.*, 
                   d.vehicle_number, d.vehicle_type, d.license_number, d.status
            FROM users u
            LEFT JOIN drivers d ON u.id = d.id
            WHERE u.id = %s
        """, (user_id,))
        updated_user = cursor.fetchone()
        
        return updated_user
    
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired")
    except jwt.DecodeError:
        raise HTTPException(status_code=401, detail="Invalid token")
    except Exception as e:
        # Rollback transaction in case of error
        conn.rollback()
        
        # Log the error for debugging
        print(f"Profile update error: {str(e)}")
        
        raise HTTPException(status_code=400, detail=str(e))
    
    finally:
        cursor.close()

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
@router.post("/submit")
def submit_feedback(
    name: str = Form(...),
    email: str = Form(...),
    phone_number: Optional[str] = Form(None),
    find_us: Optional[str] = Form(None),
    rating: int = Form(...),
    feedback_text: str = Form(...),
    user_token: Optional[str] = Form(None),
    conn = Depends(get_connection)
):
    cursor = conn.cursor()

    try:
        # Begin transaction
        conn.start_transaction()

        # Decode user token if provided
        user_id = None
        if user_token:
            try:
                payload = jwt.decode(user_token, SECRET_KEY, algorithms=[ALGORITHM])
                user_id = payload.get("user_id")
            except jwt.ExpiredSignatureError:
                raise HTTPException(status_code=401, detail="Token has expired")
            except jwt.InvalidTokenError:
                raise HTTPException(status_code=401, detail="Invalid token")

        # Insert all feedback data into a single table
        cursor.execute(
            """
            INSERT INTO feedback (user_id, name, email, phone_number, find_us, rating, feedback_text, created_at)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
            """,
            (user_id, name, email, phone_number, find_us, rating, feedback_text, datetime.datetime.now())
        )

        feedback_id = cursor.lastrowid  # Retrieve the inserted feedback ID

        # Commit transaction
        conn.commit()

        return {"message": "Feedback submitted successfully", "feedback_id": feedback_id}

    except Exception as e:
        conn.rollback()  # Rollback on error
        print(f"Feedback submission error: {str(e)}")  # Logging
        raise HTTPException(status_code=400, detail=str(e))

    finally:
        cursor.close()

@router.get("/all-feedback")
def get_all_feedback(
    limit: int = 10,
    page: int = 1,
    conn = Depends(get_connection)
):
    cursor = conn.cursor(dictionary=True)
    offset = (page - 1) * limit
    
    try:
        # Fetch all feedback entries
        cursor.execute(
            """
            SELECT 
                id,
                name,
                email,
                phone_number,
                find_us,
                rating,
                feedback_text,
                created_at
            FROM 
                feedback
            ORDER BY 
                created_at DESC
            LIMIT %s OFFSET %s
            """,
            (limit, offset)
        )
        
        feedback_entries = cursor.fetchall()
        
        # Get total count for pagination
        cursor.execute("SELECT COUNT(*) as total FROM feedback")
        count_result = cursor.fetchone()
        total_count = count_result['total'] if count_result else 0
        
        # Format the data for the frontend
        formatted_feedback = [
            {
                "id": f['id'],
                "name": f['name'],
                "email": f['email'],
                "phone": f['phone_number'],
                "find_us": f['find_us'] if f['find_us'] else "Not specified",
                "rating": f['rating'],
                "review": f['feedback_text'],
                "date": f['created_at'].strftime('%B %d, %Y')
            }
            for f in feedback_entries
        ]

        return {
            "feedback": formatted_feedback,
            "total": total_count,
            "pages": (total_count + limit - 1) // limit
        }
    
    except Exception as e:
        print(f"Error fetching feedback: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")
    
    finally:
        cursor.close()
