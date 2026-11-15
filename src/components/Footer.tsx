'use client';

import React from 'react';
import Link from 'next/link';
import BrandLogo from './BrandLogo';

// ─── PLACEHOLDER CONSTANTS (User can customize these) ────────────────────────
export const EMAIL_HERE = 'care@thegirlscollections.com';
export const PHONE_HERE = '+91 98765 43210';
export const HOURS_HERE = 'Mon - Sat: 10:00 AM - 9:00 PM\nSun: 11:00 AM - 8:00 PM';

export default function Footer() {
  return (
    <footer className="w-full bg-[#FCFAF8] text-[#1C1417] border-t border-[#EAE5DE] select-none">
      <div className="max-w-[1440px] mx-auto px-6 sm:px-10 lg:px-12 py-12 md:py-16">
        {/* Four columns on desktop, stacked on mobile */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12 text-xs md:text-[13px] font-sans">
          
          {/* Column 1: Logo + Copyright */}
          <div className="space-y-4 flex flex-col items-start">
            <BrandLogo variant="horizontal" size="md" />
            <p className="text-[#1C1417]/70 text-xs leading-relaxed max-w-xs pt-1">
              Curated luxury Indian fashion & handcrafted ethnic wear for women and girls.
            </p>
            <p className="text-[#1C1417]/60 text-[11px] pt-2">
              © 2026 The Girls Collections. All Rights Reserved.
            </p>
          </div>

          {/* Column 2: About Us */}
          <div className="space-y-3.5">
            <h4 className="text-xs font-serif font-bold uppercase tracking-[0.16em] text-[#1C1417]">
              About Us
            </h4>
            <ul className="space-y-2.5 text-[#1C1417]/75">
              <li>
                <Link href="/about" className="hover:text-[#C5A059] transition-colors">
                  Our Story
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-[#C5A059] transition-colors">
                  Blog
                </Link>
              </li>
            </ul>

            {/* Social Line Icons (Facebook, Instagram, Pinterest, YouTube) */}
            <div className="pt-3">
              <span className="block text-[10px] font-sans font-bold uppercase tracking-widest text-[#1C1417]/50 mb-2">
                Follow Us
              </span>
              <div className="flex items-center space-x-3.5 text-[#1C1417]/80">
                {/* Facebook */}
                <a
                  href="#"
                  aria-label="Facebook"
                  className="w-8 h-8 rounded-full border border-[#EAE5DE] flex items-center justify-center hover:text-[#C5A059] hover:border-[#C5A059] transition-colors"
                >
                  <svg
                    className="w-4 h-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.75"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                  </svg>
                </a>

                {/* Instagram */}
                <a
                  href="#"
                  aria-label="Instagram"
                  className="w-8 h-8 rounded-full border border-[#EAE5DE] flex items-center justify-center hover:text-[#C5A059] hover:border-[#C5A059] transition-colors"
                >
                  <svg
                    className="w-4 h-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.75"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                  </svg>
                </a>

                {/* Pinterest */}
                <a
                  href="#"
                  aria-label="Pinterest"
                  className="w-8 h-8 rounded-full border border-[#EAE5DE] flex items-center justify-center hover:text-[#C5A059] hover:border-[#C5A059] transition-colors"
                >
                  <svg
                    className="w-4 h-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.75"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 2C6.48 2 2 6.48 2 12c0 4.24 2.65 7.86 6.39 9.29-.09-.78-.17-1.98.04-2.83.19-.77 1.25-5.3 1.25-5.3s-.32-.64-.32-1.58c0-1.48.86-2.59 1.93-2.59.91 0 1.35.68 1.35 1.5 0 .91-.58 2.28-.88 3.55-.25 1.06.53 1.93 1.58 1.93 1.9 0 3.36-2 3.36-4.89 0-2.56-1.84-4.35-4.47-4.35-3.05 0-4.84 2.29-4.84 4.65 0 .92.35 1.91.8 2.45.09.11.1.2.07.32-.08.33-.26 1.06-.3 1.21-.05.2-.17.24-.38.15-1.44-.67-2.34-2.77-2.34-4.46 0-3.63 2.64-6.97 7.61-6.97 3.99 0 7.1 2.85 7.1 6.66 0 3.97-2.5 7.17-5.98 7.17-1.17 0-2.27-.61-2.64-1.33l-.72 2.74c-.26 1-.96 2.25-1.43 3.01.99.31 2.04.47 3.13.47 5.52 0 10-4.48 10-10S17.52 2 12 2z" />
                  </svg>
                </a>

                {/* YouTube */}
                <a
                  href="#"
                  aria-label="YouTube"
                  className="w-8 h-8 rounded-full border border-[#EAE5DE] flex items-center justify-center hover:text-[#C5A059] hover:border-[#C5A059] transition-colors"
                >
                  <svg
                    className="w-4 h-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.75"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z" />
                    <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" />
                  </svg>
                </a>
              </div>
            </div>
          </div>

          {/* Column 3: Quick Links */}
          <div className="space-y-3.5">
            <h4 className="text-xs font-serif font-bold uppercase tracking-[0.16em] text-[#1C1417]">
              Quick Links
            </h4>
            <ul className="space-y-2.5 text-[#1C1417]/75">
              <li>
                <Link
                  href="/policies/shipping-and-delivery-policy"
                  className="hover:text-[#C5A059] transition-colors"
                >
                  Shipping &amp; Delivery
                </Link>
              </li>
              <li>
                <Link
                  href="/policies/refund-return-exchange-policy"
                  className="hover:text-[#C5A059] transition-colors"
                >
                  Returns &amp; Cancellation
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-[#C5A059] transition-colors">
                  FAQs
                </Link>
              </li>
              <li>
                <Link
                  href="/policies/privacy-policy"
                  className="hover:text-[#C5A059] transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/policies/terms-and-conditions"
                  className="hover:text-[#C5A059] transition-colors"
                >
                  Terms &amp; Conditions
                </Link>
              </li>
              <li>
                <Link href="/track" className="hover:text-[#C5A059] transition-colors">
                  Track Orders
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Contact */}
          <div className="space-y-3.5">
            <h4 className="text-xs font-serif font-bold uppercase tracking-[0.16em] text-[#1C1417]">
              Contact
            </h4>
            <ul className="space-y-2.5 text-[#1C1417]/75">
              <li>
                <Link href="/contact" className="hover:text-[#C5A059] transition-colors">
                  Find a Store
                </Link>
              </li>
              <li>
                <a
                  href={`mailto:${EMAIL_HERE}`}
                  className="hover:text-[#C5A059] transition-colors break-all"
                >
                  {EMAIL_HERE}
                </a>
              </li>
              <li>
                <a
                  href={`tel:${PHONE_HERE.replace(/\s+/g, '')}`}
                  className="hover:text-[#C5A059] transition-colors"
                >
                  {PHONE_HERE}
                </a>
              </li>
              <li className="pt-2 text-[11px] text-[#1C1417]/60 whitespace-pre-line leading-relaxed">
                {HOURS_HERE}
              </li>
            </ul>
          </div>

        </div>
      </div>
    </footer>
  );
}
