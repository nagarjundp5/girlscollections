'use client';

import React, { useState } from 'react';
import { ShieldCheck, FileText, ChevronDown, Check, Truck, RefreshCw, Lock, Sparkles, ExternalLink, X } from 'lucide-react';
import Link from 'next/link';

interface TermsAndConditionsBoxProps {
  accepted: boolean;
  onAcceptChange: (accepted: boolean) => void;
  compact?: boolean;
  className?: string;
}

const HIGHLIGHTS = [
  {
    id: 'shipping',
    icon: Truck,
    title: 'Express Insured Shipping',
    desc: 'All orders across India are dispatched via trusted air courier partners (Bluedart, Delhivery, Xpressbees) with full transit insurance.',
  },
  {
    id: 'returns',
    icon: RefreshCw,
    title: 'Easy 7-Day Replacement',
    desc: 'Hassle-free size exchanges and returns within 7 days of delivery. Customer support assists with quick doorstep pickup.',
  },
  {
    id: 'security',
    icon: Lock,
    title: '100% Encrypted Transactions',
    desc: 'All credit cards, UPI, net banking, and Cash on Delivery payments are processed through tokenized, PCI-DSS compliant gateways.',
  },
  {
    id: 'privacy',
    icon: ShieldCheck,
    title: 'Privacy & Data Protection',
    desc: 'Your personal information is strictly used for order fulfillment and tracking alerts. We never sell or rent your personal data.',
  },
];

