// src/components/RoomDetails.tsx
import React, { useState, useEffect, useRef, ChangeEvent } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import type { RoomRead, RoomUpdate } from '../types';
import Popup from './Popup';

export default function RoomDetails() {
  const { id } = useParams<{ id: string }>();
  const nav = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [room, setRoom] = useState<RoomRead | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeletePopup, setShowDeletePopup] = useState(false);

  // Form state for editing (if you allow edits)
  const [formData, setFormData] = useState<{
    name: string;
    description: string;
    capacity: number;
    image_url: string;
    facilities: string[];
  }>({
    name: '',
    description: '',
    capacity: 2,
    image_url: '',
    facilities: [],
  });

  // Load room on mount
  useEffect(() => {
    if (!id) return;
    api.get<RoomRead>(`/rooms/${id}`)
      .then(r => {
        setRoom(r.data);
        setFormData({
          name: r.data.name || '',
          description: r.data.description || '',
          capacity: r.data.capacity || 2,
          image_url: r.data.image_url || '',
          facilities: r.data.facilities || [],
        });
      })
      .catch(() => setError('Room not found'))
      .finally(() => setLoading(false));
  }, [id]);

  // Handlers for text fields (if you support editing here)
  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFacilityChange = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      facilities: prev.facilities.map((f, i) => (i === index ? value : f))
    }));
  };

  const addFacility = () => {
    setFormData(prev => ({ ...prev, facilities: [...prev.facilities, ''] }));
  };

  // Handle deleting
  const handleDelete = async () => {
    if (!id) return;
    try {
      await api.delete(`/rooms/${id}`);
      nav('/rooms');
    } catch {
      setError('Failed to delete room');
    }
  };

  // Download the PDF as a blob and trigger browser save
  const handleDownloadPdf = async () => {
    if (!id) return;
    try {
      const resp = await api.post(
        `/rooms/${id}/generate-pdf`,
        {},
        { responseType: 'blob' }
      );
      const blob = new Blob([resp.data], { type: 'application/pdf' });
      const url  = window.URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.href       = url;
      a.download   = `room_${id}_${room?.name.replace(/\s+/g, '_')}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      setError('Could not download PDF');
    }
  };

  // Show loading / error
  if (loading) return <div className="p-8 text-gray-600">Loading…</div>;
  if (error)   return <div className="p-8 text-red-600">{error}</div>;

  return (
    <div className="min-h-screen bg-white">


      {/* Main Content */}
      <div className="ml-16 p-8">
        <h1 className="text-2xl font-normal text-gray-900 mb-4">Room details</h1>
        <button
          onClick={() => nav('/rooms')}
          className="text-red-600 hover:text-red-700 text-sm font-medium mb-8"
        >
          &lt; back to rooms
        </button>

        <div className="grid grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-medium text-gray-900">Room details</h2>
              <button
                onClick={() => setShowDeletePopup(true)}
                className="flex items-center gap-2 text-red-600 hover:text-red-700 text-sm font-medium"
              >
                <img src="../../assets/deleteIcon.png" alt="Delete" className="w-4 h-4" />
                DELETE ROOM
              </button>
            </div>

            {/* Title */}
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

            {/* Description */}
            <div className="mb-4">
              <label className="block text-sm text-gray-600 mb-2">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="w-full p-3 bg-gray-100 border-0 text-gray-900 h-20 resize-none"
              />
            </div>

            {/* Image Preview */}
            <div className="mb-6">
              <label className="block text-sm text-gray-600 mb-2">Image</label>
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
                    src="/frontend/assets/plusIcon.png"
                    alt="Add"
                    className="w-6 h-6"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-red-600 hover:text-red-700 text-sm font-medium"
                  >
                    ADD IMAGE
                  </button>
                </div>
              )}
              {/* Hidden file input */}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                ref={fileInputRef}
                onChange={async (e: ChangeEvent<HTMLInputElement>) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  setLoading(true);
                  setError(null);
                  try {
                    const data = new FormData();
                    data.append('image', file);
                    const resp = await api.post<{ tempImageUrl: string }>(
                      '/upload/temp-room-image',
                      data,
                      { headers: { 'Content-Type': 'multipart/form-data' } }
                    );
                    setFormData(prev => ({ ...prev, image_url: resp.data.tempImageUrl }));
                  } catch {
                    setError('Failed to upload image');
                  } finally {
                    setLoading(false);
                    e.target.value = '';
                  }
                }}
              />
            </div>

            {/* Facilities */}
            <h2 className="text-lg font-medium text-gray-900 mb-4">Facilities</h2>
            {formData.facilities.map((f, idx) => (
              <div key={idx} className="mb-4">
                <label className="block text-sm text-gray-600 mb-2">Facility</label>
                <input
                  type="text"
                  value={f}
                  onChange={e => handleFacilityChange(idx, e.target.value)}
                  className="w-full p-3 bg-gray-100 border-0 text-gray-900"
                  placeholder="Facility detail..."
                />
              </div>
            ))}
            <div className="flex items-center gap-3 mb-8">
              <img src="../../assets/plusIcon.png" alt="Add" className="w-6 h-6" />
              <button
                onClick={addFacility}
                className="text-red-600 hover:text-red-700 text-sm font-medium"
              >
                ADD FACILITY
              </button>
            </div>

            {/* Error */}
            {error && <div className="mb-4 text-red-600 text-sm">{error}</div>}

            {/* SAVE & GENERATE PDF (edits + PDF) */}
            <div className="pt-4">
              <button
                onClick={async () => {
                  setLoading(true);
                  setError(null);
                  try {
                    const updateData: RoomUpdate = {
                      name: formData.name,
                      description: formData.description,
                      facilities_count: formData.facilities.filter(x => x.trim()).length,
                      image_url: formData.image_url,
                    };
                    await api.patch(`/rooms/${id}`, updateData);
                    await api.post(`/rooms/${id}/generate-pdf`);
                    nav('/rooms');
                  } catch {
                    setError('Failed to save room');
                  } finally {
                    setLoading(false);
                  }
                }}
                disabled={loading}
                className="bg-red-600 text-white px-6 py-3 rounded hover:bg-red-700 transition-colors disabled:bg-red-400 uppercase font-medium"
              >
                {loading ? 'SAVING...' : 'SAVE AND GENERATE PDF'}
              </button>
            </div>
          </div>

          {/* Right Column */}
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

            {/* DOWNLOAD PDF */}
            <button
              onClick={handleDownloadPdf}
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

      {/* DELETE POPUP */}
      {showDeletePopup && (
        <Popup
          title="Are you sure?"
          message="You are deleting a room..."
          onConfirm={handleDelete}
          onCancel={() => setShowDeletePopup(false)}
        />
      )}
    </div>
  );
}
