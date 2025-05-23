from sqlmodel import Session, select
from .database import engine
from .models import Room
import os


def seed_initial_data():
    with Session(engine) as session:
        # fetch existing rooms
        rooms = session.exec(select(Room)).all()
        if not rooms:
            # Create permanent folder if it doesn't exist
            os.makedirs("uploads/rooms/permanent", exist_ok=True)

            sample_rooms = [
                Room(
                    name="The Apartment",
                    description="Two spacious bedrooms with kingsized beds, full bathroom, kitchen and living area set across two levels.",
                    capacity=4,
                    facilities_count=14,
                    image_url="/uploads/rooms/permanent/theHugoHotelTheApartment.webp",  # ✅ Added leading /
                    created_at="17/03/25",
                    updated_at="18/03/25",
                ),
                Room(
                    name="Luxury Double Room",
                    description="Style and beauty with double bed, walk-in shower and daily servicing.",
                    capacity=2,
                    facilities_count=12,
                    image_url="/uploads/rooms/permanent/theHugoHotelLuxuryDoubleRoomAlt.webp",
                    created_at="17/03/25",
                    updated_at="18/03/25",
                ),
                Room(
                    name="Luxury Double Room",
                    description="Luxury and comfort with double bed, walk-in shower and daily servicing.",
                    capacity=2,
                    facilities_count=12,
                    image_url="/uploads/rooms/permanent/theHugoHotelLuxuryDoubleRoom.webp",  # ✅ Added leading /
                    created_at="17/03/25",
                    updated_at="-",
                ),
                Room(
                    name="King Junior Suite",
                    description="Modern luxury with kingsized bed, walk-in shower, double sinks, sitting area and air conditioning.",
                    capacity=2,
                    facilities_count=12,
                    image_url="/uploads/rooms/permanent/theHugoHotelKingJuniorSuite.webp",  # ✅ Added leading /
                    created_at="17/03/25",
                    updated_at="-",
                ),
            ]
            session.add_all(sample_rooms)
            session.commit()
            print("Sample rooms created with your hotel images!")
