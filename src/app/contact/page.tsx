'use client';

import React, { useState } from 'react';
import { db } from '@/lib/db';
import { useToast } from '@/components/ToastContainer';
import { siteConfig } from '@/lib/siteConfig';
import { MapPin, Phone, Mail, Send, MessageCircle } from 'lucide-react';

export default function ContactPage() {
  const { addToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      return addToast('Please fill in all fields', 'error');
    }
    setIsSubmitting(true);

    try {
      // 1. Record message to database (fire and forget)
      db.createContactSubmission(formData).catch((err) => {
        console.warn('Database contact record warning:', err);
      });

      // 2. Prepare pre-filled WhatsApp message to siteConfig phone
      const messageText = `Hello The Girls Collections!%0A%0A*Name:* ${encodeURIComponent(formData.name.trim())}%0A*Email:* ${encodeURIComponent(formData.email.trim())}%0A*Message:* ${encodeURIComponent(formData.message.trim())}`;
      const whatsappUrl = `https://wa.me/${siteConfig.whatsappNumber}?text=${messageText}`;

      addToast('Opening WhatsApp to send your message...', 'success');

      // 3. Open WhatsApp in new window
      window.open(whatsappUrl, '_blank');

      setFormData({ name: '', email: '', message: '' });
    } catch (error) {
      console.error(error);
      addToast('Failed to prepare WhatsApp message. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-6 md:px-12 py-16 animate-fade-in text-[#1C1417]">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
        {/* Left Col: Contact Info */}
        <div className="space-y-12">
          <div>
            <span className="text-xs uppercase font-bold tracking-[0.2em] text-[#B8903A] mb-2 block">
              Customer Concierge
            </span>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-[#1A1E3A] mb-4">
              Get in Touch
            </h1>
            <p className="text-[#1C1417]/70 text-sm leading-relaxed max-w-sm">
              Whether you have a question about sizing, custom alterations, order status, or boutique visits, drop us a line below or reach out directly.
            </p>
          </div>

          <div className="space-y-6">
            {/* Location */}
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-[#FCF5F5] rounded-xl flex items-center justify-center border border-[#B8903A]/25 shrink-0">
                <MapPin className="w-5 h-5 text-[#B8903A]" />
              </div>
              <div className="space-y-1">
                <h3 className="text-xs font-serif font-bold uppercase tracking-wider text-[#1A1E3A]">
                  Flagship Boutique
                </h3>
                <a
                  href={siteConfig.mapsLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#1C1417]/80 text-xs sm:text-sm hover:text-[#B8903A] transition-colors leading-relaxed block"
                >
                  {siteConfig.address}
                </a>
              </div>
            </div>

            {/* Phone */}
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-[#FCF5F5] rounded-xl flex items-center justify-center border border-[#B8903A]/25 shrink-0">
                <Phone className="w-5 h-5 text-[#B8903A]" />
              </div>
              <div className="space-y-1">
                <h3 className="text-xs font-serif font-bold uppercase tracking-wider text-[#1A1E3A]">
                  Phone &amp; WhatsApp
                </h3>
                <a
                  href={`tel:${siteConfig.telLink}`}
                  className="text-[#1C1417]/80 text-xs sm:text-sm hover:text-[#B8903A] transition-colors font-medium block"
                >
                  +91 {siteConfig.phone}
                </a>
                <a
                  href={siteConfig.whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-emerald-700 hover:text-emerald-800 font-semibold inline-flex items-center gap-1"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>Chat on WhatsApp</span>
                </a>
              </div>
            </div>

            {/* Email */}
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-[#FCF5F5] rounded-xl flex items-center justify-center border border-[#B8903A]/25 shrink-0">
                <Mail className="w-5 h-5 text-[#B8903A]" />
              </div>
              <div className="space-y-1">
                <h3 className="text-xs font-serif font-bold uppercase tracking-wider text-[#1A1E3A]">
                  Email Support
                </h3>
                <a
                  href={`mailto:${siteConfig.email}`}
                  className="text-[#1C1417]/80 text-xs sm:text-sm hover:text-[#B8903A] transition-colors break-all block"
                >
                  {siteConfig.email}
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: Contact Form */}
        <div className="bg-white border border-[#EAE5DE] rounded-3xl p-8 md:p-10 shadow-xs">
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#1A1E3A] mb-6">
            Send a Message
          </h2>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-xs uppercase tracking-wider text-[#1C1417]/70 font-semibold block">
                Your Name
              </label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="Full Name"
                className="w-full bg-[#FAF8F5] border border-[#EAE5DE] px-4 py-3 text-xs sm:text-sm text-[#1C1417] focus:outline-none focus:border-[#1A1E3A] rounded-xl"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs uppercase tracking-wider text-[#1C1417]/70 font-semibold block">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="you@domain.com"
                className="w-full bg-[#FAF8F5] border border-[#EAE5DE] px-4 py-3 text-xs sm:text-sm text-[#1C1417] focus:outline-none focus:border-[#1A1E3A] rounded-xl"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs uppercase tracking-wider text-[#1C1417]/70 font-semibold block">
                Message
              </label>
              <textarea
                name="message"
                required
                rows={4}
                value={formData.message}
                onChange={handleChange}
                placeholder="Tell us what you need help with..."
                className="w-full bg-[#FAF8F5] border border-[#EAE5DE] px-4 py-3 text-xs sm:text-sm text-[#1C1417] focus:outline-none focus:border-[#1A1E3A] rounded-xl resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#1A1E3A] hover:bg-[#121528] text-white py-4 font-semibold uppercase tracking-[0.16em] text-xs transition-colors shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 rounded-xl"
            >
              <Send className="w-4 h-4 text-[#B8903A]" />
              <span>{isSubmitting ? 'Sending...' : 'Send Message'}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
