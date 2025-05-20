# backend/app/main.py
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import SQLModel, Session, select

from .database import engine, get_session
from .models import Room
from .schemas import RoomCreate, RoomRead, RoomUpdate
from .crud import (
    get_rooms, get_room,
    create_room, update_room, delete_room
)
from .data_seed import seed_initial_data

app = FastAPI(title="Hotel Dashboard API")

# CORS: allow your frontend origin
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def on_startup():
    # Create tables
    SQLModel.metadata.create_all(engine)
    # Seed initial 4 rooms if empty
    seed_initial_data()

# --- Room Endpoints ---

@app.get("/rooms/", response_model=list[RoomRead])
def list_rooms(*, session: Session = Depends(get_session)):
    return get_rooms(session)

@app.post("/rooms/", response_model=RoomRead, status_code=201)
def create_new_room(
    *, session: Session = Depends(get_session), room_in: RoomCreate
):
    return create_room(session, room_in)

@app.get("/rooms/{room_id}", response_model=RoomRead)
def read_room(*, session: Session = Depends(get_session), room_id: int):
    room = get_room(session, room_id)
    if not room:
        raise HTTPException(404, "Room not found")
    return room

@app.patch("/rooms/{room_id}", response_model=RoomRead)
def update_existing_room(
    *, session: Session = Depends(get_session),
    room_id: int, room_in: RoomUpdate
):
    room = get_room(session, room_id)
    if not room:
        raise HTTPException(404, "Room not found")
    return update_room(session, room, room_in)

@app.delete("/rooms/{room_id}", status_code=204)
def delete_existing_room(
    *, session: Session = Depends(get_session), room_id: int
):
    room = get_room(session, room_id)
    if not room:
        raise HTTPException(404, "Room not found")
    delete_room(session, room)


