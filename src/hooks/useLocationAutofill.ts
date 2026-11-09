'use client';

import { useState, useCallback } from 'react';

export interface LocationData {
  pincode: string;
  area: string;
  city: string;
  state: string;
  source: 'geolocation' | 'manual';
}

export function useLocationAutofill() {
  const [detecting, setDetecting] = useState(false);
  const [lookingUpPin, setLookingUpPin] = useState(false);
  const [availableAreas, setAvailableAreas] = useState<string[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Pincode -> Area / City / State lookup
  const lookupPincode = useCallback(async (pin: string): Promise<Partial<LocationData> | null> => {
    if (!/^\d{6}$/.test(pin)) return null;

    setLookingUpPin(true);
    setErrorMsg(null);
    try {
      const res = await fetch(`/api/location/pincode?pincode=${pin}`);
      const data = await res.json();
      if (res.ok && data.success) {
        setAvailableAreas(data.areas || []);
        return {
          pincode: pin,
          city: data.city,
          state: data.state,
          area: data.areas?.[0] || '',
          source: 'manual',
        };
      } else {
        setAvailableAreas([]);
        setErrorMsg(data.error || 'Pincode not found');
        return null;
      }
    } catch {
      setErrorMsg('Pincode lookup timed out');
      return null;
    } finally {
      setLookingUpPin(false);
    }
  }, []);

  // Consent-based Geolocation Detection
  const detectLocation = useCallback(async (): Promise<LocationData | null> => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      setErrorMsg('Geolocation is not supported by your browser');
      return null;
    }

    setDetecting(true);
    setErrorMsg(null);

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            const res = await fetch('/api/location/reverse', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ lat: latitude, lng: longitude }),
            });

            const data = await res.json();
            if (res.ok && data.success && data.location) {
              const loc = data.location;
              if (loc.pincode) {
                // Secondary pass to fetch all postal areas for this pincode
                const pinData = await lookupPincode(loc.pincode);
                resolve({
                  pincode: loc.pincode,
                  area: loc.area || pinData?.area || '',
                  city: loc.city || pinData?.city || '',
                  state: loc.state || pinData?.state || '',
                  source: 'geolocation',
                });
              } else {
                resolve({
                  pincode: '',
                  area: loc.area || '',
                  city: loc.city || '',
                  state: loc.state || '',
                  source: 'geolocation',
                });
              }
            } else {
              setErrorMsg(data.error || 'Could not determine location from GPS coordinates');
              resolve(null);
            }
          } catch {
            setErrorMsg('Location reverse geocoding failed');
            resolve(null);
          } finally {
            setDetecting(false);
          }
        },
        (geoError) => {
          setDetecting(false);
          if (geoError.code === geoError.PERMISSION_DENIED) {
            setErrorMsg('Location access was denied. You can enter your 6-digit PIN code manually below.');
          } else if (geoError.code === geoError.TIMEOUT) {
            setErrorMsg('Location request timed out. Please enter your PIN code manually.');
          } else {
            setErrorMsg('Unable to retrieve location. Please enter your PIN code manually.');
          }
          resolve(null);
        },
        { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 }
      );
    });
  }, [lookupPincode]);

  return {
    detectLocation,
    lookupPincode,
    detecting,
    lookingUpPin,
    availableAreas,
    errorMsg,
    setErrorMsg,
  };
}

