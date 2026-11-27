'use client';

import React, { useEffect, useState } from 'react';
import { Bell, PackageCheck, Sparkles } from 'lucide-react';
import { subscribeUserToPush } from '@/lib/pushClient';

export function NotificationPreferencesCard() {
  const [topicOrders, setTopicOrders] = useState(true);
  const [topicOffers, setTopicOffers] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('/api/user/notifications')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data) {
          setTopicOrders(data.topicOrders !== false);
          setTopicOffers(data.topicOffers !== false);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const updatePref = async (nextOrders: boolean, nextOffers: boolean) => {
    setTopicOrders(nextOrders);
    setTopicOffers(nextOffers);
    setSaving(true);
    try {
      if (nextOrders || nextOffers) {
        await subscribeUserToPush({ topicOrders: nextOrders, topicOffers: nextOffers });
      }
      await fetch('/api/user/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topicOrders: nextOrders, topicOffers: nextOffers }),
      });
    } catch {
      // Ignore transient error
    } finally {
      setSaving(false);
    }
  };

  if (loading) return null;

  return (
    <div className="bg-white border border-[#EADFD6] rounded-2xl p-5 sm:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-full bg-[#F6E4E4] text-[#D94F7E] flex items-center justify-center">
            <Bell className="w-4 h-4" />
          </div>
          <div>
            <h2 className="font-serif font-semibold text-base sm:text-lg text-[#1A1E3A]">
              Notification Preferences
            </h2>
            <p className="text-xs text-[#6B6F85]">
              Control what updates you receive on this device and by email
            </p>
          </div>
        </div>
        {saving && <span className="text-[11px] text-[#6B6F85]">Saving...</span>}
      </div>

      <div className="divide-y divide-[#EADFD6]">
        {/* Order Updates */}
        <div className="py-3.5 flex items-center justify-between gap-4">
          <div className="flex items-start gap-2.5">
            <PackageCheck className="w-4 h-4 text-[#2E8B6A] mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-[#1A1E3A]">Order updates</p>
              <p className="text-xs text-[#6B6F85]">
                Order confirmation, shipping AWB, out for delivery & refunds
              </p>
            </div>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={topicOrders}
            onClick={() => updatePref(!topicOrders, topicOffers)}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ${
              topicOrders ? 'bg-[#D94F7E]' : 'bg-gray-200'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow transition duration-200 ${
                topicOrders ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Offers & New Arrivals */}
        <div className="py-3.5 flex items-center justify-between gap-4">
          <div className="flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-[#B8964F] mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-[#1A1E3A]">Offers and new arrivals</p>
              <p className="text-xs text-[#6B6F85]">
                Festive edits, restocks, bag reminders & exclusive discounts
              </p>
            </div>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={topicOffers}
            onClick={() => updatePref(topicOrders, !topicOffers)}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ${
              topicOffers ? 'bg-[#D94F7E]' : 'bg-gray-200'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow transition duration-200 ${
                topicOffers ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  );
}
