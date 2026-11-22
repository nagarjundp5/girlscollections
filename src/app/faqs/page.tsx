'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { faqsData } from '@/content/policies/faqs';
import { siteConfig } from '@/lib/siteConfig';
import { ChevronDown, ChevronUp, ChevronRight, HelpCircle, Mail, Phone, MapPin } from 'lucide-react';

export default function FAQsPage() {
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({
    '0-0': true,
    '1-0': true,
  });

  const toggleItem = (key: string) => {
    setOpenItems((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#1C1417] font-sans selection:bg-[#F3DDE0] selection:text-[#1A1E3A]">
      {/* ── Breadcrumb Bar ── */}
      <div className="w-full border-b border-[#EAE5DE] bg-white/80 backdrop-blur-xs py-3 px-4 sm:px-6 lg:px-8 text-xs text-gray-500">
        <div className="max-w-[1280px] mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center space-x-2 truncate">
            <Link href="/" className="hover:text-[#1A1E3A] transition-colors">
              Home
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-gray-400 shrink-0" />
            <span className="text-gray-400">Help</span>
            <ChevronRight className="w-3.5 h-3.5 text-gray-400 shrink-0" />
            <span className="text-[#1A1E3A] font-semibold truncate">Frequently Asked Questions</span>
          </div>

          <span className="hidden sm:inline-block text-[11px] font-mono text-gray-400">
            Last updated: {faqsData.lastUpdated}
          </span>
        </div>
      </div>

      {/* ── Hero Header ── */}
      <header className="w-full bg-[#FCF5F5] border-b border-[#EAE5DE] py-10 sm:py-14 px-4 sm:px-6 lg:px-8">
        <div className="max-w-[1280px] mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-[#B8903A]/30 text-[#B8903A] text-xs font-semibold uppercase tracking-[0.16em]">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Help Center &amp; Answers</span>
          </div>
          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-serif font-bold text-[#1A1E3A] tracking-[0.02em] leading-tight">
            Frequently Asked Questions
          </h1>
          <p className="text-sm sm:text-base text-[#1C1417]/75 font-sans leading-relaxed max-w-2xl">
            Everything you need to know about shopping online, COD advances, Pan-India express delivery, returns, and bespoke tailoring at The Girls Collections.
          </p>
        </div>
      </header>

      {/* ── Content Body ── */}
      <main className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          {/* Categories / Navigation Sidebar (Desktop) */}
          <aside className="hidden lg:block lg:col-span-4 sticky top-24 space-y-6">
            <div className="bg-white rounded-2xl border border-[#EAE5DE] p-6 shadow-xs space-y-3">
              <h3 className="font-serif font-bold text-xs uppercase tracking-[0.14em] text-[#1A1E3A] pb-2 border-b border-[#EAE5DE]">
                Categories
              </h3>
              <nav className="space-y-1">
                {faqsData.categories.map((cat, idx) => (
                  <a
                    key={idx}
                    href={`#cat-${idx}`}
                    className="flex items-center justify-between py-2 px-3 rounded-lg text-xs font-medium text-[#1C1417]/75 hover:bg-[#FAF8F5] hover:text-[#1A1E3A] transition-colors"
                  >
                    <span>{cat.name}</span>
                    <span className="font-mono text-[11px] text-[#B8903A]">({cat.items.length})</span>
                  </a>
                ))}
              </nav>
            </div>

            {/* Support Block */}
            <div className="bg-[#FCF5F5] rounded-2xl border border-[#B8903A]/25 p-5 space-y-3 text-xs">
              <h4 className="font-serif font-bold uppercase tracking-[0.14em] text-[#1A1E3A]">
                Still Have Questions?
              </h4>
              <p className="text-[#1C1417]/70 leading-relaxed">
                Connect with our boutique stylist directly on WhatsApp or phone for sizing, live stock, or order status.
              </p>
              <div className="space-y-2 pt-1 font-medium">
                <a
                  href={siteConfig.whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-emerald-700 hover:text-emerald-800"
                >
                  <span>Chat on WhatsApp →</span>
                </a>
                <a
                  href={`mailto:${siteConfig.email}`}
                  className="flex items-center gap-2 text-[#1A1E3A] hover:text-[#B8903A] break-all"
                >
                  <Mail className="w-3.5 h-3.5 text-[#B8903A] shrink-0" />
                  <span>{siteConfig.email}</span>
                </a>
                <a
                  href={`tel:${siteConfig.telLink}`}
                  className="flex items-center gap-2 text-[#1A1E3A] hover:text-[#B8903A]"
                >
                  <Phone className="w-3.5 h-3.5 text-[#B8903A] shrink-0" />
                  <span>+91 {siteConfig.phone}</span>
                </a>
              </div>
            </div>
          </aside>

          {/* Accordion List */}
          <div className="lg:col-span-8 space-y-10">
            {faqsData.categories.map((cat, catIdx) => (
              <section key={catIdx} id={`cat-${catIdx}`} className="scroll-mt-24 space-y-4">
                <div className="flex items-center gap-3 border-b border-[#EAE5DE] pb-2">
                  <span className="w-2 h-2 rounded-full bg-[#B8903A]" />
                  <h2 className="font-serif font-bold text-lg sm:text-xl text-[#1A1E3A]">
                    {cat.name}
                  </h2>
                </div>

                <div className="space-y-3">
                  {cat.items.map((item, itemIdx) => {
                    const key = `${catIdx}-${itemIdx}`;
                    const isOpen = !!openItems[key];
                    return (
                      <div
                        key={itemIdx}
                        className="bg-white rounded-2xl border border-[#EAE5DE] overflow-hidden shadow-xs transition-colors"
                      >
                        <button
                          type="button"
                          onClick={() => toggleItem(key)}
                          className="w-full p-5 sm:p-6 text-left flex items-start justify-between gap-4 cursor-pointer hover:bg-[#FAF8F5]/60 transition-colors"
                        >
                          <span className="font-serif font-semibold text-sm sm:text-base text-[#1A1E3A] leading-snug">
                            {item.question}
                          </span>
                          <span className="p-1 rounded-full bg-[#FAF8F5] border border-[#EAE5DE] shrink-0 text-[#B8903A] mt-0.5">
                            {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </span>
                        </button>

                        {isOpen && (
                          <div className="px-5 pb-6 sm:px-6 sm:pb-6 text-xs sm:text-sm text-[#1C1417]/80 font-sans leading-relaxed border-t border-[#FAF8F5] pt-3">
                            <p>{item.answer}</p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>
            ))}

            {/* Visit Store Strip */}
            <div className="bg-[#FAF8F5] border border-[#B8903A]/30 rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1 max-w-lg">
                <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#B8903A] block">
                  Experience In-Store
                </span>
                <p className="text-sm font-serif font-bold text-[#1A1E3A]">
                  {siteConfig.legalName}
                </p>
                <p className="text-xs text-[#1C1417]/70 leading-relaxed">
                  {siteConfig.address}
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0 w-full sm:w-auto">
                <a
                  href={siteConfig.mapsLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-5 py-3 rounded-xl bg-[#1A1E3A] text-white text-xs font-semibold hover:bg-[#121528] transition-colors"
                >
                  <MapPin className="w-3.5 h-3.5 text-[#B8903A]" />
                  <span>Directions</span>
                </a>
                <a
                  href={`tel:${siteConfig.telLink}`}
                  className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-5 py-3 rounded-xl bg-white border border-[#EAE5DE] text-[#1A1E3A] text-xs font-semibold hover:border-[#B8903A] transition-colors"
                >
                  <Phone className="w-3.5 h-3.5 text-[#B8903A]" />
                  <span>Call Us</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
