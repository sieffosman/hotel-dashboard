# backend/app/pdf.py
from fastapi import HTTPException
from sqlmodel import Session, select
from jinja2 import Environment, FileSystemLoader, select_autoescape
from weasyprint import HTML
from .models import Room

# Configure Jinja2 to load templates from a `templates/` folder
env = Environment(
  loader=FileSystemLoader("backend/app/templates"),
  autoescape=select_autoescape(["html", "xml"])
)

def generate_room_list_pdf(session: Session) -> bytes:
    rooms = session.exec(select(Room)).all()
    template = env.get_template("rooms.html")  # you'll create this
    html_content = template.render(rooms=rooms)
    try:
        pdf_bytes = HTML(string=html_content).write_pdf()
        return pdf_bytes
    except Exception as e:
        raise HTTPException(500, detail=f"PDF generation error: {e}")

def generate_room_pdf(session: Session, room: Room) -> bytes:
    """Generate PDF for a specific room"""
    template = env.get_template("room_detail.html")
    html_content = template.render(room=room)
    try:
        pdf_bytes = HTML(string=html_content).write_pdf()
        return pdf_bytes
    except Exception as e:
        raise HTTPException(500, detail=f"PDF generation error: {e}")