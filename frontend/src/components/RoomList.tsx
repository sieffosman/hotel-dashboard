import React, { useState, useEffect } from 'react';
import api from '../api';
import { RoomRead } from '../types';

export default function RoomList() {
  const [rooms, setRooms] = useState<RoomRead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.get<RoomRead[]>('/rooms/')
      .then(res => setRooms(res.data))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-4">Loading...</div>;
  if (error)   return <div className="p-4 text-red-600">Error: {error}</div>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">All Rooms</h1>
      <ul className="space-y-4">
        {rooms.map(room => (
          <li
            key={room.id}
            className="border p-4 rounded shadow-sm flex justify-between items-center"
          >
            <div>
              <h2 className="text-xl font-semibold">{room.name}</h2>
              <p className="text-gray-600">{room.description}</p>
            </div>
            <div className="text-right">
              <span className="text-lg font-medium">${room.price}</span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
