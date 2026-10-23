'use client';

import React, { useEffect, useState } from 'react';
import { toast, ToastMessage } from '../lib/toast';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';
import Image from 'next/image';

export const useToast = () => {
  return {
    addToast: (message: string, type: ToastMessage['type'] = 'success') => toast.show(message, type),
  };
};

export default function ToastContainer() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    return toast.subscribe((newToasts) => {
      setToasts(newToasts);
    });
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-24 md:bottom-6 right-4 left-4 md:left-auto z-50 flex flex-col gap-2 max-w-sm w-auto md:w-full">
      {toasts.map((t) => {
        const handleDismiss = () => {
          setToasts((prev) => prev.filter((item) => item.id !== t.id));
        };

        // Custom Product Add-to-Cart toast
        if (t.productImage && t.productName) {
          return (
            <div
              key={t.id}
              className="bg-navy border border-roseGold/30 p-3.5 shadow-2xl relative flex items-center gap-3.5 text-ivory w-full rounded-xl animate-in slide-in-from-bottom-5 md:slide-in-from-right-5 duration-300"
            >
              {/* Product Thumbnail */}
              <div className="relative w-12 h-16 bg-navy-dark shrink-0 rounded-md overflow-hidden border border-roseGold/20">
                <Image
                  src={t.productImage}
                  alt={t.productName}
                  fill
                  sizes="48px"
                  className="object-cover"
                />
              </div>

              {/* Toast Details */}
              <div className="flex-1 min-w-0 flex flex-col justify-between h-14 py-0.5">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] tracking-[0.2em] text-roseGold font-bold uppercase font-sans">
                    Added to Bag
                  </span>
                  <div className="relative w-7 h-7 shrink-0">
                    <Image
                      src="/logo.png"
                      alt="The Girls Collection"
                      fill
                      sizes="28px"
                      className="object-contain"
                    />
                  </div>
                </div>
                <h4 className="text-xs font-serif font-bold text-ivory truncate leading-normal">
                  {t.productName}
                </h4>
              </div>

              {/* Close Button */}
              <button
                onClick={handleDismiss}
                className="text-ivory/70 hover:text-ivory transition-colors self-start p-1"
                aria-label="Dismiss"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        }

        // Standard Alert Styling
        const bgColor = 'bg-navy';
        let borderColor = 'border-roseGold/30';
        let Icon = Info;
        let iconColor = 'text-roseGold';

        if (t.type === 'success') {
          borderColor = 'border-emerald-500/30';
          Icon = CheckCircle;
          iconColor = 'text-emerald-400';
        } else if (t.type === 'error') {
          borderColor = 'border-mutedMauve/50';
          Icon = AlertCircle;
          iconColor = 'text-mutedMauve';
        }

        return (
          <div
            key={t.id}
            className={`flex items-center justify-between p-4 shadow-2xl border ${bgColor} ${borderColor} text-ivory rounded-xl animate-in slide-in-from-bottom-5 md:slide-in-from-right-5 duration-300`}
          >
            <div className="flex items-center gap-3">
              <Icon className={`w-4 h-4 ${iconColor}`} />
              <p className="text-xs font-medium text-ivory font-sans leading-normal">{t.message}</p>
            </div>
            <button
              onClick={handleDismiss}
              className="text-ivory/70 hover:text-ivory transition-colors ml-4"
              aria-label="Dismiss"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
