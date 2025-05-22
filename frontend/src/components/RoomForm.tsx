import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import type { RoomCreate } from '../types';

export default function RoomForm() {
  const nav = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Empty form state
  const [form, setForm] = useState<RoomCreate>({
    name: '',
    description: '',
    capacity: 2,
    image_url: '',
    facilities_count: 0,
  });

  const [facilities, setFacilities] = useState<string[]>(['']);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFacilityChange = (index: number, value: string) => {
    setFacilities(prev => prev.map((facility, i) => i === index ? value : facility));
  };

  const addFacility = () => {
    setFacilities(prev => [...prev, '']);
  };

  const handleSubmit = async () => {
    if (!form.name || !form.description) {
      setError('Title and description are required');
      return;
    }

    setLoading(true);
    setError(null);

    const submitData = {
      ...form,
      facilities_count: facilities.filter(f => f.trim()).length
    };

    try {
      await api.post('/rooms', submitData);
      nav('/rooms');
    } catch (err) {
      setError('Failed to create room');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">

      {/* Main Content */}
      <div className="ml-16 p-8">
        {/* Main Heading */}
        <h1 className="text-2xl font-normal text-gray-900 mb-4">Room details</h1>
        
        {/* Back to Rooms Link */}
        <button 
          onClick={() => nav('/rooms')}
          className="text-red-600 hover:text-red-700 text-sm font-medium mb-8"
        >
          &lt; back to rooms
        </button>
        
        <div className="grid grid-cols-3 gap-8">
          {/* Left Column - Form */}
          <div className="col-span-2">
            {/* Room Details Section */}
            <h2 className="text-lg font-medium text-gray-900 mb-6">Room details</h2>
            
            {/* Title field */}
            <div className="mb-4">
              <label className="block text-sm text-gray-600 mb-2">Title</label>
              <input
                name="name"
                type="text"
                value={form.name}
                onChange={handleChange}
                className="w-full p-3 bg-gray-100 border-0 text-gray-900"
                placeholder="Room title"
                required
              />
            </div>

            {/* Description field */}
            <div className="mb-4">
              <label className="block text-sm text-gray-600 mb-2">Description</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                className="w-full p-3 bg-gray-100 border-0 text-gray-900 h-20 resize-none"
                placeholder="Description..."
                required
              />
            </div>

            {/* Image Section */}
            <div className="mb-6">
              <label className="block text-sm text-gray-600 mb-2">Image</label>
              <div className="flex items-center gap-3">
                <img 
                  src="../../assets/plusIcon.png" 
                  alt="Add" 
                  className="w-6 h-6"
                />
                <button className="text-red-600 hover:text-red-700 text-sm font-medium">
                  ADD IMAGE
                </button>
              </div>
            </div>

            {/* Facilities Section */}
            <h2 className="text-lg font-medium text-gray-900 mb-4">Facilities</h2>
            
            {/* Facility fields */}
            {facilities.map((facility, index) => (
              <div key={index} className="mb-4">
                <label className="block text-sm text-gray-600 mb-2">Facility</label>
                <input
                  type="text"
                  value={facility}
                  onChange={(e) => handleFacilityChange(index, e.target.value)}
                  className="w-full p-3 bg-gray-100 border-0 text-gray-900"
                  placeholder="Facility detail..."
                />
              </div>
            ))}

            {/* Add Facility */}
            <div className="flex items-center gap-3 mb-8">
              <img 
                src="../../assets/plusIcon.png" 
                alt="Add" 
                className="w-6 h-6"
              />
              <button 
                onClick={addFacility}
                className="text-red-600 hover:text-red-700 text-sm font-medium"
              >
                ADD FACILITY
              </button>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-4 text-red-600 text-sm">{error}</div>
            )}

            {/* Create and Generate PDF button */}
            <div className="pt-4">
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="bg-red-600 text-white px-6 py-3 rounded hover:bg-red-700 transition-colors disabled:bg-red-400 uppercase font-medium"
              >
                {loading ? 'CREATING...' : 'CREATE AND GENERATE PDF'}
              </button>
            </div>
          </div>

          {/* Right Column - Dates */}
          <div className="col-span-1">
            <div className="bg-gray-200 p-6">
              <h3 className="font-medium text-gray-900 mb-4">Dates</h3>
              <div className="flex gap-8">
                <div>
                  <div className="text-gray-600 text-sm">Created</div>
                  <div className="text-gray-900">17/03/25</div>
                </div>
                <div>
                  <div className="text-gray-600 text-sm">Updated</div>
                  <div className="text-gray-900">-</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}