'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, Loader2, ArrowRight, ShieldCheck, Check } from 'lucide-react';
import LocationFields, { LocationValues } from '@/components/location/LocationFields';
import { useToast } from '@/components/ToastContainer';

export default function OnboardingPage() {
  const router = useRouter();
  const { addToast } = useToast();

  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [line1, setLine1] = useState('');
  const [line2, setLine2] = useState('');

  const [location, setLocation] = useState<LocationValues>({
    pincode: '',
    area: '',
    city: '',
    state: '',
    source: 'manual',
  });

  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim() || name.trim().length < 2) {
      setError('Please enter your full name (at least 2 characters)');
      return;
    }

    if (!/^\d{6}$/.test(location.pincode)) {
      setError('Please provide a valid 6-digit Indian PIN code');
      return;
    }

    if (!location.city.trim() || !location.state.trim()) {
      setError('City and State are required');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/user/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim() || undefined,
          pincode: location.pincode.trim(),
          city: location.city.trim(),
          state: location.state.trim(),
          area: location.area?.trim() || undefined,
          line1: line1.trim() || undefined,
          line2: line2.trim() || undefined,
          locationSource: location.source || 'manual',
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to complete profile');
      }

      addToast('Profile setup complete! Welcome to The Girls Collections ✨', 'success');

      const returnTo = sessionStorage.getItem('tgc_auth_return_to') || '/';
      sessionStorage.removeItem('tgc_auth_return_to');
      window.location.href = returnTo;
    } catch (err: any) {
      setError(err?.message || 'Error saving details');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-lg bg-white border border-[#D4AF37]/30 rounded-3xl p-6 sm:p-8 shadow-xl">
        {/* Header Badge */}
        <div className="flex items-center justify-between mb-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#D4AF37] text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            Quick Welcome Setup
          </div>
          <span className="text-xs text-gray-400 font-mono">1 of 1</span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-serif text-[#0F172A] font-bold tracking-tight mb-2">
          Welcome to The Girls Collections
        </h1>
        <p className="text-xs text-gray-500 mb-6 leading-relaxed">
          Tell us your name and delivery area so we can customize your couture shopping experience and delivery estimates.
        </p>

        {error && (
          <div className="p-3 mb-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 font-sans">
          {/* Full Name */}
          <div className="space-y-1">
            <label className="text-[11px] font-mono uppercase tracking-wider text-gray-700 font-bold block">
              Full Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Nagarjun D P"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[#FDFBF7] border border-gray-200 text-[#0F172A] px-4 py-2.5 text-xs rounded-xl focus:outline-none focus:border-[#D4AF37]"
            />
          </div>

          {/* Email (Optional) */}
          <div className="space-y-1">
            <label className="text-[11px] font-mono uppercase tracking-wider text-gray-700 font-bold block">
              Email Address <span className="text-gray-400 normal-case font-normal">(Optional, for invoices)</span>
            </label>
            <input
              type="email"
              placeholder="e.g. user@domain.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#FDFBF7] border border-gray-200 text-[#0F172A] px-4 py-2.5 text-xs rounded-xl focus:outline-none focus:border-[#D4AF37]"
            />
          </div>

          {/* Delivery Area Section */}
          <div className="pt-2">
            <label className="text-[11px] font-mono uppercase tracking-wider text-[#0F172A] font-bold block mb-2">
              Delivery Location *
            </label>
            <LocationFields
              values={location}
              onChange={(updated) => setLocation((prev) => ({ ...prev, ...updated }))}
            />
          </div>

          {/* Optional Street Address */}
          <div className="space-y-3 pt-2">
            <label className="text-[11px] font-mono uppercase tracking-wider text-gray-700 font-bold block">
              Street Address <span className="text-gray-400 normal-case font-normal">(Optional, can be added at checkout)</span>
            </label>
            <input
              type="text"
              placeholder="House / Flat / Building / Street (Optional)"
              value={line1}
              onChange={(e) => setLine1(e.target.value)}
              className="w-full bg-[#FDFBF7] border border-gray-200 text-[#0F172A] px-4 py-2.5 text-xs rounded-xl focus:outline-none focus:border-[#D4AF37]"
            />
            <input
              type="text"
              placeholder="Landmark / Apartment / Floor (Optional)"
              value={line2}
              onChange={(e) => setLine2(e.target.value)}
              className="w-full bg-[#FDFBF7] border border-gray-200 text-[#0F172A] px-4 py-2.5 text-xs rounded-xl focus:outline-none focus:border-[#D4AF37]"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-6 py-3.5 px-6 rounded-xl bg-[#0F172A] text-white font-semibold text-xs uppercase tracking-wider hover:bg-black transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-[#D4AF37]" />
                Completing Setup…
              </>
            ) : (
              <>
                Save &amp; Continue Shopping
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

