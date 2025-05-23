from fastapi import FastAPI, HTTPException, Depends, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
from fastapi.staticfiles import StaticFiles
from sqlmodel import SQLModel
import os
import shutil
from datetime import datetime
import uuid
from pathlib import Path

from .database import engine, get_session
from .models import Room
from .schemas import RoomCreate, RoomRead, RoomUpdate
from .crud import get_rooms, get_room, create_room, update_room, delete_room
from .data_seed import seed_initial_data
from .pdf import generate_room_pdf

app = FastAPI(title="Hotel Dashboard API")

# Create upload directories
os.makedirs("uploads/rooms/temp", exist_ok=True)
os.makedirs("uploads/rooms/permanent", exist_ok=True)

# Serve static files
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# Enable CORS for frontend origin
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup():
    # create tables
    SQLModel.metadata.create_all(engine)
    # seed data if empty
    seed_initial_data()


# ==============================
# IMAGE UPLOAD ENDPOINTS
# ==============================


@app.post("/api/upload/temp-room-image")
async def upload_temp_image(image: UploadFile = File(...)):
    """Upload image to temporary folder"""
    try:
        # Validate file type
        if not image.content_type.startswith("image/"):
            raise HTTPException(status_code=400, detail="Only image files allowed")

        # Generate unique filename
        file_extension = os.path.splitext(image.filename)[1]
        temp_filename = (
            f"temp_{datetime.now().timestamp()}_{uuid.uuid4().hex[:8]}{file_extension}"
        )
        temp_path = f"uploads/rooms/temp/{temp_filename}"

        # Save file
        with open(temp_path, "wb") as buffer:
            shutil.copyfileobj(image.file, buffer)

        temp_url = f"/uploads/rooms/temp/{temp_filename}"

        return {"success": True, "tempImageUrl": temp_url, "fileName": temp_filename}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")


@app.post("/api/rooms/{room_id}/finalize-image")
async def finalize_room_image(
    room_id: int, request: dict, session=Depends(get_session)
):
    """Move image from temp to permanent folder and update database"""
    try:
        temp_image_url = request.get("tempImageUrl")
        if not temp_image_url:
            raise HTTPException(status_code=400, detail="No temp image URL provided")

        # Check if room exists
        room = get_room(session, room_id)
        if not room:
            raise HTTPException(status_code=404, detail="Room not found")

        # Extract filename from URL
        temp_filename = os.path.basename(temp_image_url)
        temp_path = f"uploads/rooms/temp/{temp_filename}"

        if not os.path.exists(temp_path):
            raise HTTPException(status_code=404, detail="Temp image not found")

        # Create permanent filename
        file_extension = os.path.splitext(temp_filename)[1]
        permanent_filename = (
            f"room_{room_id}_{int(datetime.now().timestamp())}{file_extension}"
        )
        permanent_path = f"uploads/rooms/permanent/{permanent_filename}"

        # Move file
        shutil.move(temp_path, permanent_path)

        # Update database with permanent URL
        permanent_url = f"/uploads/rooms/permanent/{permanent_filename}"

        # Update room with new image URL
        room_update = RoomUpdate(image_url=permanent_url)
        updated_room = update_room(session, room, room_update)

        return {"success": True, "imageUrl": permanent_url, "room": updated_room}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Finalize failed: {str(e)}")


@app.delete("/api/upload/cleanup-temp")
async def cleanup_temp_image(request: dict):
    """Clean up temporary image"""
    try:
        temp_image_url = request.get("tempImageUrl")
        if temp_image_url:
            temp_filename = os.path.basename(temp_image_url)
            temp_path = f"uploads/rooms/temp/{temp_filename}"

            if os.path.exists(temp_path):
                os.remove(temp_path)

        return {"success": True}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Cleanup failed: {str(e)}")


# ==============================
# EXISTING ROOM ENDPOINTS
# ==============================


# List rooms
@app.get("/rooms/", response_model=list[RoomRead])
def list_rooms(*, session=Depends(get_session)):
    return get_rooms(session)


# Create room
@app.post("/rooms/", response_model=RoomRead, status_code=201)
def create_new_room(*, session=Depends(get_session), room_in: RoomCreate):
    return create_room(session, room_in)


# Read room by id
@app.get("/rooms/{room_id}", response_model=RoomRead)
def read_room(*, session=Depends(get_session), room_id: int):
    room = get_room(session, room_id)
    if not room:
        raise HTTPException(404, "Room not found")
    return room


# Update room
@app.patch("/rooms/{room_id}", response_model=RoomRead)
def update_existing_room(
    *, session=Depends(get_session), room_id: int, room_in: RoomUpdate
):
    room = get_room(session, room_id)
    if not room:
        raise HTTPException(404, "Room not found")
    return update_room(session, room, room_in)


# Delete room
@app.delete("/rooms/{room_id}", status_code=204)
def delete_existing_room(*, session=Depends(get_session), room_id: int):
    room = get_room(session, room_id)
    if not room:
        raise HTTPException(404, "Room not found")
    delete_room(session, room)


# Generate PDF for specific room
@app.post("/rooms/{room_id}/generate-pdf")
def generate_room_pdf_endpoint(*, session=Depends(get_session), room_id: int):
    room = get_room(session, room_id)
    if not room:
        raise HTTPException(404, "Room not found")

    try:
        pdf_bytes = generate_room_pdf(session, room)
        return Response(
            content=pdf_bytes,
            media_type="application/pdf",
            headers={
                "Content-Disposition": f"attachment; filename=room_{room_id}_{room.name.replace(' ', '_')}.pdf"
            },
        )
    except Exception as e:
        raise HTTPException(500, detail=f"PDF generation failed: {str(e)}")
