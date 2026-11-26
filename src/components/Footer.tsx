'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { siteConfig } from '@/lib/siteConfig';
import { MapPin, Phone, Mail, Clock, ChevronDown } from 'lucide-react';
import BrandLogo from './BrandLogo';
import PaymentBadges from './PaymentBadges';

const INSTAGRAM_URL =
  process.env.NEXT_PUBLIC_INSTAGRAM_URL ||
  'https://www.instagram.com/thegirlscollections';

/**
 * Animated Instagram Row:
 * - Card with soft ivory-to-blush gradient
 * - Instagram logo in an animated gradient ring (conic-gradient slowly rotating, transform only, 6s linear infinite)
 * - Handle @thegirlscollections in Lora 600, with a gold underline that draws in on view (IntersectionObserver, runs once)
 * - "Follow" pill button in rose-pink CTA colour, with a shine sweep every 4s and press scale 0.96
 * - Whole row links to Instagram profile, target=_blank
 * - Fade-up on scroll into view, once
 */
const InstagramCard: React.FC<{ className?: string }> = ({ className = '' }) => {
  const cardRef = useRef<HTMLAnchorElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setInView(true);
            observer.disconnect();
          }
        });
      },
      { threshold: 0.2 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <a
      ref={cardRef}
      href={INSTAGRAM_URL}
      target="_blank"
      rel="noopener noreferrer"
      className={`group relative overflow-hidden rounded-2xl border border-[#F3DDE0] bg-gradient-to-r from-[#FAF8F5] via-[#FFF5F6] to-[#FCE8EB] p-4 sm:p-5 shadow-xs transition-shadow duration-300 hover:shadow-md block ${
        inView ? 'animate-fade-up-once' : 'opacity-0'
      } ${className}`}
      aria-label="Follow us on Instagram @thegirlscollections"
    >
      <div className="flex items-center justify-between gap-3 sm:gap-4">
        {/* Left: Instagram animated gradient ring & logo */}
        <div className="flex items-center gap-3 sm:gap-3.5 min-w-0">
          <div className="relative w-11 h-11 sm:w-12 sm:h-12 rounded-full overflow-hidden flex items-center justify-center shrink-0">
            {/* 6s linear infinite rotating conic-gradient ring (transform only) */}
            <div
              className="absolute inset-[-50%] animate-ig-ring motion-reduce:animate-none"
              style={{
                background:
                  'conic-gradient(from 0deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888, #f09433)',
              }}
            />
            {/* Inner circle with Instagram logo glyph */}
            <div className="absolute inset-[2.5px] rounded-full bg-white flex items-center justify-center z-10 shadow-2xs">
              <svg
                className="w-5 h-5 text-[#bc1888] shrink-0"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.9"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
              </svg>
            </div>
          </div>

          {/* Center text: "Follow us" + @thegirlscollections in Lora 600 with gold drawn underline */}
          <div className="min-w-0">
            <span className="block text-xs font-sans text-[#1A1E3A]/70 uppercase tracking-wider font-semibold">
              Follow Us on Instagram
            </span>
            <div className="relative inline-block mt-0.5">
              <span className="font-serif font-semibold text-[16px] sm:text-[17px] text-[#1A1E3A] tracking-[0.01em] group-hover:text-[#B83A5A] transition-colors">
                @thegirlscollections
              </span>
              {/* Gold underline drawn in on view once */}
              <span
                className={`absolute -bottom-0.5 left-0 right-0 h-[2px] bg-[#C5A059] transition-transform duration-700 ease-out origin-left ${
                  inView ? 'scale-x-100' : 'scale-x-0'
                }`}
                aria-hidden="true"
              />
            </div>
          </div>
        </div>

        {/* Right: Rose-pink CTA button with 4s shine sweep & press scale 0.96 */}
        <div className="shrink-0">
          <span className="relative overflow-hidden inline-flex items-center justify-center px-4 py-2 sm:px-5 sm:py-2.5 rounded-full bg-[#C44D6C] text-white font-sans text-xs sm:text-sm font-semibold tracking-wide shadow-xs active:scale-[0.96] transition-transform duration-150 select-none">
            <span className="relative z-10">Follow</span>
            {/* CSS-only shine sweep every 4s */}
            <span
              className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/40 to-transparent -skew-x-12 animate-shine-sweep motion-reduce:animate-none pointer-events-none"
              aria-hidden="true"
            />
          </span>
        </div>
      </div>
    </a>
  );
};

