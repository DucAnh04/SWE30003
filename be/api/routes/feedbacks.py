from fastapi import APIRouter, HTTPException, Depends, Form
from typing import Optional, List
from db.connection import get_connection
import datetime
import jwt

router = APIRouter()
SECRET_KEY = "eyJhbGciOiJIUzI1NiJ9.eyJSb2xlIjoiQWRtaW4iLCJJc3N1ZXIiOiJJc3N1ZXIiLCJVc2VybmFtZSI6IkphdmFJblVzZSIsImV4cCI6MTc0Mjk4MjgxNiwiaWF0IjoxNzQyOTgyODE2fQ.Fzvu-o4TeN2FbOHnBXc5FJCO7wjrGb2kixHcQ6em-kU"
ALGORITHM = "HS256"

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