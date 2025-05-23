import React, { useState, useRef, ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import type { RoomCreate } from '../types';

export default function RoomForm() {
  const nav = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form loading / error state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Main form data
  const [form, setForm] = useState<RoomCreate>({
    name: '',
    description: '',
    capacity: 2,
    image_url: '',
    facilities_count: 0,
  });

  // Dynamic list of facilities
  const [facilities, setFacilities] = useState<string[]>(['']);

  // Text inputs (name, description, capacity) handler
  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  // Single facility edit
  const handleFacilityChange = (index: number, value: string) => {
    setFacilities(prev =>
      prev.map((f, i) => (i === index ? value : f))
    );
  };

  // Add a blank facility row
  const addFacility = () => {
    setFacilities(prev => [...prev, '']);
  };

  // Trigger the hidden file input
  const handleAddImageClick = () => {
    fileInputRef.current?.click();
  };

  // Upload to temp folder and store returned URL
  const handleImageUpload = async (
    e: ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError(null);

    try {
      const data = new FormData();
      data.append('image', file);

      // Hit your FastAPI temp‐upload endpoint
      const resp = await api.post<{ tempImageUrl: string }>(
        'api/upload/temp-room-image',
        data,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );

      // Preview via the URL returned
      setForm(prev => ({
        ...prev,
        image_url: resp.data.tempImageUrl,
      }));
    } catch {
      setError('Failed to upload image');
    } finally {
      setLoading(false);
      // Clear input so same file can be reselected
      e.target.value = '';
    }
  };

  // Create room, then finalize image if it was uploaded to temp
  const handleSubmit = async () => {
    if (!form.name || !form.description) {
      setError('Title and description are required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // 1) Create the DB record
      const submitData = {
        ...form,
        facilities_count: facilities.filter(f => f.trim()).length,
      };
      const { data: created } = await api.post<{ id: number }>('/rooms', submitData);

      // 2) If image came from temp, move it to permanent
      if (form.image_url.includes('/uploads/rooms/temp/')) {
        await api.post(
          `api/rooms/${created.id}/finalize-image`,
          { tempImageUrl: form.image_url }
        );
      }

      // 3) Navigate away on success
      nav('/rooms');
    } catch {
      setError('Failed to create room');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* hidden file input */}
      <input
        type="file"
        accept="image/*"
        className="hidden"
        ref={fileInputRef}
        onChange={handleImageUpload}
      />

      <div className="ml-16 p-8">
        <h1 className="text-2xl font-normal text-gray-900 mb-4">
          Room details
        </h1>
        <button
          onClick={() => nav('/rooms')}
          className="text-red-600 hover:text-red-700 text-sm font-medium mb-8"
        >
          &lt; back to rooms
        </button>

        <div className="grid grid-cols-3 gap-8">
          {/* === Left Column === */}
          <div className="col-span-2">
            <h2 className="text-lg font-medium text-gray-900 mb-6">
              Room details
            </h2>

            {/* Title */}
            <div className="mb-4">
              <label className="block text-sm text-gray-600 mb-2">
                Title
              </label>
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

            {/* Description */}
            <div className="mb-4">
              <label className="block text-sm text-gray-600 mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                className="w-full p-3 bg-gray-100 border-0 text-gray-900 h-20 resize-none"
                placeholder="Description..."
                required
              />
            </div>

            {/* Image upload & preview */}
            <div className="mb-6">
              <label className="block text-sm text-gray-600 mb-2">
                Image
              </label>

              {form.image_url ? (
                <div className="mb-3">
                  <img
                    src={`http://localhost:8000${form.image_url}`}
                    alt="Room preview"
                    className="w-48 h-32 object-cover border border-gray-200 rounded"
                  />
                  <div className="flex items-center gap-3 mt-3">
                    <img
                      src="../../assets/plusIcon.png"
                      alt="Add"
                      className="w-6 h-6"
                    />
                    <button
                      type="button"
                      onClick={handleAddImageClick}
                      className="text-red-600 hover:text-red-700 text-sm font-medium"
                    >
                      CHANGE IMAGE
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <img
                    src="../../assets/plusIcon.png"
                    alt="Add"
                    className="w-6 h-6"
                  />
                  <button
                    type="button"
                    onClick={handleAddImageClick}
                    className="text-red-600 hover:text-red-700 text-sm font-medium"
                  >
                    ADD IMAGE
                  </button>
                </div>
              )}
            </div>

            {/* Facilities list */}
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Facilities
            </h2>
            {facilities.map((facility, idx) => (
              <div key={idx} className="mb-4">
                <label className="block text-sm text-gray-600 mb-2">
                  Facility
                </label>
                <input
                  type="text"
                  value={facility}
                  onChange={e =>
                    handleFacilityChange(idx, e.target.value)
                  }
                  className="w-full p-3 bg-gray-100 border-0 text-gray-900"
                  placeholder="Facility detail..."
                />
              </div>
            ))}
            <div className="flex items-center gap-3 mb-8">
              <img
                src="../../assets/plusIcon.png"
                alt="Add"
                className="w-6 h-6"
              />
              <button
                type="button"
                onClick={addFacility}
                className="text-red-600 hover:text-red-700 text-sm font-medium"
              >
                ADD FACILITY
              </button>
            </div>

            {/* Error */}
            {error && (
              <div className="mb-4 text-red-600 text-sm">{error}</div>
            )}

            {/* Submit */}
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

          {/* === Right Column (Dates) === */}
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
