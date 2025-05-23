# backend/app/pdf.py

import os
import traceback
from datetime import datetime
from fastapi import HTTPException
from sqlmodel import Session, select
from jinja2 import Environment, FileSystemLoader, select_autoescape
from weasyprint import HTML
from .models import Room

# Configure Jinja2 to load templates from your templates folder
# Since running from backend folder, path is app/templates not backend/app/templates
env = Environment(
    loader=FileSystemLoader("app/templates"),
    autoescape=select_autoescape(["html", "xml"]),
)


def generate_room_list_pdf(session: Session) -> bytes:
    """Generate PDF for all rooms"""
    rooms = session.exec(select(Room)).all()
    template = env.get_template("rooms.html")
    html_content = template.render(
        rooms=rooms, generation_date=datetime.now().strftime("%d/%m/%Y, %H:%M:%S")
    )
    try:
        pdf_bytes = HTML(
            string=html_content, base_url="http://127.0.0.1:8000"
        ).write_pdf()
        return pdf_bytes
    except Exception as e:
        print(f"PDF LIST ERROR: {e}")
        print(f"TRACEBACK: {traceback.format_exc()}")
        raise HTTPException(500, detail=f"PDF generation error: {e}")


def get_default_facilities():
    """Return default facilities list that can be customized per room"""
    return [
        "King sized bed",
        "Air Conditioning",
        "Sitting area",
        "Large en-suite shower room",
        "Internet TV",
        "WiFi",
        "Nespresso System",
        "E-Concierge",
        "All-night checkin",
        "Luxury Amenities",
        "Temple Spa toiletries",
        "Towels and linen",
    ]


def split_facilities(facilities_list):
    """Split facilities into two columns for better layout"""
    mid_point = len(facilities_list) // 2 + len(facilities_list) % 2
    return facilities_list[:mid_point], facilities_list[mid_point:]


def generate_room_pdf(session: Session, room: Room) -> bytes:
    """Generate PDF for a specific room."""
    try:
        print(f"🔧 Starting PDF generation for room: {room.id}")
        print(f"🔧 Room data: {room}")

        # Get absolute path to template
        current_dir = os.getcwd()
        template_path = os.path.join(
            current_dir, "app", "templates", "room_detail.html"
        )
        print(f"🔧 Looking for template at: {template_path}")
        print(f"🔧 Current working directory: {current_dir}")

        if not os.path.exists(template_path):
            print(f"❌ Template not found at: {template_path}")
            # List what's actually in the templates directory
            templates_dir = os.path.join(current_dir, "app", "templates")
            if os.path.exists(templates_dir):
                files = os.listdir(templates_dir)
                print(f"📁 Files in templates directory: {files}")
            else:
                print(f"📁 Templates directory doesn't exist: {templates_dir}")
            raise HTTPException(
                500, detail=f"Template not found. Please create: {template_path}"
            )

        print(f"✅ Template found")

        template = env.get_template("room_detail.html")
        print(f"✅ Template loaded")

        # Get facilities - you might want to customize this per room type
        # For now using default facilities, but you could modify based on room.facilities_count
        # or add a facilities field to your Room model
        facilities = get_default_facilities()

        # If your Room model has specific facilities, you could do something like:
        # if hasattr(room, 'facilities') and room.facilities:
        #     facilities = room.facilities

        facilities_col1, facilities_col2 = split_facilities(facilities)

        # Prepare context data
        context_data = {
            "room": room,
            "generation_date": datetime.now().strftime("%d/%m/%Y, %H:%M:%S"),
            "facilities_col1": facilities_col1,
            "facilities_col2": facilities_col2,
        }
        print(f"🔧 Rendering template with context")

        html_content = template.render(**context_data)
        print(f"✅ HTML rendered successfully")
        print(f"🔧 HTML preview (first 200 chars): {html_content[:200]}...")

        # Check if image file exists
        if room.image_url:
            # Since running from backend folder, remove leading slash and check relative path
            image_relative_path = room.image_url.lstrip("/")
            image_path = os.path.join(current_dir, image_relative_path)
            if os.path.exists(image_path):
                print(f"✅ Image found at: {image_path}")
            else:
                print(f"⚠️ Image not found at: {image_path}")
                # List what's in uploads folder
                uploads_dir = os.path.join(current_dir, "uploads", "rooms", "permanent")
                if os.path.exists(uploads_dir):
                    files = os.listdir(uploads_dir)
                    print(f"📁 Files in uploads/rooms/permanent: {files}")
                else:
                    print(f"📁 Uploads directory doesn't exist: {uploads_dir}")

        # Check if logo exists
        logo_path = os.path.join(current_dir, "uploads", "assets", "hugo-logo.png")
        if not os.path.exists(logo_path):
            print(f"⚠️ Logo not found at: {logo_path}")
            # Create assets directory if it doesn't exist
            assets_dir = os.path.join(current_dir, "uploads", "assets")
            os.makedirs(assets_dir, exist_ok=True)
            print(f"📁 Created assets directory: {assets_dir}")
            print(f"🔧 Please place your logo at: {logo_path}")

        print(f"🔧 Generating PDF with base_url: http://127.0.0.1:8000")
        pdf_bytes = HTML(
            string=html_content, base_url="http://127.0.0.1:8000"
        ).write_pdf(
            stylesheets=[],
            # Reduce page margins for cleaner output
            presentational_hints=True,
        )

        print(f"✅ PDF generated successfully, size: {len(pdf_bytes)} bytes")
        return pdf_bytes

    except Exception as e:
        print(f"❌ PDF GENERATION ERROR: {e}")
        print(f"❌ FULL TRACEBACK: {traceback.format_exc()}")
        raise HTTPException(500, detail=f"PDF generation error: {str(e)}")
