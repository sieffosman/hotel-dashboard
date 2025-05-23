# Hotel Room Dashboard

A full-stack hotel room management system built with FastAPI (backend) and React (frontend).

## How to Get Started

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create and activate a virtual environment:
   ```bash
   # Create virtual environment
   python -m venv venv
   
   # Activate it (Windows)
   venv\Scripts\activate
   
   # Activate it (Mac/Linux)
   source venv/bin/activate
   ```

3. Install requirements:
   ```bash
   pip install -r requirements.txt
   ```

4. Run the backend server:
   ```bash
   uvicorn app.main:app --reload
   ```
   
   Backend will be available at: `http://localhost:8000`
   API documentation at: `http://localhost:8000/docs`

### Frontend Setup
1. Open a **new terminal** and navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```
   
   Frontend will be available at: `http://localhost:3000`

## Features Focused On so far
- FastAPI backend with SQLite database
- 4 pre-populated hotel rooms 
- CRUD API endpoints for rooms
- React frontend with room listing
- Room creation functionality
- TailwindCSS styling with custom theme ongoing
- Left navigation menu
- Room details view
- Basic PDF generation structure

## What I would go to next 
- PDF auto-generation on room create/save
- Repeatable facilities function (dropdown approach planned)
- Room edit/delete functionality in UI

## Further Steps I would take...
- Complete pytest coverage with negative testing
- Storybook component documentation
- Cypress end-to-end testing
- Pop-up components
- Advanced room management features

## API Endpoints
- `GET /rooms` - List all rooms
- `POST /rooms` - Create a new room  
- `GET /rooms/{id}` - Get room details
- `PUT /rooms/{id}` - Update room
- `DELETE /rooms/{id}` - Delete room
- `GET /rooms/{id}/pdf` - Generate room PDF
