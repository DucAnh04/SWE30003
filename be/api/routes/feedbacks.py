from fastapi import APIRouter, HTTPException, Depends, Form
from typing import Optional, List
from db.connection import get_connection
import datetime

router = APIRouter()

@router.post("/")
def create_feedback(
    customer_id: int = Form(...),
    rating: int = Form(...),
    comments: Optional[str] = Form(None),
    conn = Depends(get_connection)
):
    if not (1 <= rating <= 5):
        raise HTTPException(status_code=400, detail="Rating must be between 1 and 5")

    cursor = conn.cursor()
    
    try:
        cursor.execute("""
            INSERT INTO feedback (customer_id, rating, comments, created_at)
            VALUES (%s, %s, %s, %s)
        """, (customer_id, rating, comments, datetime.datetime.utcnow()))

        conn.commit()
        feedback_id = cursor.lastrowid
        return {"message": "Feedback submitted successfully", "feedback_id": feedback_id}
    
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    
    finally:
        cursor.close()

@router.get("/")
def get_all_feedback(conn = Depends(get_connection)):
    cursor = conn.cursor(dictionary=True)

    try:
        cursor.execute("SELECT * FROM feedback ORDER BY created_at DESC")
        feedbacks = cursor.fetchall()
        return feedbacks

    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

    finally:
        cursor.close()

@router.get("/{feedback_id}")
def get_feedback(feedback_id: int, conn = Depends(get_connection)):
    cursor = conn.cursor(dictionary=True)

    try:
        cursor.execute("SELECT * FROM feedback WHERE id = %s", (feedback_id,))
        feedback = cursor.fetchone()

        if not feedback:
            raise HTTPException(status_code=404, detail="Feedback not found")

        return feedback

    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

    finally:
        cursor.close()

@router.put("/{feedback_id}")
def update_feedback(
    feedback_id: int,
    rating: int = Form(...),
    comments: Optional[str] = Form(None),
    conn = Depends(get_connection)
):
    if not (1 <= rating <= 5):
        raise HTTPException(status_code=400, detail="Rating must be between 1 and 5")

    cursor = conn.cursor()

    try:
        cursor.execute("SELECT id FROM feedback WHERE id = %s", (feedback_id,))
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail="Feedback not found")

        cursor.execute("""
            UPDATE feedback SET rating = %s, comments = %s WHERE id = %s
        """, (rating, comments, feedback_id))

        conn.commit()
        return {"message": "Feedback updated successfully"}

    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=400, detail=str(e))

    finally:
        cursor.close()

@router.delete("/{feedback_id}")
def delete_feedback(feedback_id: int, conn = Depends(get_connection)):
    cursor = conn.cursor()

    try:
        cursor.execute("SELECT id FROM feedback WHERE id = %s", (feedback_id,))
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail="Feedback not found")

        cursor.execute("DELETE FROM feedback WHERE id = %s", (feedback_id,))
        conn.commit()
        return {"message": "Feedback deleted successfully"}

    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=400, detail=str(e))

    finally:
        cursor.close()
