from sqlmodel import Session, select
from .models import Room
from .schemas import RoomCreate, RoomUpdate

def get_rooms(session: Session) -> list[Room]:
    return session.exec(select(Room)).all()

def get_room(session: Session, room_id: int) -> Room | None:
    return session.get(Room, room_id)

def create_room(session: Session, room_in: RoomCreate) -> Room:
    room = Room.from_orm(room_in)
    session.add(room)
    session.commit()
    session.refresh(room)
    return room

def update_room(session: Session, room: Room, room_in: RoomUpdate) -> Room:
    data = room_in.dict(exclude_unset=True)
    for key, val in data.items():
        setattr(room, key, val)
    # For demo, we could set updated_at to "18/03/25" if needed
    # room.updated_at = "18/03/25"
    session.add(room)
    session.commit()
    session.refresh(room)
    return room

def delete_room(session: Session, room: Room) -> None:
    session.delete(room)
    session.commit()