export default function Footer() {
  const [openSection, setOpenSection] = useState<'about' | 'links' | 'contact' | null>(null);

  const toggleSection = (section: 'about' | 'links' | 'contact') => {
    setOpenSection((prev) => (prev === section ? null : section));
  };

  const aboutLinks = [
    { href: '/about', label: 'Our Story' },
    { href: '/contact', label: 'Visit Boutique' },
    { href: '/faqs', label: 'Help & FAQs' },
  ];

  const quickLinks = [
    { href: '/shipping-and-delivery', label: 'Shipping & Delivery' },
    { href: '/returns-and-exchange', label: 'Returns & Exchange' },
    { href: '/track', label: 'Track My Order' },
    { href: '/privacy-policy', label: 'Privacy Policy' },
    { href: '/terms-and-conditions', label: 'Terms & Conditions' },
  ];

  const linkTargetClass =
    'min-h-[48px] flex items-center text-[16px] sm:text-[17px] font-sans text-[#1A1E3A]/85 hover:text-[#C5A059] transition-colors py-1 leading-snug';

  return (
    <footer className="w-full bg-[#FCFAF8] text-[#1A1E3A] border-t border-[#EAE5DE] select-none">
      <div className="max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-12 py-10 md:py-16">
        
        {/* a) "Follow us on Instagram" row */}
        <div className="mb-8 md:mb-12">
          <InstagramCard />
        </div>

        {/* b) Logo + tagline (Desktop and Mobile) */}
        <div className="mb-8 md:mb-12 flex flex-col items-start space-y-2.5 max-w-xl">
          <BrandLogo variant="horizontal" size="md" />
          <p className="font-sans text-[15px] sm:text-[16px] text-[#1A1E3A]/80 leading-relaxed pt-1">
            Curated luxury Indian fashion &amp; handcrafted ethnic wear for women and girls.
          </p>
        </div>

        {/* ── MOBILE ACCORDION (Collapsible, generous tap targets, 16-17px text) ── */}
        <div className="md:hidden divide-y divide-[#EAE5DE] border-y border-[#EAE5DE] mb-8">
          
          {/* Section 1: About Us */}
          <div>
            <button
              type="button"
              onClick={() => toggleSection('about')}
              className="w-full min-h-[48px] py-3.5 flex items-center justify-between text-left font-serif font-semibold text-[18px] text-[#1A1E3A] cursor-pointer"
              aria-expanded={openSection === 'about'}
            >
              <span>About Us</span>
              <ChevronDown
                className={`w-5 h-5 text-[#1A1E3A]/70 transition-transform duration-300 ease-out ${
                  openSection === 'about' ? 'rotate-180' : 'rotate-0'
                }`}
              />
            </button>
            <div
              className={`grid transition-[grid-template-rows] duration-300 ease-out ${
                openSection === 'about' ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
              }`}
            >
              <div className="overflow-hidden">
                <ul className="pb-3.5 space-y-0.5">
                  {aboutLinks.map((item) => (
                    <li key={item.href}>
                      <Link href={item.href} className={linkTargetClass}>
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Section 2: Quick Links */}
          <div>
            <button
              type="button"
              onClick={() => toggleSection('links')}
              className="w-full min-h-[48px] py-3.5 flex items-center justify-between text-left font-serif font-semibold text-[18px] text-[#1A1E3A] cursor-pointer"
              aria-expanded={openSection === 'links'}
            >
              <span>Quick Links</span>
              <ChevronDown
                className={`w-5 h-5 text-[#1A1E3A]/70 transition-transform duration-300 ease-out ${
                  openSection === 'links' ? 'rotate-180' : 'rotate-0'
                }`}
              />
            </button>
            <div
              className={`grid transition-[grid-template-rows] duration-300 ease-out ${
                openSection === 'links' ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
              }`}
            >
              <div className="overflow-hidden">
                <ul className="pb-3.5 space-y-0.5">
                  {quickLinks.map((item) => (
                    <li key={item.href}>
                      <Link href={item.href} className={linkTargetClass}>
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Section 3: Contact */}
          <div>
            <button
              type="button"
              onClick={() => toggleSection('contact')}
              className="w-full min-h-[48px] py-3.5 flex items-center justify-between text-left font-serif font-semibold text-[18px] text-[#1A1E3A] cursor-pointer"
              aria-expanded={openSection === 'contact'}
            >
              <span>Contact</span>
              <ChevronDown
                className={`w-5 h-5 text-[#1A1E3A]/70 transition-transform duration-300 ease-out ${
                  openSection === 'contact' ? 'rotate-180' : 'rotate-0'
                }`}
              />
            </button>
            <div
              className={`grid transition-[grid-template-rows] duration-300 ease-out ${
                openSection === 'contact' ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
              }`}
            >
              <div className="overflow-hidden">
                <ul className="pb-4 space-y-2 text-[16px] sm:text-[17px] font-sans text-[#1A1E3A]/85">
                  <li>
                    <a
                      href={siteConfig.mapsLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="min-h-[48px] flex items-start gap-3 py-1 hover:text-[#C5A059] transition-colors leading-relaxed"
                    >
                      <MapPin className="w-5 h-5 text-[#C5A059] shrink-0 mt-0.5" />
                      <span>{siteConfig.address}</span>
                    </a>
                  </li>
                  <li>
                    <a
                      href={`mailto:${siteConfig.email}`}
                      className="min-h-[48px] flex items-center gap-3 py-1 hover:text-[#C5A059] transition-colors break-all"
                    >
                      <Mail className="w-5 h-5 text-[#C5A059] shrink-0" />
                      <span>{siteConfig.email}</span>
                    </a>
                  </li>
                  <li>
                    <a
                      href={`tel:${siteConfig.telLink}`}
                      className="min-h-[48px] flex items-center gap-3 py-1 font-semibold hover:text-[#C5A059] transition-colors"
                    >
                      <Phone className="w-5 h-5 text-[#C5A059] shrink-0" />
                      <span>+91 {siteConfig.phone}</span>
                    </a>
                  </li>
                  <li className="min-h-[48px] flex items-start gap-3 py-1 text-xs text-[#1A1E3A]/70">
                    <Clock className="w-5 h-5 text-[#C5A059] shrink-0 mt-0.5" />
                    <span>{siteConfig.hours}</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* ── DESKTOP 4-COLUMN TARUNI STYLE (About Us, Quick Links, Contact, Store/Hours) ── */}
        <div className="hidden md:grid md:grid-cols-4 gap-8 lg:gap-12 mb-12">
          {/* Column 1: About Us */}
          <div>
            <h3 className="font-serif font-semibold text-[18px] text-[#1A1E3A] mb-4">
              About Us
            </h3>
            <ul className="space-y-1">
              {aboutLinks.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className={linkTargetClass}>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h3 className="font-serif font-semibold text-[18px] text-[#1A1E3A] mb-4">
              Quick Links
            </h3>
            <ul className="space-y-1">
              {quickLinks.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className={linkTargetClass}>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Contact Info */}
          <div>
            <h3 className="font-serif font-semibold text-[18px] text-[#1A1E3A] mb-4">
              Contact Us
            </h3>
            <ul className="space-y-2 text-[15px] lg:text-[16px] font-sans text-[#1A1E3A]/85">
              <li>
                <a
                  href={`mailto:${siteConfig.email}`}
                  className="flex items-center gap-2.5 min-h-[40px] hover:text-[#C5A059] transition-colors break-all"
                >
                  <Mail className="w-4 h-4 text-[#C5A059] shrink-0" />
                  <span>{siteConfig.email}</span>
                </a>
              </li>
              <li>
                <a
                  href={`tel:${siteConfig.telLink}`}
                  className="flex items-center gap-2.5 min-h-[40px] font-semibold hover:text-[#C5A059] transition-colors"
                >
                  <Phone className="w-4 h-4 text-[#C5A059] shrink-0" />
                  <span>+91 {siteConfig.phone}</span>
                </a>
              </li>
              <li className="flex items-start gap-2.5 min-h-[40px] text-xs text-[#1A1E3A]/70 pt-1 leading-relaxed">
                <Clock className="w-4 h-4 text-[#C5A059] shrink-0 mt-0.5" />
                <span>{siteConfig.hours}</span>
              </li>
            </ul>
          </div>

          {/* Column 4: Visit Boutique */}
          <div>
            <h3 className="font-serif font-semibold text-[18px] text-[#1A1E3A] mb-4">
              Visit Boutique
            </h3>
            <a
              href={siteConfig.mapsLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-start gap-2.5 min-h-[44px] text-[15px] lg:text-[16px] font-sans text-[#1A1E3A]/85 hover:text-[#C5A059] transition-colors leading-relaxed group"
            >
              <MapPin className="w-4 h-4 text-[#C5A059] shrink-0 mt-1 group-hover:scale-110 transition-transform" />
              <span>{siteConfig.address}</span>
            </a>
          </div>
        </div>

        {/* d) Divider line */}
        <hr className="border-t border-[#EAE5DE] my-8 sm:my-10" />

        {/* e) "Secure Checkout With" centered, followed by badges */}
        <div className="mb-8">
          <PaymentBadges />
        </div>

        {/* f) Copyright in small text */}
        <div className="text-center pt-2">
          <p className="text-[12px] sm:text-[13px] font-sans text-[#1A1E3A]/60">
            © 2026 {siteConfig.legalName}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
