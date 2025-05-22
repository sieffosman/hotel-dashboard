from sqlmodel import SQLModel, Field
from typing import Optional

class Room(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    description: str
    capacity: int
    image_url: Optional[str] = None
    # Simple facility count for demo
    facilities_count: int = Field(default=0)
    created_at: str = Field(default="17/03/25")  # Hardcoded for demo
    updated_at: Optional[str] = Field(default=None)  # Will be "-" or "18/03/25"