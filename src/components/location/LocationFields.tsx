'use client';

import React, { useEffect } from 'react';
import { MapPin, Loader2, Navigation, AlertCircle } from 'lucide-react';
import { useLocationAutofill, LocationData } from '@/hooks/useLocationAutofill';

export interface LocationValues {
  pincode: string;
  area?: string;
  city: string;
  state: string;
  source?: 'geolocation' | 'manual';
}

interface LocationFieldsProps {
  values: LocationValues;
  onChange: (updated: Partial<LocationValues>) => void;
  showDetectButton?: boolean;
  className?: string;
}

export default function LocationFields({
  values,
  onChange,
  showDetectButton = true,
  className = '',
}: LocationFieldsProps) {
  const {
    detectLocation,
    lookupPincode,
    detecting,
    lookingUpPin,
    availableAreas,
    errorMsg,
    setErrorMsg,
  } = useLocationAutofill();

  const handleDetectClick = async () => {
    const loc = await detectLocation();
    if (loc) {
      onChange({
        pincode: loc.pincode || values.pincode,
        area: loc.area || values.area,
        city: loc.city || values.city,
        state: loc.state || values.state,
        source: 'geolocation',
      });
    }
  };

  const handlePincodeChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawPin = e.target.value.replace(/\D/g, '').slice(0, 6);
    onChange({ pincode: rawPin, source: 'manual' });

    if (rawPin.length === 6) {
      const pinResult = await lookupPincode(rawPin);
      if (pinResult) {
        onChange({
          city: pinResult.city || values.city,
          state: pinResult.state || values.state,
          area: pinResult.area || values.area,
          source: 'manual',
        });
      }
    }
  };

  return (
    <div className={`space-y-4 font-sans ${className}`}>
      {showDetectButton && (
        <div className="space-y-1.5">
          <button
            type="button"
            onClick={handleDetectClick}
            disabled={detecting}
            className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-[#D4AF37]/50 bg-[#FDFBF7] text-[#0F172A] text-xs font-semibold hover:bg-[#F8F5EE] transition-all disabled:opacity-50"
          >
            {detecting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-[#D4AF37]" />
                Detecting current location…
              </>
            ) : (
              <>
                <Navigation className="w-4 h-4 text-[#D4AF37]" />
                Use my current location
              </>
            )}
          </button>
          <p className="text-[10px] text-gray-400 text-center">
            Used only to fill your delivery area • No coordinates stored
          </p>
        </div>
      )}

      {errorMsg && (
        <div className="flex items-start gap-2 p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {/* Pincode */}
        <div className="space-y-1">
          <label className="text-[11px] font-mono uppercase tracking-wider text-gray-700 font-bold block">
            PIN Code *
          </label>
          <div className="relative">
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              placeholder="e.g. 560064"
              value={values.pincode}
              onChange={handlePincodeChange}
              className="w-full bg-[#FDFBF7] border border-gray-200 text-[#0F172A] px-3.5 py-2.5 text-xs rounded-xl focus:outline-none focus:border-[#D4AF37]"
              required
            />
            {lookingUpPin && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <Loader2 className="w-3.5 h-3.5 text-gray-400 animate-spin" />
              </div>
            )}
          </div>
        </div>

        {/* Area */}
        <div className="space-y-1">
          <label className="text-[11px] font-mono uppercase tracking-wider text-gray-700 font-bold block">
            Area / Locality
          </label>
          {availableAreas.length > 0 ? (
            <select
              value={values.area || ''}
              onChange={(e) => onChange({ area: e.target.value })}
              className="w-full bg-[#FDFBF7] border border-gray-200 text-[#0F172A] px-3 py-2.5 text-xs rounded-xl focus:outline-none focus:border-[#D4AF37]"
            >
              <option value="">Select Area</option>
              {availableAreas.map((area, idx) => (
                <option key={idx} value={area}>
                  {area}
                </option>
              ))}
            </select>
          ) : (
            <input
              type="text"
              placeholder="e.g. Yelahanka New Town"
              value={values.area || ''}
              onChange={(e) => onChange({ area: e.target.value })}
              className="w-full bg-[#FDFBF7] border border-gray-200 text-[#0F172A] px-3.5 py-2.5 text-xs rounded-xl focus:outline-none focus:border-[#D4AF37]"
            />
          )}
        </div>

        {/* City */}
        <div className="space-y-1">
          <label className="text-[11px] font-mono uppercase tracking-wider text-gray-700 font-bold block">
            City / District *
          </label>
          <input
            type="text"
            placeholder="e.g. Bengaluru"
            value={values.city}
            onChange={(e) => onChange({ city: e.target.value })}
            className="w-full bg-[#FDFBF7] border border-gray-200 text-[#0F172A] px-3.5 py-2.5 text-xs rounded-xl focus:outline-none focus:border-[#D4AF37]"
            required
          />
        </div>

        {/* State */}
        <div className="space-y-1">
          <label className="text-[11px] font-mono uppercase tracking-wider text-gray-700 font-bold block">
            State *
          </label>
          <input
            type="text"
            placeholder="e.g. Karnataka"
            value={values.state}
            onChange={(e) => onChange({ state: e.target.value })}
            className="w-full bg-[#FDFBF7] border border-gray-200 text-[#0F172A] px-3.5 py-2.5 text-xs rounded-xl focus:outline-none focus:border-[#D4AF37]"
            required
          />
        </div>
      </div>
    </div>
  );
}

