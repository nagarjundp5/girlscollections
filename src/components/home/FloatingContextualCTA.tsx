'use client';

import React, { useState } from 'react';
import { Sparkles, MessageCircle, X } from 'lucide-react';

export const FloatingContextualCTA: React.FC = () => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="fixed bottom-[calc(88px+env(safe-area-inset-bottom,0px))] left-4 sm:bottom-6 sm:left-6 z-[9990] flex items-center select-none">
      {expanded ? (
        <div className="flex items-center gap-3 bg-inkNavy text-ivory border border-zariGold/30 rounded-full px-4 py-2.5 shadow-2xl animate-fade-in">
          <Sparkles className="w-4 h-4 text-zariGold shrink-0" />
          <div className="text-left font-sans text-xs">
            <p className="font-semibold text-ivory">Personal Styling Concierge</p>
            <a
              href="https://wa.me/917483848505?text=Hello!%20I%20am%20browsing%20The%20Girls%20Collections%20and%20need%20styling%20advice."
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] font-medium text-zariGoldLight hover:underline"
            >
              Connect on WhatsApp →
            </a>
          </div>
          <button
            onClick={() => setExpanded(false)}
            className="w-6 h-6 rounded-full hover:bg-white/10 flex items-center justify-center text-ivory/60 transition-colors ml-1"
            aria-label="Collapse"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        <button
          onClick={() => setExpanded(true)}
          className="group w-12 h-12 rounded-full bg-inkNavy border border-zariGold/40 text-zariGold flex items-center justify-center shadow-xl hover:scale-105 transition-all"
          aria-label="Styling Concierge"
          title="Styling Concierge"
        >
          <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" />
        </button>
      )}
    </div>
  );
};

export default FloatingContextualCTA;
