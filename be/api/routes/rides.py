from typing import Optional
from fastapi import APIRouter, HTTPException, Depends, Form, Header
import datetime
from db.connection import get_connection
import jwt

router = APIRouter()

SECRET_KEY = "eyJhbGciOiJIUzI1NiJ9.eyJSb2xlIjoiQWRtaW4iLCJJc3N1ZXIiOiJJc3N1ZXIiLCJVc2VybmFtZSI6IkphdmFJblVzZSIsImV4cCI6MTc0Mjk4MjgxNiwiaWF0IjoxNzQyOTgyODE2fQ.Fzvu-o4TeN2FbOHnBXc5FJCO7wjrGb2kixHcQ6em-kU"
ALGORITHM = "HS256"

@router.post("/")
def create_ride(
    customer_id: int = Form(...),
    pickup_location: str = Form(...),
    dropoff_location: str = Form(...),
    vehicle: Optional[str] = Form(None),
    passengers: int = Form(1),
    conn = Depends(get_connection)
):
    cursor = conn.cursor()
    try:
        cursor.execute(
            """
            INSERT INTO rides (customer_id, pickup_location, dropoff_location, vehicle, passengers)
            VALUES (%s, %s, %s, %s, %s)
            """,
            (customer_id, pickup_location, dropoff_location, vehicle, passengers)
        )
        conn.commit()
        return {"message": "Ride request created successfully", "ride_id": cursor.lastrowid}
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        cursor.close()

@router.get("/{ride_id}")
def get_ride(ride_id: int, conn = Depends(get_connection)):
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("SELECT * FROM rides WHERE id = %s", (ride_id,))
        ride = cursor.fetchone()
        if not ride:
            raise HTTPException(status_code=404, detail="Ride not found")
        return ride
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        cursor.close()

@router.get("/recent/me")
def get_recent_ride(
    authorization: str = Header(...), 
    conn = Depends(get_connection)):
    cursor = conn.cursor(dictionary=True)
    try:
        token = authorization.replace("Bearer ", "")
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("user_id")
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token")
        cursor.execute("""
        SELECT 
            r.id AS ride_id,
            r.pickup_location,
            r.dropoff_location,
            r.status,
            r.rating,
            r.fare,
            r.start_time,
            r.end_time,
            r.vehicle,
            r.passengers,
            r.created_at,
            cu.id AS customer_id,
            cu.name AS customer_name,
            d.id AS driver_id,
            d.name AS driver_name
        FROM rides r
        INNER JOIN users cu ON r.customer_id = cu.id
        LEFT JOIN users d ON r.driver_id = d.id  -- LEFT JOIN because driver may be NULL
        WHERE r.customer_id = %s OR r.driver_id = %s
        ORDER BY r.created_at DESC
        LIMIT 1;
        """, (user_id, user_id))
        ride = cursor.fetchone()
        if not ride:
            raise HTTPException(status_code=404, detail="Ride not found")
        return ride
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        cursor.close()

@router.get("/all/me")
def get_all_ride(
    authorization: str = Header(None), 
    conn = Depends(get_connection)
):
    cursor = conn.cursor(dictionary=True)
    if not authorization:
        raise HTTPException(status_code=400, detail="Missing Authorization header")
    try:
        token = authorization.replace("Bearer ", "")
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("user_id")
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token")

        cursor.execute("""
        SELECT 
            r.id AS ride_id,
            r.pickup_location,
            r.dropoff_location,
            r.status,
            r.rating,
            r.fare,
            r.start_time,
            r.end_time,
            r.vehicle,
            r.passengers,
            r.created_at,
            cu.id AS customer_id,
            cu.name AS customer_name,
            d.id AS driver_id,
            d.name AS driver_name
        FROM rides r
        INNER JOIN users cu ON r.customer_id = cu.id
        LEFT JOIN users d ON r.driver_id = d.id  -- LEFT JOIN because driver may be NULL
        WHERE r.customer_id = %s OR r.driver_id = %s
        ORDER BY r.created_at DESC;
        """, (user_id, user_id))

        rides = cursor.fetchall()  # Fetch all rows as a list of dictionaries
        return rides
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        cursor.close()


@router.put("/{ride_id}")
def update_ride(
    ride_id: int,
    status: Optional[str] = Form(None),
    rating: Optional[str] = Form(None),
    conn = Depends(get_connection)
):
    cursor = conn.cursor()
    try:
        updates = []
        values = []
        
        if status is not None:
            updates.append("status = %s")
            values.append(status)
            
            # Set end_time to current time when status is Completed or Cancelled
            if status in ['Completed', 'Cancelled']:
                updates.append("end_time = NOW()")
        
        if rating is not None:
            updates.append("rating = %s")
            values.append(rating)
            
        if not updates:
            raise HTTPException(status_code=400, detail="No updates provided")
            
        values.append(ride_id)
        cursor.execute(f"""UPDATE rides SET {', '.join(updates)} WHERE id = %s""", values)
        conn.commit()
        return {"message": "Ride updated successfully"}
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        cursor.close()

