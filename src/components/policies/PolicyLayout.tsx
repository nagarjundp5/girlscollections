'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { PolicyDocument } from '@/content/policies/types';
import { siteConfig } from '@/lib/siteConfig';
import { ShieldCheck, ChevronRight, Mail, Phone, MapPin, ArrowRight } from 'lucide-react';

interface PolicyLayoutProps {
  policy: PolicyDocument;
}

const POLICY_LINKS = [
  { href: '/terms-and-conditions', label: 'Terms & Conditions' },
  { href: '/privacy-policy', label: 'Privacy Policy' },
  { href: '/shipping-and-delivery', label: 'Shipping & Delivery' },
  { href: '/returns-and-exchange', label: 'Returns & Exchange' },
  { href: '/faqs', label: 'FAQs' },
];

export const PolicyLayout: React.FC<PolicyLayoutProps> = ({ policy }) => {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#1C1417] font-sans selection:bg-[#F3DDE0] selection:text-[#1A1E3A]">
      {/* ── Breadcrumb & Top Navigation Bar ── */}
      <div className="w-full border-b border-[#EAE5DE] bg-white/80 backdrop-blur-xs py-3 px-4 sm:px-6 lg:px-8 text-xs text-gray-500">
        <div className="max-w-[1280px] mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center space-x-2 truncate">
            <Link href="/" className="hover:text-[#1A1E3A] transition-colors">
              Home
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-gray-400 shrink-0" />
            <span className="text-gray-400">Policies</span>
            <ChevronRight className="w-3.5 h-3.5 text-gray-400 shrink-0" />
            <span className="text-[#1A1E3A] font-semibold truncate">{policy.title}</span>
          </div>

          <span className="hidden sm:inline-block text-[11px] font-mono text-gray-400">
            Last updated: {policy.lastUpdated}
          </span>
        </div>
      </div>

      {/* ── Header Hero with Temple Arch Styling ── */}
      <header className="relative w-full bg-[#FCF5F5] border-b border-[#EAE5DE] py-10 sm:py-14 px-4 sm:px-6 lg:px-8">
        <div className="max-w-[1280px] mx-auto">
          <div className="max-w-3xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-[#B8903A]/30 text-[#B8903A] text-xs font-semibold uppercase tracking-[0.16em]">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Official Policy • {siteConfig.legalName}</span>
            </div>
            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-serif font-bold text-[#1A1E3A] tracking-[0.02em] leading-tight">
              {policy.title}
            </h1>
            <p className="text-sm sm:text-base text-[#1C1417]/75 font-sans leading-relaxed">
              {policy.subtitle}
            </p>
            <div className="sm:hidden pt-1 text-xs text-[#1C1417]/50 font-mono">
              Last updated: {policy.lastUpdated}
            </div>
          </div>

          {/* Quick-switch policy tabs */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-8 pb-1">
            {POLICY_LINKS.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all border ${
                    isActive
                      ? 'bg-[#1A1E3A] text-white border-[#1A1E3A] shadow-xs'
                      : 'bg-white text-[#1C1417]/80 border-[#EAE5DE] hover:border-[#B8903A] hover:text-[#1A1E3A]'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>
        </div>
      </header>

      {/* ── Main Policy Content Container ── */}
      <main className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          {/* ── Desktop Sticky Table of Contents (4 Cols) ── */}
          <aside className="hidden lg:block lg:col-span-4 sticky top-24 space-y-6">
            <div className="bg-white rounded-2xl border border-[#EAE5DE] p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-[#EAE5DE] pb-3">
                <h3 className="font-serif font-bold text-sm uppercase tracking-[0.14em] text-[#1A1E3A]">
                  Table of Contents
                </h3>
                <span className="text-[11px] font-mono text-[#B8903A]">
                  {policy.clauses.length} Clauses
                </span>
              </div>

              <nav className="space-y-1 max-h-[calc(100vh-220px)] overflow-y-auto no-scrollbar pr-1">
                {policy.clauses.map((clause) => (
                  <a
                    key={clause.id}
                    href={`#${clause.id}`}
                    className="group flex items-start gap-2.5 py-2 px-2.5 rounded-lg text-xs font-sans text-[#1C1417]/70 hover:text-[#1A1E3A] hover:bg-[#FAF8F5] transition-all"
                  >
                    <span className="font-mono text-[#B8903A] font-semibold shrink-0 pt-0.5">
                      {clause.number}.
                    </span>
                    <span className="group-hover:translate-x-0.5 transition-transform leading-relaxed">
                      {clause.title}
                    </span>
                  </a>
                ))}
              </nav>
            </div>

            {/* Quick Contact Card */}
            <div className="bg-[#FCF5F5] rounded-2xl border border-[#B8903A]/25 p-5 space-y-3">
              <h4 className="font-serif font-bold text-xs uppercase tracking-[0.14em] text-[#1A1E3A]">
                Need Clarification?
              </h4>
              <p className="text-xs text-[#1C1417]/70 leading-relaxed">
                Our support team is available Mon–Sat (10:30 AM–8:30 PM IST).
              </p>
              <div className="space-y-2 pt-1 text-xs">
                <a
                  href={`mailto:${siteConfig.email}`}
                  className="flex items-center gap-2 text-[#1A1E3A] hover:text-[#B8903A] font-medium break-all"
                >
                  <Mail className="w-3.5 h-3.5 text-[#B8903A] shrink-0" />
                  <span>{siteConfig.email}</span>
                </a>
                <a
                  href={`tel:${siteConfig.telLink}`}
                  className="flex items-center gap-2 text-[#1A1E3A] hover:text-[#B8903A] font-medium"
                >
                  <Phone className="w-3.5 h-3.5 text-[#B8903A] shrink-0" />
                  <span>+91 {siteConfig.phone}</span>
                </a>
              </div>
            </div>
          </aside>

          {/* ── Document Body (8 Cols Desktop, Full Width Mobile) ── */}
          <article className="lg:col-span-8 space-y-10">
            {/* Intro Paragraphs */}
            {policy.intro && policy.intro.length > 0 && (
              <div className="bg-white rounded-2xl border border-[#EAE5DE] p-6 sm:p-8 space-y-3.5 shadow-xs">
                {policy.intro.map((para, i) => (
                  <p
                    key={i}
                    className="text-sm sm:text-[15px] font-sans text-[#1C1417]/80 leading-relaxed"
                  >
                    {para}
                  </p>
                ))}
              </div>
            )}

            {/* Numbered Clauses (Taruni-style structure) */}
            <div className="space-y-6">
              {policy.clauses.map((clause) => (
                <section
                  key={clause.id}
                  id={clause.id}
                  className="scroll-mt-24 bg-white rounded-2xl border border-[#EAE5DE] p-6 sm:p-8 space-y-4 shadow-xs"
                >
                  <div className="flex items-baseline gap-3 border-b border-[#FAF8F5] pb-3">
                    <span className="text-base sm:text-lg font-mono font-bold text-[#B8903A] shrink-0">
                      {clause.number}.
                    </span>
                    <h2 className="text-lg sm:text-xl font-serif font-bold text-[#1A1E3A] leading-snug">
                      {clause.title}
                    </h2>
                  </div>

                  <div className="space-y-3 text-sm sm:text-[15px] text-[#1C1417]/80 font-sans leading-relaxed">
                    {clause.paragraphs.map((p, pIdx) => (
                      <p key={pIdx}>{p}</p>
                    ))}

                    {clause.bullets && clause.bullets.length > 0 && (
                      <ul className="space-y-2 pt-2 list-none pl-1">
                        {clause.bullets.map((bullet, bIdx) => (
                          <li key={bIdx} className="flex items-start gap-2.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#B8903A] shrink-0 mt-2" />
                            <span className="text-[#1C1417]/85">{bullet}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </section>
              ))}
            </div>

            {/* In-Store Boutique Strip at Bottom of Article */}
            <div className="bg-[#FAF8F5] border border-[#B8903A]/30 rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1 max-w-lg">
                <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#B8903A] block">
                  Bengaluru Flagship Boutique
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
                  <span>Google Maps</span>
                </a>
                <a
                  href={`tel:${siteConfig.telLink}`}
                  className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-5 py-3 rounded-xl bg-white border border-[#EAE5DE] text-[#1A1E3A] text-xs font-semibold hover:border-[#B8903A] transition-colors"
                >
                  <Phone className="w-3.5 h-3.5 text-[#B8903A]" />
                  <span>Call Store</span>
                </a>
              </div>
            </div>

            {/* Bottom Policy Navigation Bar */}
            <div className="border-t border-[#EAE5DE] pt-8 space-y-3">
              <h4 className="text-xs font-serif font-bold uppercase tracking-[0.16em] text-[#1A1E3A]">
                Explore Other Legal &amp; Service Policies
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {POLICY_LINKS.filter((l) => l.href !== pathname).map((l) => (
                  <Link
                    key={l.href}
                    href={l.href}
                    className="p-3.5 rounded-xl bg-white border border-[#EAE5DE] hover:border-[#B8903A] transition-colors flex items-center justify-between text-[#1A1E3A] font-medium group"
                  >
                    <span>{l.label}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-gray-400 group-hover:text-[#B8903A] group-hover:translate-x-0.5 transition-all" />
                  </Link>
                ))}
              </div>
            </div>
          </article>
        </div>
      </main>
    </div>
  );
};

export default PolicyLayout;
