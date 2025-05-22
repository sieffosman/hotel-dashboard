import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import type { RoomRead, RoomUpdate } from '../types';

export default function RoomDetails() {
  const { id } = useParams<{ id: string }>();
  const nav = useNavigate();
  const [room, setRoom] = useState<RoomRead | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    facilities: ['King sized bed', 'Air conditioning', 'Sitting area'],
    capacity: 2,
    image_url: ''
  });

  useEffect(() => {
    if (!id) return;
    api.get<RoomRead>(`/rooms/${id}`)
      .then(r => {
        setRoom(r.data);
        setFormData({
          name: r.data.name || '',
          description: r.data.description || '',
          facilities: ['King sized bed', 'Air conditioning', 'Sitting area'], // Always start with default facilities
          capacity: r.data.capacity || 2,
          image_url: r.data.image_url || ''
        });
      })
      .catch(err => {
        console.log('Error loading room:', err);
        setError('Room not found');
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleSave = async () => {
    if (!id) return;
    try {
      const updateData: RoomUpdate = {
        name: formData.name,
        description: formData.description,
        facilities_count: formData.facilities.filter(f => f.trim()).length,
        image_url: formData.image_url
      };
      
      await api.patch(`/rooms/${id}`, updateData);
      
      // Generate PDF
      try {
        await api.post(`/rooms/${id}/generate-pdf`);
      } catch (pdfError) {
        console.log('PDF generation failed:', pdfError);
      }
      
      nav('/rooms');
    } catch (err) {
      console.log('Failed to save room:', err);
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    try {
      await api.delete(`/rooms/${id}`);
      nav('/rooms');
    } catch (err) {
      setError('Failed to delete room');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFacilityChange = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      facilities: prev.facilities.map((facility, i) => i === index ? value : facility)
    }));
  };

  const addFacility = () => {
    setFormData(prev => ({
      ...prev,
      facilities: [...prev.facilities, '']
    }));
  };

  if (loading) return <div className="p-8 text-gray-600">Loading…</div>;

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
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-medium text-gray-900">Room details</h2>
              <div className="flex items-center gap-2">
                <img 
                  src="../../assets/deleteIcon.png" 
                  alt="Delete" 
                  className="w-4 h-4"
                />
                <button 
                  onClick={() => setShowDeletePopup(true)}
                  className="text-red-600 hover:text-red-700 text-sm font-medium"
                >
                  DELETE ROOM
                </button>
              </div>
            </div>
            
            {/* Title field */}
            <div className="mb-4">
              <label className="block text-sm text-gray-600 mb-2">Title</label>
              <input
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                className="w-full p-3 bg-gray-100 border-0 text-gray-900"
              />
            </div>

            {/* Description field */}
            <div className="mb-4">
              <label className="block text-sm text-gray-600 mb-2">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="w-full p-3 bg-gray-100 border-0 text-gray-900 h-20 resize-none"
              />
            </div>

            {/* Image Section */}
            <div className="mb-6">
              <label className="block text-sm text-gray-600 mb-2">Image</label>
              
              {/* Show existing image if available */}
              {formData.image_url ? (
                <div className="mb-3">
                  <img 
                    src={`http://localhost:8000${formData.image_url}`} 
                    alt="Room preview"
                    className="w-48 h-32 object-cover border border-gray-200 rounded"
                  />
                </div>
              ) : (
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
              )}
            </div>

            {/* Facilities Section */}
            <h2 className="text-lg font-medium text-gray-900 mb-4">Facilities</h2>
            
            {/* Facility fields */}
            {formData.facilities.map((facility, index) => (
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

            {/* Save and Generate PDF button */}
            <div className="pt-4">
              <button
                onClick={handleSave}
                disabled={loading}
                className="bg-red-600 text-white px-6 py-3 rounded hover:bg-red-700 transition-colors disabled:bg-red-400 uppercase font-medium"
              >
                {loading ? 'SAVING...' : 'SAVE AND GENERATE PDF'}
              </button>
            </div>
          </div>

          {/* Right Column - Dates */}
          <div className="col-span-1">
            <div className="bg-gray-200 p-6 mb-4">
              <h3 className="font-medium text-gray-900 mb-4">Dates</h3>
              <div className="flex gap-8">
                <div>
                  <div className="text-gray-600 text-sm">Created</div>
                  <div className="text-gray-900">{room?.created_at || '-'}</div>
                </div>
                <div>
                  <div className="text-gray-600 text-sm">Updated</div>
                  <div className="text-gray-900">{room?.updated_at || '-'}</div>
                </div>
              </div>
            </div>
            
            {/* Download PDF Button */}
            <button 
              onClick={() => api.post(`/rooms/${id}/generate-pdf`)}
              className="w-full bg-red-600 text-white px-4 py-3 rounded hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
            >
              DOWNLOAD PDF
              <img 
                src="../../assets/downloadIcon.png" 
                alt="Download" 
                className="w-4 h-4"
              />
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Popup - You'll need to create this component */}
      {showDeletePopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-lg font-medium mb-4">Are you sure?</h3>
            <p className="text-gray-600 mb-6">You are deleting a room...</p>
            <div className="flex gap-4">
              <button
                onClick={handleDelete}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
              >
                Yes, Delete
              </button>
              <button
                onClick={() => setShowDeletePopup(false)}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}