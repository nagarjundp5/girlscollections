'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, ShieldCheck, RefreshCw, Truck, Award, Scissors, Lock } from 'lucide-react';
import BrandLogo from './BrandLogo';
import ZariThread from '@/components/ui/ZariThread';

import NotificationBellWidget from './NotificationBellWidget';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail('');
    }
  };

  const trustItems = [
    {
      icon: ShieldCheck,
      title: 'Cash on Delivery',
      subtitle: 'Available Pan-India',
    },
    {
      icon: Truck,
      title: 'Express Shipping',
      subtitle: 'Dispatched in 24 Hours',
    },
    {
      icon: RefreshCw,
      title: 'Hassle-Free Returns',
      subtitle: 'Easy Doorstep Pickups',
    },
    {
      icon: Award,
      title: '100% Certified Fabrics',
      subtitle: 'Pure Silk & Handlooms',
    },
    {
      icon: Scissors,
      title: 'Custom Sizing',
      subtitle: 'Tailored to Fit You',
    },
    {
      icon: Lock,
      title: 'Secure Checkout',
      subtitle: '256-Bit Encrypted Payments',
    },
  ];

  return (
    <footer className="bg-navy text-ivory relative border-t border-zariGold/30 select-none">
      {/* Top Woven Pattern Border */}
      <ZariThread variant="footerWeave" />

      {/* HORIZONTAL TRUST STRIP */}
      <div className="bg-nearBlack border-b border-zariGold/20 py-8">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-12">
          <div
            className="flex sm:grid sm:grid-cols-3 lg:grid-cols-6 gap-6 overflow-x-auto no-scrollbar snap-x snap-mandatory py-1"
            style={{ WebkitOverflowScrolling: 'touch' }}
          >
            {trustItems.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={idx}
                  className="flex items-center gap-3 shrink-0 snap-start min-w-[190px] sm:min-w-0"
                >
                  <div className="w-10 h-10 rounded-full bg-zariGold/15 border border-zariGold/30 flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5 text-zariGold" />
                  </div>
                  <div>
                    <p className="font-sans font-bold text-xs text-ivory leading-snug">
                      {item.title}
                    </p>
                    <p className="font-sans text-[11px] text-ivory/60 leading-tight">
                      {item.subtitle}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* NEWSLETTER SECTION */}
      <div className="max-w-[1440px] mx-auto px-6 sm:px-12 py-16 border-b border-zariGold/20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-6 space-y-3">
            <span className="eyebrow-text text-zariGold">ROYAL INNER CIRCLE</span>
            <h3 className="text-2xl sm:text-4xl font-serif font-semibold text-ivory">
              Private Drop Invitations &amp; Festive Styling Guides
            </h3>
            <p className="text-xs font-sans text-ivory/70 mb-4">
              Receive 10% off your first handcrafted anarkali or kids ethnic ensemble.
            </p>
          </div>

          <div className="lg:col-span-6">
            {subscribed ? (
              <div className="p-4 rounded-[2px] bg-zariGold/15 border border-zariGold text-zariGold-light text-sm font-serif">
                ✨ Thank you for joining. Welcome to The Girls Collections inner circle.
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address..."
                  required
                  className="flex-1 px-5 py-4 rounded-[2px] bg-ivory text-inkNavy placeholder-inkNavy/50 focus:outline-none focus:ring-2 focus:ring-zariGold text-sm font-sans font-medium"
                />
                <button
                  type="submit"
                  className="px-8 py-4 rounded-[2px] btn-gold-gradient text-xs font-bold uppercase tracking-[0.2em] flex items-center justify-center space-x-2 cursor-pointer"
                >
                  <span>Subscribe</span>
                  <ArrowRight className="w-4 h-4 text-white" />
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* BROWSER DROP NOTIFICATION WIDGET */}
      <div className="max-w-[1440px] mx-auto px-6 sm:px-12 pt-8">
        <NotificationBellWidget />
      </div>

      {/* MAIN FOOTER COLUMNS */}
      <div className="max-w-[1440px] mx-auto px-6 sm:px-12 py-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10 border-b border-zariGold/20 text-xs font-sans">
        {/* Column 1: Brand Info */}
        <div className="lg:col-span-2 space-y-4">
          <BrandLogo variant="badge" size="lg" />
          <p className="text-ivory/75 leading-relaxed max-w-sm font-light">
            Curated D2C luxury Indian fashion brand specializing in traditional &amp; contemporary anarkalis, lehengas, 
            indo-western ensembles for women, and handcrafted pure silk pattu frocks for young girls.
          </p>
        </div>

        {/* Column 2: Shop */}
        <div className="space-y-3">
          <h4 className="text-xs font-serif font-bold text-zariGold uppercase tracking-[0.2em]">Shop</h4>
          <ul className="space-y-2.5 text-ivory/75 font-light">
            <li><Link href="/shop?category=anarkali-kurta-suit-sets" className="hover:text-zariGold transition-colors">Silk Anarkalis</Link></li>
            <li><Link href="/shop?category=all-kurta-sets" className="hover:text-zariGold transition-colors">Kurta Suit Sets</Link></li>
            <li><Link href="/shop?category=kids-lehenga-blouse-or-pattu-pavadai" className="hover:text-zariGold transition-colors">Kids Pattu Pavadai</Link></li>
            <li><Link href="/shop?category=party-wear-frocks" className="hover:text-zariGold transition-colors">Party Wear Frocks</Link></li>
          </ul>
        </div>

        {/* Column 3: Client Care */}
        <div className="space-y-3">
          <h4 className="text-xs font-serif font-bold text-zariGold uppercase tracking-[0.2em]">Client Care</h4>
          <ul className="space-y-2.5 text-ivory/75 font-light">
            <li><Link href="/track" className="hover:text-zariGold transition-colors">Track Order</Link></li>
            <li><Link href="/contact" className="hover:text-zariGold transition-colors">Styling Concierge</Link></li>
            <li><Link href="/policies/terms-and-conditions" className="hover:text-zariGold transition-colors font-medium text-zariGold">Terms &amp; Conditions</Link></li>
            <li><Link href="/policies/privacy-policy" className="hover:text-zariGold transition-colors">Privacy Policy</Link></li>
          </ul>
        </div>

        {/* Column 4: About */}
        <div className="space-y-3">
          <h4 className="text-xs font-serif font-bold text-zariGold uppercase tracking-[0.2em]">About</h4>
          <ul className="space-y-2.5 text-ivory/75 font-light">
            <li><Link href="/about" className="hover:text-zariGold transition-colors">Our Heritage</Link></li>
            <li><Link href="/about" className="hover:text-zariGold transition-colors">Artisan Craftsmanship</Link></li>
            <li><Link href="/contact" className="hover:text-zariGold transition-colors">Contact Us</Link></li>
          </ul>
        </div>
      </div>

      {/* COPYRIGHT & PAYMENT METHODS */}
      <div className="max-w-[1440px] mx-auto px-6 sm:px-12 py-6 flex flex-col sm:flex-row items-center justify-between text-[11px] text-ivory/60 space-y-4 sm:space-y-0">
        <p>© {new Date().getFullYear()} The Girls Collections. Custom Built with Quiet Luxury.</p>
        <div className="flex items-center space-x-3 text-zariGold font-sans text-[10px] tracking-widest uppercase">
          <span>RAZORPAY</span>
          <span>•</span>
          <span>UPI</span>
          <span>•</span>
          <span>VISA</span>
          <span>•</span>
          <span>MASTERCARD</span>
        </div>
      </div>
    </footer>
  );
}
