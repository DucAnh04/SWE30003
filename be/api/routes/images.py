from fastapi import APIRouter, HTTPException
import os

from fastapi.responses import FileResponse
from db.connection import get_connection

router = APIRouter()
UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.get("/{filename}")
def get_image(filename: str):
    image_path = os.path.join(UPLOAD_DIR, filename)
    if not os.path.exists(image_path):
        raise HTTPException(status_code=404, detail="Image not found")
    return FileResponse(image_path)