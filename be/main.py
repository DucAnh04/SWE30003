from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from api.routes import users, images, feedbacks, rides
from fastapi.middleware.cors import CORSMiddleware
from typing import Dict, List
import json
import random
import datetime
from db.connection import get_connection
app = FastAPI()

# CORS settings
origins = ["http://localhost:3000","http://127.0.0.1:3000", "http://127.0.0.1:5173", "http://localhost:5173"]
app.add_middleware(
    CORSMiddleware, allow_origins=origins, allow_credentials=True, allow_methods=["*"], allow_headers=["*"]
)

# Include API routes
app.include_router(users.router, prefix="/users", tags=["Users"])
app.include_router(images.router, prefix="/images", tags=["Images"])
app.include_router(feedbacks.router, prefix="/feedbacks", tags=["Feedbacks"])
app.include_router(rides.router, prefix="/rides", tags=["Rides"])

class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []
        self.drivers: Dict[int, WebSocket] = {}
        self.customers: Dict[int, WebSocket] = {}

    async def connect(self, websocket: WebSocket, user_type: str, client_id: int):
        await websocket.accept()
        self.active_connections.append(websocket)
        
        if user_type == "Driver":
            self.drivers[client_id] = websocket
            print(f"Driver {client_id} connected")
        elif user_type == "Customer":
            self.customers[client_id] = websocket
            print(f"Customer {client_id} connected")

    def disconnect(self, websocket: WebSocket, user_type: str, client_id: int):
        self.active_connections.remove(websocket)
        
        if user_type == "Driver":
            del self.drivers[client_id]
            print(f"Driver {client_id} disconnected")
        elif user_type == "Customer":
            del self.customers[client_id]
            print(f"Customer {client_id} disconnected")

    async def send_personal_message(self, message: str, websocket: WebSocket):
        await websocket.send_text(message)

    async def broadcast(self, message: str):
        for connection in self.active_connections:
            await connection.send_text(message)

    async def send_ride_request_to_driver(self, ride_request: dict):
        # If no drivers are available, send an error to the customer
        if not self.drivers:
            customer_socket = self.customers.get(ride_request.get('customer_id'))
            if customer_socket:
                await self.send_personal_message(json.dumps({
                    "type": "error",
                    "message": "No drivers available"
                }), customer_socket)
            return

        # Select a random driver
        driver_id = random.choice(list(self.drivers.keys()))
        driver_socket = self.drivers[driver_id]

        # Send ride request to the selected driver
        await self.send_personal_message(json.dumps({
            "type": "findDriver",
            "driver_id": driver_id,
            "ride_info": ride_request
        }), driver_socket)

manager = ConnectionManager()

@app.get("/")
def root():
    
    return {"message": "Welcome to the Coffee Marketplace API"}
import json

@app.websocket("/ws/{user_type}/{client_id}/{user_id}")
async def websocket_endpoint(websocket: WebSocket, client_id: int, user_type: str, user_id: int):
    await manager.connect(websocket, user_type, client_id)
    print("WebSocket connection established", client_id, user_type, user_id)
    print(f"User type: {user_type}, Client ID: {client_id}")
    await manager.send_personal_message(json.dumps({
        "message": f"Welcome {user_type} {client_id}!",
        "type": "welcome"
    }), websocket)
    try:
        while True:
            # Receive text data
            data = await websocket.receive_text()
            
            # Parse the incoming JSON
            try:
                parsed_data = json.loads(data)
                
                # Special handling for ride requests
                if parsed_data.get('type') == 'findDriver':
                    # Add customer ID to the ride request
                    print('hello')
                    parsed_data['customer_id'] = client_id
                    parsed_data['customerDB_id'] = user_id 
                    await manager.send_ride_request_to_driver(parsed_data)
                elif parsed_data.get('type') == 'driverResponse':
                    # Find the customer's socket and send the response
                    parsed_data['rideInfo']['driverDB_id'] = user_id
                    ride_info = parsed_data.get('rideInfo', {})
                    
                    # Assuming you have a database connection
                    ride_id = insert_ride_to_database(ride_info)
                    print(ride_id)

                    customer_socket = manager.customers.get(parsed_data['rideInfo']['customer_id'])
                    print(parsed_data)
                    if customer_socket:
                        await manager.send_personal_message(json.dumps({
                            "type": "driverResponse",
                            "accepted": parsed_data['accepted'],
                            "driver_id": client_id
                        }), customer_socket)

                    

                else:
                    # Broadcast other types of messages
                    await manager.broadcast(json.dumps({
                        "sender": client_id,
                        "data": parsed_data
                    }))
            
            except json.JSONDecodeError:
                # Handle invalid JSON
                await manager.send_personal_message(json.dumps({
                    "type": "error",
                    "message": "Invalid JSON format"
                }), websocket)
    
    except WebSocketDisconnect:
        manager.disconnect(websocket, user_type, client_id)




from datetime import datetime

def insert_ride_to_database(ride_info):
    """
    Insert a new ride into the rides table when a driver accepts the ride.
    
    :param ride_info: Dictionary containing ride details
    :return: Ride ID or None if insertion fails
    """
    connection = None
    try:
        # Use your existing database connection method
        connection = get_connection()   
        
        cursor = connection.cursor()
        
        # SQL query to insert ride information
        query = """
        INSERT INTO rides 
        (customer_id, driver_id, pickup_location, dropoff_location, status, start_time, vehicle, passengers) 
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
        """
        
        # Extract details from ride_info
        customer_id = ride_info.get('customerDB_id')
        driver_id = ride_info.get('driverDB_id')
        pickup_location = ride_info.get('from')
        dropoff_location = ride_info.get('to')
        vehicle = ride_info.get('vehicle')
        passengers = ride_info.get('passengers')
        
        # Validate required fields
        if not all([customer_id, driver_id, pickup_location, dropoff_location, vehicle, passengers]):
            print("Missing required ride information")
            return None
        
        # Insert the ride with 'Accepted' status and current timestamp
        cursor.execute(query, (
            customer_id, 
            driver_id, 
            pickup_location, 
            dropoff_location, 
            'Accepted', 
            datetime.now(),
            vehicle,
            passengers
        ))
        
        # Commit the transaction
        connection.commit()
        
        print("Ride inserted successfully")
        
        # Get and return the ID of the inserted ride
        ride_id = cursor.lastrowid
        
        return ride_id
    
    finally:
        # Ensure cursor and connection are closed
        if 'cursor' in locals():
            cursor.close()
        if connection:
            connection.close()