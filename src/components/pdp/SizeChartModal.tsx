'use client';

import React, { useState } from 'react';
import { X, Ruler } from 'lucide-react';
import { WOMEN_MASTER_SIZES, KIDS_MASTER_SIZES } from '@/data/masterSizes';

interface SizeChartModalProps {
  isOpen: boolean;
  onClose: () => void;
  target?: 'women' | 'kids';
  category?: string;
}

export const SizeChartModal: React.FC<SizeChartModalProps> = ({
  isOpen,
  onClose,
  target = 'women',
  category = '',
}) => {
  const [activeTab, setActiveTab] = useState<'women' | 'kids'>(target);
  const [unit, setUnit] = useState<'in' | 'cm'>('in');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[120] overflow-y-auto select-none" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-[#0D0E1A]/70 backdrop-blur-xs transition-opacity duration-300 cursor-pointer"
        aria-hidden="true"
      />

      <div className="relative min-h-screen flex items-center justify-center p-3 sm:p-6">
        <div className="relative w-full max-w-3xl bg-[#FAF6EE] rounded-2xl p-5 sm:p-8 shadow-2xl border border-[#B8924A]/30 text-[#1A1A2E] animate-scale-up">
          {/* Modal Header */}
          <div className="flex items-center justify-between pb-4 border-b border-[#B8924A]/20">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-full bg-[#B8924A]/15 border border-[#B8924A]/30 flex items-center justify-center text-[#B8924A]">
                <Ruler className="w-4 h-4 text-[#B8924A]" />
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-serif font-semibold text-[#1A1E3A]">
                  {activeTab === 'kids' ? "Kids' Royal Ethnic Size Guide" : "Women's Couture Fit & Measurement Guide"}
                </h3>
                <p className="text-[11px] font-sans text-[#6B6B7B]">
                  Accurate body and garment measurement guide based on master tailoring standards
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-black/5 text-[#1A1A2E]/70 hover:text-[#1A1A2E] transition-colors cursor-pointer"
              aria-label="Close size guide"
            >
              <X className="w-5 h-5 stroke-[1.5]" />
            </button>
          </div>

          {/* Division Switcher & Unit Toggle Bar */}
          <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {/* Division Switcher */}
            <div className="inline-flex p-1 rounded-xl bg-white border border-[#B8924A]/25">
              <button
                onClick={() => setActiveTab('women')}
                className={`px-4 py-1.5 text-xs font-sans font-semibold rounded-lg transition-all cursor-pointer ${
                  activeTab === 'women'
                    ? 'bg-[#1A1E3A] text-white shadow-xs'
                    : 'text-[#6B6B7B] hover:text-[#1A1A2E]'
                }`}
              >
                Women&apos;s Collection
              </button>
              <button
                onClick={() => setActiveTab('kids')}
                className={`px-4 py-1.5 text-xs font-sans font-semibold rounded-lg transition-all cursor-pointer ${
                  activeTab === 'kids'
                    ? 'bg-[#1A1E3A] text-white shadow-xs'
                    : 'text-[#6B6B7B] hover:text-[#1A1A2E]'
                }`}
              >
                Kids&apos; Collection
              </button>
            </div>

            {/* Inches / Centimeters Unit Toggle */}
            <div className="inline-flex p-1 rounded-xl bg-white border border-[#B8924A]/25 self-end sm:self-auto">
              <button
                onClick={() => setUnit('in')}
                className={`px-3 py-1 text-xs font-sans font-semibold rounded-lg transition-all cursor-pointer ${
                  unit === 'in'
                    ? 'bg-[#B8924A] text-white shadow-xs'
                    : 'text-[#6B6B7B] hover:text-[#1A1A2E]'
                }`}
              >
                Inches (&quot;)
              </button>
              <button
                onClick={() => setUnit('cm')}
                className={`px-3 py-1 text-xs font-sans font-semibold rounded-lg transition-all cursor-pointer ${
                  unit === 'cm'
                    ? 'bg-[#B8924A] text-white shadow-xs'
                    : 'text-[#6B6B7B] hover:text-[#1A1A2E]'
                }`}
              >
                Centimeters (cm)
              </button>
            </div>
          </div>

          {/* Measurement Tables */}
          <div className="mt-4 overflow-hidden rounded-xl border border-[#B8924A]/25 shadow-xs bg-white">
            <div className="max-h-[50vh] overflow-y-auto">
              {activeTab === 'women' ? (
                <table className="w-full text-left border-collapse text-xs font-sans">
                  <thead className="sticky top-0 bg-[#F5F0E6] text-[#1A1E3A] font-medium border-b border-[#B8924A]/20 z-10">
                    <tr>
                      <th className="p-3 border-r border-[#B8924A]/20">Size</th>
                      <th className="p-3 border-r border-[#B8924A]/20">Bust Number</th>
                      <th className="p-3 border-r border-[#B8924A]/20">Chest / Bust ({unit})</th>
                      <th className="p-3 border-r border-[#B8924A]/20">Waist ({unit})</th>
                      <th className="p-3 border-r border-[#B8924A]/20">Hips ({unit})</th>
                      <th className="p-3">Length ({unit})</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#B8924A]/10 text-[#1A1A2E]">
                    {WOMEN_MASTER_SIZES.map((row) => (
                      <tr key={row.code} className="hover:bg-[#FAF6EE] transition-colors">
                        <td className="p-3 font-semibold text-[#1A1E3A] border-r border-[#B8924A]/10">
                          {row.code}
                        </td>
                        <td className="p-3 border-r border-[#B8924A]/10 text-[#6B6B7B]">
                          {row.numeric_size ? `Size ${row.numeric_size}` : 'FS'}
                        </td>
                        <td className="p-3 border-r border-[#B8924A]/10 font-medium">
                          {unit === 'in' ? row.measurements.chest_in : row.measurements.chest_cm}
                        </td>
                        <td className="p-3 border-r border-[#B8924A]/10 text-[#6B6B7B]">
                          {unit === 'in' ? row.measurements.waist_in : row.measurements.waist_cm}
                        </td>
                        <td className="p-3 border-r border-[#B8924A]/10 text-[#6B6B7B]">
                          {unit === 'in' ? row.measurements.hip_in : row.measurements.hip_cm}
                        </td>
                        <td className="p-3 text-[#6B6B7B]">
                          {unit === 'in' ? row.measurements.length_in : row.measurements.length_cm}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <table className="w-full text-left border-collapse text-xs font-sans">
                  <thead className="sticky top-0 bg-[#F5F0E6] text-[#1A1E3A] font-medium border-b border-[#B8924A]/20 z-10">
                    <tr>
                      <th className="p-3 border-r border-[#B8924A]/20">Age Group</th>
                      <th className="p-3 border-r border-[#B8924A]/20">Numeric Size</th>
                      <th className="p-3 border-r border-[#B8924A]/20">Chest ({unit})</th>
                      <th className="p-3 border-r border-[#B8924A]/20">Waist ({unit})</th>
                      <th className="p-3">Garment Length ({unit})</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#B8924A]/10 text-[#1A1A2E]">
                    {KIDS_MASTER_SIZES.map((row) => (
                      <tr key={row.code} className="hover:bg-[#FAF6EE] transition-colors">
                        <td className="p-3 font-semibold text-[#1A1E3A] border-r border-[#B8924A]/10">
                          {row.age_range}
                        </td>
                        <td className="p-3 border-r border-[#B8924A]/10 font-mono text-[#6B6B7B]">
                          Size {row.numeric_size}
                        </td>
                        <td className="p-3 border-r border-[#B8924A]/10 font-medium">
                          {unit === 'in' ? row.measurements.chest_in : row.measurements.chest_cm}
                        </td>
                        <td className="p-3 border-r border-[#B8924A]/10 text-[#6B6B7B]">
                          {unit === 'in' ? row.measurements.waist_in : row.measurements.waist_cm}
                        </td>
                        <td className="p-3 text-[#6B6B7B]">
                          {unit === 'in' ? row.measurements.length_in : row.measurements.length_cm}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* Measuring Guidance Tips */}
          <div className="p-3.5 rounded-xl bg-white border border-[#B8924A]/20 space-y-1.5 mt-4 text-[11px] text-[#6B6B7B] font-sans">
            <h4 className="font-serif font-semibold text-xs text-[#1A1E3A] flex items-center gap-1.5">
              <span className="text-[#B8924A]">❖</span> Artisan Fit & Measuring Advice
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
              <div>
                <strong className="text-[#1A1E3A] block">1. Chest / Bust:</strong>
                Measure around the fullest part of the chest with a relaxed measuring tape.
              </div>
              <div>
                <strong className="text-[#1A1E3A] block">2. Kids Comfort Allowance:</strong>
                All pure silk kids frocks & pattu lehengas include a soft cotton lining with a 1-inch seam allowance for growth.
              </div>
              <div>
                <strong className="text-[#1A1E3A] block">3. Custom Tailoring:</strong>
                Select &apos;Custom Alteration&apos; on any product page for personalized styling and tailored alterations.
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="mt-5 pt-3 border-t border-[#B8924A]/20 flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2 rounded-lg bg-[#1A1E3A] text-white text-xs font-sans font-medium uppercase tracking-[0.12em] hover:bg-[#3B1230] transition-colors cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SizeChartModal;
