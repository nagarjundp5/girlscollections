'use client';

import React, { useState, useEffect } from 'react';
import { Bell, CheckCircle2, ShieldAlert, Sparkles } from 'lucide-react';
import { useToast } from '@/components/ToastContainer';

interface NotificationBellWidgetProps {
  className?: string;
  variant?: 'inline' | 'card' | 'badge';
}

export default function NotificationBellWidget({
  className = '',
  variant = 'inline',
}: NotificationBellWidgetProps) {
  const { addToast } = useToast();
  const [permission, setPermission] = useState<NotificationPermission | 'unsupported'>('default');
  const [isSubscribing, setIsSubscribing] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      setPermission('unsupported');
      return;
    }
    setPermission(Notification.permission);
  }, []);

  const handleEnableNotifications = async () => {
    if (permission === 'unsupported') {
      addToast('Push notifications are not supported in this browser.', 'error');
      return;
    }

    try {
      setIsSubscribing(true);
      const resPermission = await Notification.requestPermission();
      setPermission(resPermission);

      if (resPermission === 'granted') {
        if ('serviceWorker' in navigator) {
          const registration = await navigator.serviceWorker.register('/sw.js');
          await navigator.serviceWorker.ready;

          const rawKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
          if (rawKey) {
            const { urlBase64ToUint8Array } = await import('@/lib/vapid');
            const applicationServerKey = urlBase64ToUint8Array(rawKey);

            const subscription = await registration.pushManager.subscribe({
              userVisibleOnly: true,
              applicationServerKey,
            });

            await fetch('/api/push/subscribe', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                endpoint: subscription.endpoint,
                keys: {
                  p256dh: subscription.toJSON().keys?.p256dh,
                  auth: subscription.toJSON().keys?.auth,
                },
              }),
            });
          }
        }
        localStorage.setItem('push_alerts_subscribed', 'true');
        addToast('✨ Notifications enabled! You will receive drop & restock alerts.', 'success');
      } else if (resPermission === 'denied') {
        addToast('Notification permission blocked in browser settings.', 'info');
      }
    } catch (err: any) {
      console.error(err);
      addToast('Failed to enable notifications.', 'error');
    } finally {
      setIsSubscribing(false);
    }
  };

  if (permission === 'unsupported') {
    return null;
  }

  if (variant === 'badge') {
    return (
      <div className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-sans font-semibold tracking-wider uppercase ${className}`}>
        {permission === 'granted' && (
          <span className="border-emerald-500/30 bg-emerald-500/10 text-emerald-400 flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3" /> Notifications Active
          </span>
        )}
        {permission === 'default' && (
          <button
            onClick={handleEnableNotifications}
            disabled={isSubscribing}
            className="border-zariGold/40 bg-zariGold/10 text-zariGold hover:bg-zariGold hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
          >
            <Bell className="h-3 w-3" /> {isSubscribing ? 'Enabling...' : 'Enable Notifications'}
          </button>
        )}
        {permission === 'denied' && (
          <span className="border-zinc-700 bg-zinc-800 text-zinc-400 flex items-center gap-1">
            <ShieldAlert className="h-3 w-3 text-zinc-400" /> Notifications Blocked
          </span>
        )}
      </div>
    );
  }

  return (
    <div className={`p-4 rounded-2xl border border-zariGold/30 bg-gradient-to-r from-navy via-nearBlack to-inkNavy text-ivory shadow-lg ${className}`}>
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-zariGold/20 p-2.5 text-zariGold">
            <Bell className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-xs font-serif font-bold text-ivory tracking-wide flex items-center gap-1.5">
              Browser Drop Alerts
              {permission === 'granted' && (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-2 py-0.5 text-[9px] font-sans text-emerald-400">
                  <CheckCircle2 className="h-2.5 w-2.5" /> Enabled
                </span>
              )}
            </h4>
            <p className="text-[10.5px] font-sans text-ivory/70">
              {permission === 'granted'
                ? 'You will get instant alerts for restocks, sales & exclusive collection drops.'
                : permission === 'denied'
                ? 'Notifications are blocked in your browser address bar settings.'
                : 'Get instant push alerts on new releases & restocks.'}
            </p>
          </div>
        </div>

        {permission === 'default' && (
          <button
            type="button"
            onClick={handleEnableNotifications}
            disabled={isSubscribing}
            className="px-4 py-2 rounded-xl btn-gold-gradient text-xs font-bold uppercase tracking-wider text-black hover:opacity-90 transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
          >
            <Sparkles className="h-3.5 w-3.5" />
            {isSubscribing ? 'Enabling...' : 'Enable Alerts'}
          </button>
        )}

        {permission === 'granted' && (
          <span className="text-[10px] font-sans text-emerald-400 font-semibold uppercase tracking-widest border border-emerald-500/30 px-3 py-1 rounded-full bg-emerald-500/10">
            Active
          </span>
        )}

        {permission === 'denied' && (
          <span className="text-[10px] font-sans text-zinc-400 font-semibold uppercase tracking-widest border border-zinc-700 px-3 py-1 rounded-full bg-zinc-800">
            Blocked
          </span>
        )}
      </div>
    </div>
  );
}
