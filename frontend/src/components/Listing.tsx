import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';

// Define the room type directly in this file for now
interface Room {
  id: number;
  name: string;
  description: string;
  capacity: number;
  image_url?: string;
  facilities_count: number;
  created_at: string;
  updated_at?: string;
}

export default function Listing() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log('Fetching rooms from API...');
        
        const response = await api.get('/rooms');
        console.log('Raw API Response:', response);
        console.log('Response data:', response.data);
        console.log('Response data type:', typeof response.data);
        console.log('Is response.data an array?', Array.isArray(response.data));
        
        // Ensure we have an array
        let roomsData = response.data;
        if (!Array.isArray(roomsData)) {
          console.warn('API did not return an array, setting to empty array');
          roomsData = [];
        }
        
        console.log('Setting rooms to:', roomsData);
        setRooms(roomsData);
        
      } catch (err) {
        console.error('Error fetching rooms:', err);
        setError(`Failed to load rooms: ${err}`);
        setRooms([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRooms();
  }, []);

  // Debug logs
  console.log('Current rooms state:', rooms);
  console.log('Current loading state:', loading);
  console.log('Current error state:', error);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg font-medium text-gray-900">Loading rooms...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg font-medium text-red-600">{error}</div>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Extra safety checks
  if (!rooms || !Array.isArray(rooms)) {
    console.error('Rooms is not an array:', rooms);
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg font-medium text-red-600">Data structure error</div>
          <div className="text-sm text-gray-600 mt-2">Rooms data is not in the expected format</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="header-text">All rooms</h1>
        <Link
          to="/rooms/new"
          className="btn-primary"
        >
          CREATE A ROOM
        </Link>
      </div>
{/* Table */}
<div>
  {/* Table Header */}
  <div className="grid grid-cols-5 gap-6 py-3 px-4 text-sm font-medium text-gray-900 border-b border-gray-200">
    <div>Room</div>
    <div>Description</div>
    <div>Facilities</div>
    <div>Created</div>
    <div>Updated</div>
  </div>

  {/* Table Rows */}
  <div>
    {rooms.length === 0 ? (
      <div className="py-8 px-4 text-center text-gray-500">
        No rooms available
      </div>
    ) : (
      [...rooms].reverse().map((room, index) => {
        // Extra safety for each room object
        if (!room || typeof room !== 'object') {
          console.error(`Room at index ${index} is invalid:`, room);
          return (
            <div key={index} className="py-3 px-4 text-red-500 border-b border-gray-200">
              Invalid room data at index {index}
            </div>
          );
        }

        return (
          <Link
            key={room.id || index}
            to={`/rooms/${room.id || 'unknown'}`}
            className="grid grid-cols-5 gap-6 py-3 px-4 hover:bg-gray-50 transition-colors cursor-pointer group border-b border-gray-200"
          >
            {/* Room Name */}
            <div className="text-gray-900 font-medium group-hover:text-red-600">
              No. {room.id || '?'} {room.name || 'Unknown Room'}
            </div>

            {/* Description */}
            <div className="text-gray-700 text-sm">
              {room.description || 'No description available'}
            </div>

            {/* Facilities count */}
            <div className="text-gray-700 text-sm">
              {room.facilities_count || 0}
            </div>

            {/* Created date */}
            <div className="text-gray-700 text-sm">
              {room.created_at || "-"}
            </div>

            {/* Updated date */}
            <div className="text-gray-700 text-sm">
              {room.updated_at || "-"}
            </div>
          </Link>
        );
      })
    )}
  </div>
</div>
    </div>
  );
}