export default function TermsAndConditionsBox({
  accepted,
  onAcceptChange,
  compact = false,
  className = '',
}: TermsAndConditionsBoxProps) {
  const [openSection, setOpenSection] = useState<string | null>(null);
  const [showFullModal, setShowFullModal] = useState(false);

  const toggleSection = (id: string) => {
    setOpenSection((prev) => (prev === id ? null : id));
  };

  return (
    <div className={`relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-zinc-900/90 to-black/90 p-5 shadow-2xl backdrop-blur-xl transition-all duration-300 ${accepted ? 'ring-2 ring-emerald-500/50 border-emerald-500/30' : 'hover:border-white/20'} ${className}`}>
      {/* Background Subtle Gradient Glow */}
      <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-amber-500/5 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-16 -left-16 h-40 w-40 rounded-full bg-emerald-500/5 blur-3xl" />

      {/* Header & Main Agreement Checkbox */}
      <div className="flex items-start gap-4">
        <button
          type="button"
          role="checkbox"
          aria-checked={accepted}
          onClick={() => onAcceptChange(!accepted)}
          className={`group flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 ${
            accepted
              ? 'border-emerald-500 bg-emerald-500 text-black shadow-lg shadow-emerald-500/25 scale-105'
              : 'border-white/30 bg-zinc-800/80 text-transparent hover:border-white/60 hover:bg-zinc-700/50'
          }`}
        >
          <Check className={`h-4 w-4 stroke-[3] transition-transform duration-200 ${accepted ? 'scale-100' : 'scale-0'}`} />
        </button>

        <div className="flex-1 text-sm">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <label
              onClick={() => onAcceptChange(!accepted)}
              className="cursor-pointer font-medium text-zinc-100 select-none hover:text-white"
            >
              I agree to the <span className="font-semibold text-amber-400 underline underline-offset-4 decoration-amber-400/40 hover:decoration-amber-400">Terms & Conditions</span> & <span className="font-semibold text-amber-400 underline underline-offset-4 decoration-amber-400/40 hover:decoration-amber-400">Privacy Policy</span>
            </label>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-400">
              <ShieldCheck className="h-3 w-3" /> Protected
            </span>
          </div>

          <p className="mt-1 text-xs text-zinc-400 leading-relaxed">
            By placing an order, you confirm you accept The Girls Collections purchase terms, shipping guidelines, and return policy.
          </p>
        </div>
      </div>

      {/* Accordion Highlights (if non-compact) */}
      {!compact && (
        <div className="mt-4 space-y-2 border-t border-white/10 pt-4">
          <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-zinc-400">
            <span>Key Customer Rights & Policy Summary</span>
            <button
              type="button"
              onClick={() => setShowFullModal(true)}
              className="inline-flex items-center gap-1 text-amber-400 hover:underline font-normal text-[11px]"
            >
              Full Policy <ExternalLink className="h-3 w-3" />
            </button>
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
            {HIGHLIGHTS.map((item) => {
              const Icon = item.icon;
              const isOpen = openSection === item.id;
              return (
                <div
                  key={item.id}
                  className="rounded-xl border border-white/5 bg-zinc-900/60 p-2.5 transition-colors hover:bg-zinc-800/80 hover:border-white/10"
                >
                  <button
                    type="button"
                    onClick={() => toggleSection(item.id)}
                    className="flex w-full items-center justify-between text-left text-xs font-medium text-zinc-200"
                  >
                    <span className="flex items-center gap-2">
                      <Icon className="h-3.5 w-3.5 text-amber-400" />
                      {item.title}
                    </span>
                    <ChevronDown className={`h-3.5 w-3.5 text-zinc-500 transition-transform duration-200 ${isOpen ? 'rotate-180 text-amber-400' : ''}`} />
                  </button>

                  {isOpen && (
                    <p className="mt-2 text-[11px] leading-relaxed text-zinc-400 border-t border-white/5 pt-2">
                      {item.desc}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Full Policy Modal Trigger */}
      {showFullModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
          <div className="relative max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-white/15 bg-zinc-950 p-6 shadow-2xl text-zinc-200">
            <button
              type="button"
              onClick={() => setShowFullModal(false)}
              className="absolute right-4 top-4 rounded-lg bg-zinc-900 p-2 text-zinc-400 hover:bg-zinc-800 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-3 border-b border-white/10 pb-4">
              <div className="rounded-xl bg-amber-400/10 p-2.5 text-amber-400">
                <FileText className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white font-serif tracking-tight">The Girls Collections Terms & Conditions</h2>
                <p className="text-xs text-zinc-400">Official Customer Agreement & Order Policy</p>
              </div>
            </div>

            <div className="mt-4 space-y-4 text-xs leading-relaxed text-zinc-300">
              <section>
                <h3 className="font-semibold text-amber-400 text-sm mb-1">1. Acceptance of Terms</h3>
                <p>By accessing or placing an order on The Girls Collections website (thegirlscollections.com), you agree to be bound by these Terms & Conditions. All sales are final upon order confirmation.</p>
              </section>

              <section>
                <h3 className="font-semibold text-amber-400 text-sm mb-1">2. Orders & Payments</h3>
                <p>Prices are listed in INR (₹) inclusive of GST. Orders are processed upon successful payment authorization or COD verification. Prices and stock availability are subject to real-time verification.</p>
              </section>

              <section>
                <h3 className="font-semibold text-amber-400 text-sm mb-1">3. Shipping & Delivery</h3>
                <p>Insured delivery typically takes 3-7 business days depending on location. Tracking details are sent via SMS, WhatsApp, and email upon dispatch.</p>
              </section>

              <section>
                <h3 className="font-semibold text-amber-400 text-sm mb-1">4. Returns & Size Exchanges</h3>
                <p>We accept size exchange requests within 7 days of delivery for unworn items with original tags intact. Returns for refund are processed according to our standard return guidelines.</p>
              </section>
            </div>

            <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-4">
              <Link
                href="/policies/terms-and-conditions"
                target="_blank"
                className="text-xs text-amber-400 underline hover:text-white"
              >
                View Dedicated Policy Page →
              </Link>
              <button
                type="button"
                onClick={() => {
                  onAcceptChange(true);
                  setShowFullModal(false);
                }}
                className="rounded-xl bg-amber-400 px-4 py-2 text-xs font-semibold text-black hover:bg-yellow-400"
              >
                Accept & Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
