from pydantic import BaseModel
from typing import Optional

class RoomBase(BaseModel):
    name: str
    description: str
    capacity: int
    image_url: Optional[str] = None
    facilities_count: int

class RoomCreate(RoomBase):
    pass

class RoomUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    capacity: Optional[int] = None
    image_url: Optional[str] = None
    facilities_count: Optional[int] = None

class RoomRead(RoomBase):
    id: int
    created_at: str
    updated_at: Optional[str]

    class Config:
        from_attributes = True