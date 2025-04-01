from typing import Optional
from fastapi import APIRouter, HTTPException, Depends, Form, Header
from db.connection import get_connection
import jwt

router = APIRouter()

SECRET_KEY = "eyJhbGciOiJIUzI1NiJ9.eyJSb2xlIjoiQWRtaW4iLCJJc3N1ZXIiOiJJc3N1ZXIiLCJVc2VybmFtZSI6IkphdmFJblVzZSIsImV4cCI6MTc0Mjk4MjgxNiwiaWF0IjoxNzQyOTgyODE2fQ.Fzvu-o4TeN2FbOHnBXc5FJCO7wjrGb2kixHcQ6em-kU"
ALGORITHM = "HS256"

@router.post("/")
def create_payment(
    ride_id: int = Form(...),
    customer_id: int = Form(...),
    amount: float = Form(...),
    payment_method: str = Form(...),
    transaction_id: Optional[str] = Form(None),
    conn = Depends(get_connection)
):
    cursor = conn.cursor()
    print(payment_method)
    try:
        cursor.execute(
            """
            INSERT INTO payments (ride_id, customer_id, amount, payment_method, transaction_id, status)
            VALUES (%s, %s, %s, %s, %s, %s)
            """,
            (ride_id, customer_id, amount, payment_method, transaction_id, 'Completed')
        )
        conn.commit()
        return {"message": "Payment created successfully", "payment_id": cursor.lastrowid}
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        cursor.close()

@router.get("/{ride_id}")
def get_payment(ride_id: int, conn = Depends(get_connection)):
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("SELECT * FROM payments WHERE ride_id = %s", (ride_id,))
        payment = cursor.fetchone()
        if not payment:
            raise HTTPException(status_code=404, detail="Payment not found")
        return payment
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        cursor.close()
@router.get("/user/{user_id}")
def get_all_payment(user_id: int, conn = Depends(get_connection)):
    cursor = conn.cursor(dictionary=True)
    print('helloworld')
    try:
        cursor.execute("SELECT * FROM payments WHERE customer_id = %s", (user_id,))
        payment = cursor.fetchall()
        print(payment)
        if not payment:
            raise HTTPException(status_code=404, detail="Payment not found")
        return payment
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        cursor.close()



