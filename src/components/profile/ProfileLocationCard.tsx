'use client';

import React, { useState, useEffect } from 'react';
import { MapPin, Navigation, Edit2, Trash2, Check, Loader2, Sparkles } from 'lucide-react';
import LocationFields, { LocationValues } from '@/components/location/LocationFields';
import { useToast } from '@/components/ToastContainer';

export default function ProfileLocationCard() {
  const { addToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const [savedLocation, setSavedLocation] = useState<LocationValues | null>(null);
  const [formData, setFormData] = useState<LocationValues>({
    pincode: '',
    area: '',
    city: '',
    state: '',
    source: 'manual',
  });

  const fetchLocation = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/user/location');
      const data = await res.json();
      if (res.ok && data.location) {
        setSavedLocation(data.location);
        setFormData(data.location);
      } else {
        setSavedLocation(null);
      }
    } catch {
      // Failed to load
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLocation();
  }, []);

  const handleSave = async () => {
    if (!formData.pincode || formData.pincode.length !== 6) {
      addToast('Please enter a valid 6-digit PIN code', 'error');
      return;
    }
    if (!formData.city || !formData.state) {
      addToast('City and state are required', 'error');
      return;
    }

    setSaving(true);
    try {
      const res = await fetch('/api/user/location', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        addToast('Delivery location saved successfully! ✓', 'success');
        setSavedLocation(formData);
        setIsEditing(false);
      } else {
        addToast(data.error || 'Failed to save location', 'error');
      }
    } catch {
      addToast('Error saving location', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleClear = async () => {
    setClearing(true);
    try {
      const res = await fetch('/api/user/location', { method: 'DELETE' });
      if (res.ok) {
        addToast('Saved location cleared', 'success');
        setSavedLocation(null);
        setFormData({ pincode: '', area: '', city: '', state: '', source: 'manual' });
        setIsEditing(false);
      } else {
        addToast('Failed to clear location', 'error');
      }
    } catch {
      addToast('Error clearing location', 'error');
    } finally {
      setClearing(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-6 flex items-center justify-center min-h-[140px]">
        <Loader2 className="w-6 h-6 text-[#0F172A] animate-spin" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-4">
      <div className="flex items-center justify-between border-b border-gray-100 pb-3">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-[#D4AF37]" />
          <h3 className="text-sm font-semibold text-gray-900">Default Delivery Location</h3>
        </div>
        {savedLocation && !isEditing && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsEditing(true)}
              className="text-xs text-[#0F172A] font-medium hover:text-[#D4AF37] flex items-center gap-1 transition-colors"
            >
              <Edit2 className="w-3.5 h-3.5" /> Edit
            </button>
            <button
              onClick={handleClear}
              disabled={clearing}
              className="text-xs text-red-600 font-medium hover:text-red-700 flex items-center gap-1 transition-colors ml-2 disabled:opacity-50"
            >
              {clearing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
              Clear
            </button>
          </div>
        )}
      </div>

      {!isEditing && savedLocation ? (
        <div className="space-y-1 text-xs text-gray-600">
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm font-bold text-gray-900">{savedLocation.pincode}</span>
            {savedLocation.source === 'geolocation' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] bg-emerald-50 text-emerald-700 font-medium border border-emerald-200">
                <Navigation className="w-3 h-3" /> Auto-detected
              </span>
            )}
          </div>
          {savedLocation.area && <p className="text-gray-700">{savedLocation.area}</p>}
          <p className="text-gray-500">
            {savedLocation.city}, {savedLocation.state}
          </p>
        </div>
      ) : (
        <div className="space-y-4 pt-1">
          <LocationFields
            values={formData}
            onChange={(updated) => setFormData((prev) => ({ ...prev, ...updated }))}
            showDetectButton={true}
          />
          <div className="flex justify-end gap-2 pt-2">
            {savedLocation && (
              <button
                type="button"
                onClick={() => {
                  setFormData(savedLocation);
                  setIsEditing(false);
                }}
                disabled={saving}
                className="px-3.5 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
            )}
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 text-xs font-semibold text-white bg-[#0F172A] rounded-xl hover:bg-black transition-colors flex items-center gap-1.5 disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
              Save Location
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

