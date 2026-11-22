'use client';

import React from 'react';
import Link from 'next/link';
import BrandLogo from './BrandLogo';
import { siteConfig } from '@/lib/siteConfig';
import { MapPin, Phone, Mail } from 'lucide-react';

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
              Curated luxury Indian fashion &amp; handcrafted ethnic wear for women and girls.
            </p>
            <p className="text-[#1C1417]/60 text-[11px] pt-2">
              © {new Date().getFullYear()} {siteConfig.legalName}. All Rights Reserved.
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
                <Link href="/contact" className="hover:text-[#C5A059] transition-colors">
                  Visit Boutique
                </Link>
              </li>
              <li>
                <Link href="/faqs" className="hover:text-[#C5A059] transition-colors">
                  Help &amp; FAQs
                </Link>
              </li>
            </ul>

            {/* Social Line Icons (Facebook, Instagram, Pinterest, YouTube) */}
            <div className="pt-3">
              <span className="block text-[10px] font-sans font-bold uppercase tracking-widest text-[#1C1417]/50 mb-2">
                Follow Us
              </span>
              <div className="flex items-center space-x-3.5 text-[#1C1417]/80">
                {/* Instagram */}
                <a
                  href="https://www.instagram.com/thegirlscollections"
                  target="_blank"
                  rel="noopener noreferrer"
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

                {/* WhatsApp */}
                <a
                  href={siteConfig.whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="WhatsApp"
                  className="w-8 h-8 rounded-full border border-[#EAE5DE] flex items-center justify-center hover:text-[#25D366] hover:border-[#25D366] transition-colors"
                >
                  <svg
                    className="w-4 h-4"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2zm.01 1.67c2.2 0 4.26.86 5.82 2.42a8.225 8.225 0 0 1 2.41 5.83c0 4.54-3.7 8.24-8.24 8.24-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.186 8.186 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24zm4.8 11.63c-.26-.13-1.56-.77-1.8-.86-.24-.09-.42-.13-.6.13-.18.26-.69.86-.84 1.04-.16.17-.31.2-.58.06-.26-.13-1.11-.41-2.12-1.31-.79-.7-1.32-1.57-1.48-1.83-.15-.26-.02-.4.11-.53.12-.12.26-.31.4-.46.13-.15.17-.26.26-.44.09-.17.04-.33-.02-.46-.07-.13-.6-1.45-.83-1.99-.22-.52-.44-.45-.6-.46-.16-.01-.34-.01-.52-.01-.18 0-.48.07-.73.34-.25.27-.97.95-.97 2.31s.99 2.68 1.13 2.86c.13.19 1.95 2.97 4.72 4.17.66.29 1.18.46 1.58.59.66.21 1.27.18 1.74.11.53-.08 1.56-.64 1.78-1.25.22-.61.22-1.14.16-1.25-.07-.11-.25-.18-.51-.31z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>

          {/* Column 3: Quick Links / Policies */}
          <div className="space-y-3.5">
            <h4 className="text-xs font-serif font-bold uppercase tracking-[0.16em] text-[#1C1417]">
              Customer Care &amp; Policies
            </h4>
            <ul className="space-y-2.5 text-[#1C1417]/75">
              <li>
                <Link
                  href="/shipping-and-delivery"
                  className="hover:text-[#C5A059] transition-colors"
                >
                  Shipping &amp; Delivery
                </Link>
              </li>
              <li>
                <Link
                  href="/returns-and-exchange"
                  className="hover:text-[#C5A059] transition-colors"
                >
                  Returns &amp; Exchange (No Online Exchange)
                </Link>
              </li>
              <li>
                <Link href="/faqs" className="hover:text-[#C5A059] transition-colors">
                  FAQs &amp; Help
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy-policy"
                  className="hover:text-[#C5A059] transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms-and-conditions"
                  className="hover:text-[#C5A059] transition-colors"
                >
                  Terms &amp; Conditions
                </Link>
              </li>
              <li>
                <Link href="/track" className="hover:text-[#C5A059] transition-colors">
                  Track Orders (AWB)
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Contact & Flagship Boutique */}
          <div className="space-y-3.5">
            <h4 className="text-xs font-serif font-bold uppercase tracking-[0.16em] text-[#1C1417]">
              Flagship Boutique
            </h4>
            <ul className="space-y-2.5 text-[#1C1417]/75">
              <li>
                <a
                  href={siteConfig.mapsLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-2 hover:text-[#C5A059] transition-colors leading-relaxed group"
                >
                  <MapPin className="w-4 h-4 text-[#C5A059] shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                  <span>{siteConfig.address}</span>
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${siteConfig.email}`}
                  className="flex items-center gap-2 hover:text-[#C5A059] transition-colors break-all"
                >
                  <Mail className="w-3.5 h-3.5 text-[#C5A059] shrink-0" />
                  <span>{siteConfig.email}</span>
                </a>
              </li>
              <li>
                <a
                  href={`tel:${siteConfig.telLink}`}
                  className="flex items-center gap-2 hover:text-[#C5A059] transition-colors font-medium"
                >
                  <Phone className="w-3.5 h-3.5 text-[#C5A059] shrink-0" />
                  <span>+91 {siteConfig.phone}</span>
                </a>
              </li>
              <li className="pt-2 text-[11px] text-[#1C1417]/60 whitespace-pre-line leading-relaxed">
                {siteConfig.hours}
              </li>
            </ul>
          </div>

        </div>

        {/* Small "Policies" link row at footer bottom */}
        <div className="mt-12 pt-6 border-t border-[#EAE5DE] flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-[#1C1417]/60">
          <p>
            {siteConfig.legalName} • Basavanagudi, Bengaluru, Karnataka
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 font-medium">
            <Link href="/terms-and-conditions" className="hover:text-[#1A1E3A] hover:underline transition-colors">
              Terms &amp; Conditions
            </Link>
            <span>•</span>
            <Link href="/privacy-policy" className="hover:text-[#1A1E3A] hover:underline transition-colors">
              Privacy Policy
            </Link>
            <span>•</span>
            <Link href="/shipping-and-delivery" className="hover:text-[#1A1E3A] hover:underline transition-colors">
              Shipping &amp; Delivery
            </Link>
            <span>•</span>
            <Link href="/returns-and-exchange" className="hover:text-[#1A1E3A] hover:underline transition-colors">
              Returns &amp; Exchange
            </Link>
            <span>•</span>
            <Link href="/faqs" className="hover:text-[#1A1E3A] hover:underline transition-colors">
              FAQs
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
