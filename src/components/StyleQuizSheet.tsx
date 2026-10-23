'use client';

import React, { useState } from 'react';
import { X, Sparkles, ChevronRight } from 'lucide-react';
import CuratedResults from '@/components/CuratedResults';

interface StyleQuizSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

const OCCASIONS = [
  { id: 'wedding', label: 'WEDDING', description: 'Bridal, reception & royal ceremonies' },
  { id: 'festive', label: 'FESTIVE', description: 'Diwali, Puja & family celebrations' },
  { id: 'party', label: 'PARTY', description: 'Cocktail evenings & modern soirees' },
  { id: 'everyday', label: 'EVERYDAY', description: 'Effortless silk drapes & handloom edits' },
];

const MOODS = [
  { id: 'royal', label: 'THE ROYAL', description: 'Heavy zari borders & opulent drapes' },
  { id: 'romantic', label: 'THE ROMANTIC', description: 'Organza sheers & pastel floral weaves' },
  { id: 'minimal', label: 'THE MINIMAL', description: 'Subtle weaves & contemporary silhouettes' },
  { id: 'statement', label: 'THE STATEMENT', description: 'Bold color blocks & intricate motif art' },
];

export const StyleQuizSheet: React.FC<StyleQuizSheetProps> = ({ isOpen, onClose }) => {
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedOccasion, setSelectedOccasion] = useState<string | null>(null);
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [showResults, setShowResults] = useState(false);

  if (!isOpen) return null;

  const handleOccasionSelect = (id: string) => {
    setSelectedOccasion(id);
    setStep(2);
  };

  const handleMoodSelect = (id: string) => {
    setSelectedMood(id);
    setShowResults(true);
  };

  const handleReset = () => {
    setStep(1);
    setSelectedOccasion(null);
    setSelectedMood(null);
    setShowResults(false);
  };

  if (showResults && selectedOccasion && selectedMood) {
    return (
      <CuratedResults
        occasion={selectedOccasion}
        mood={selectedMood}
        onClose={() => {
          handleReset();
          onClose();
        }}
      />
    );
  }

  return (
    <div className="fixed inset-0 z-[100] bg-inkNavy/70 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="w-full max-w-lg bg-ivory text-inkNavy rounded-t-2xl sm:rounded-2xl border border-zariGold/30 shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-300">
        
        {/* Header */}
        <div className="p-5 border-b border-zariGold/20 flex items-center justify-between bg-sand/20">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-zariGold" />
            <span className="font-sans font-semibold text-xs text-zariGold tracking-[0.2em] uppercase">
              PERSONAL STYLIST · STEP 0{step} OF 02
            </span>
          </div>
          <button
            onClick={() => {
              handleReset();
              onClose();
            }}
            className="w-8 h-8 rounded-full bg-ivory border border-zariGold/30 flex items-center justify-center text-inkNavy hover:bg-zariGold hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {step === 1 ? (
            <div>
              <h3 className="text-2xl font-serif font-bold text-inkNavy mb-1">
                What are you dressing for?
              </h3>
              <p className="text-xs font-sans text-inkNavy/70 mb-6">
                Select your occasion to discover tailored recommendations.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {OCCASIONS.map((occ) => (
                  <button
                    key={occ.id}
                    onClick={() => handleOccasionSelect(occ.label)}
                    className="p-4 rounded-xl bg-ivory border border-zariGold/30 hover:border-zariGold hover:bg-zariGold/5 text-left transition-all group flex items-center justify-between"
                  >
                    <div>
                      <span className="font-serif font-bold text-sm text-inkNavy block group-hover:text-zariGold transition-colors">
                        {occ.label}
                      </span>
                      <span className="text-[11px] font-sans text-inkNavy/60 block mt-0.5">
                        {occ.description}
                      </span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-zariGold group-hover:translate-x-1 transition-transform" />
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div>
              <h3 className="text-2xl font-serif font-bold text-inkNavy mb-1">
                What&apos;s your mood?
              </h3>
              <p className="text-xs font-sans text-inkNavy/70 mb-6">
                Select your aesthetic preference for {selectedOccasion}.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {MOODS.map((mood) => (
                  <button
                    key={mood.id}
                    onClick={() => handleMoodSelect(mood.label)}
                    className="p-4 rounded-xl bg-ivory border border-zariGold/30 hover:border-zariGold hover:bg-zariGold/5 text-left transition-all group flex items-center justify-between"
                  >
                    <div>
                      <span className="font-serif font-bold text-sm text-inkNavy block group-hover:text-zariGold transition-colors">
                        {mood.label}
                      </span>
                      <span className="text-[11px] font-sans text-inkNavy/60 block mt-0.5">
                        {mood.description}
                      </span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-zariGold group-hover:translate-x-1 transition-transform" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default StyleQuizSheet;
