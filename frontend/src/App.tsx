// frontend/src/App.tsx
import { Routes, Route, Navigate } from 'react-router-dom';
import LeftNav from './components/LeftNav';
import Listing from './components/Listing';
import RoomDetails from './components/RoomDetails';
import RoomForm from './components/RoomForm';

function App() {
  return (
      <div className="flex h-screen bg-gray-100">
        {/* Left Navigation */}
        <LeftNav />
        
        {/* Main Content Area */}
        <div className="flex-1 overflow-auto p-10">
          <Routes>
            {/* Default redirect to rooms list */}
            <Route path="/" element={<Navigate to="/rooms" replace />} />
            
            {/* Rooms list page */}
            <Route path="/rooms" element={<Listing />} />
            
            {/* Individual room details */}
            <Route path="/rooms/:id" element={<RoomDetails />} />
            
            {/* Create new room */}
            <Route path="/rooms/new" element={<RoomForm />} />
            
            {/* Catch all - redirect to rooms */}
            <Route path="*" element={<Navigate to="/rooms" replace />} />
          </Routes>
        </div>
      </div>
  );
}

export default App;