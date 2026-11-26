'use client';

import React from 'react';
import Link from 'next/link';
import { googleReviews, GOOGLE_MAPS_REVIEWS_URL, GoogleReview } from '@/content/reviews';
import { siteConfig } from '@/lib/siteConfig';
import { Heart, ExternalLink } from 'lucide-react';

// Google "G" Mark as inline SVG (standard brand colors)
export const GoogleGIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
    <path
      fill="#4285F4"
      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
    />
    <path
      fill="#34A853"
      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"
    />
    <path
      fill="#FBBC05"
      d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
    />
    <path
      fill="#EA4335"
      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
    />
  </svg>
);

// 5 Gold Stars
const StarRating: React.FC = () => (
  <div className="flex items-center gap-0.5 text-[#C5A059]" aria-label="5 out of 5 stars">
    {[...Array(5)].map((_, i) => (
      <svg key={i} className="w-3.5 h-3.5 fill-current" viewBox="0 0 20 20">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ))}
  </div>
);

// Individual Review Card Component
const ReviewCard: React.FC<{ review: GoogleReview }> = ({ review }) => (
  <div className="bg-[#FCFAF8] rounded-2xl border border-[#B8903A]/20 p-5 shadow-xs flex flex-col justify-between hover:shadow-md hover:border-[#B8903A]/40 transition-all duration-300">
    <div className="space-y-3">
      {/* Top Row: Avatar Initial, Name, Google Badge */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-[#FCF5F5] border border-[#B8903A]/30 flex items-center justify-center font-sans font-medium text-xs text-[#1A1E3A]">
            {review.initial}
          </div>
          <div>
            <h4 className="font-sans font-semibold text-sm text-[#1A1E3A] leading-tight">
              {review.authorName}
            </h4>
            <span className="text-[10px] text-gray-500 font-sans block">
              {review.relativeTime}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white border border-[#EAE5DE] text-[10px] font-sans font-normal text-gray-600 tracking-wide shrink-0">
          <GoogleGIcon className="w-3 h-3" />
          <span>Google</span>
        </div>
      </div>

      {/* 5 Stars */}
      <StarRating />

      {/* Review Body */}
      <p className="text-[16px] font-sans font-normal text-[#1C1417]/80 leading-relaxed">
        &ldquo;{review.text}&rdquo;
      </p>
    </div>

    {/* Bottom Row: Heart Count */}
    <div className="pt-3 mt-3 border-t border-[#FAF5EE] flex items-center justify-between text-[11px] text-gray-400">
      <span className="text-[10px] font-sans uppercase tracking-[0.14em] text-[#B8903A] font-medium">
        Verified Review
      </span>
      <div className="flex items-center gap-1 text-rose-500/80">
        <Heart className="w-3 h-3 fill-rose-500/30 text-rose-500" />
        <span className="font-mono text-[11px]">{review.hearts}</span>
      </div>
    </div>
  </div>
);

export const GoogleReviewsSection: React.FC = () => {
  // Split 10 reviews into 3 columns for desktop marquee
  const col1 = [googleReviews[0], googleReviews[1], googleReviews[2], googleReviews[9]];
  const col2 = [googleReviews[3], googleReviews[4], googleReviews[5]];
  const col3 = [googleReviews[6], googleReviews[7], googleReviews[8]];

  // Build JSON-LD structured data for Google Reviews without aggregateRating
  const reviewsJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ClothingStore',
    name: siteConfig.legalName,
    address: {
      '@type': 'PostalAddress',
      streetAddress: '3, NAT Street, DV Gundappa Rd, Gandhi Bazaar',
      addressLocality: 'Basavanagudi, Bengaluru',
      addressRegion: 'Karnataka',
      postalCode: '560004',
      addressCountry: 'IN',
    },
    telephone: siteConfig.telLink,
    review: googleReviews.map((rev) => ({
      '@type': 'Review',
      author: {
        '@type': 'Person',
        name: rev.authorName,
      },
      reviewRating: {
        '@type': 'Rating',
        ratingValue: '5',
        bestRating: '5',
      },
      reviewBody: rev.text,
    })),
  };

  return (
    <section className="w-full bg-[#FAF8F5] py-12 sm:py-16 select-none border-t border-[#EAE5DE]">
      {/* Review JSON-LD without invented aggregateRating */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(reviewsJsonLd) }}
      />

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* ── Section Header ── */}
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-[#EAE5DE] shadow-2xs">
              <GoogleGIcon className="w-3.5 h-3.5" />
              <span className="text-[11px] font-sans font-normal text-gray-700 tracking-wider uppercase">
                Rated on Google
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-serif font-semibold text-[#1A1E3A] tracking-tight">
              Loved by Bengaluru
            </h2>
            <p className="text-xs sm:text-sm text-[#1C1417]/70 font-sans font-normal max-w-lg leading-relaxed">
              Authentic experiences shared by our cherished boutique guests and online patrons.
            </p>
          </div>

          {/* Outbound Link to Google Maps Reviews */}
          <a
            href={GOOGLE_MAPS_REVIEWS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-[#1A1E3A] hover:text-[#B8903A] border-b border-[#1A1E3A]/40 pb-0.5 transition-colors group"
          >
            <span>See all reviews on Google</span>
            <ExternalLink className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </a>
        </div>

        {/* ── MOBILE: Horizontal Scroll-Snap Carousel (~85% width cards) ── */}
        <div className="sm:hidden -mx-4 px-4 overflow-x-auto flex gap-4 snap-x snap-mandatory no-scrollbar pb-3">
          {googleReviews.map((rev) => (
            <div
              key={rev.id}
              className="w-[85vw] max-w-[320px] shrink-0 snap-center"
            >
              <ReviewCard review={rev} />
            </div>
          ))}
        </div>

        {/* ── DESKTOP: 3-Column Auto-Scrolling Marquee with Hover Pause ── */}
        <div className="hidden sm:block relative overflow-hidden max-h-[560px] group/marquee">
          {/* Top & Bottom gradient fade masks for seamless luxury appearance */}
          <div className="absolute top-0 inset-x-0 h-12 bg-gradient-to-b from-[#FAF8F5] to-transparent z-10 pointer-events-none" />
          <div className="absolute bottom-0 inset-x-0 h-12 bg-gradient-to-t from-[#FAF8F5] to-transparent z-10 pointer-events-none" />

          <div className="grid grid-cols-3 gap-5">
            {/* Column 1 */}
            <div className="space-y-5 animate-marquee-vertical group-hover/marquee:[animation-play-state:paused] motion-reduce:animate-none">
              {[...col1, ...col1].map((rev, i) => (
                <ReviewCard key={`${rev.id}-${i}`} review={rev} />
              ))}
            </div>

            {/* Column 2 (Offset animation duration) */}
            <div className="space-y-5 animate-marquee-vertical-slow group-hover/marquee:[animation-play-state:paused] motion-reduce:animate-none">
              {[...col2, ...col2].map((rev, i) => (
                <ReviewCard key={`${rev.id}-${i}`} review={rev} />
              ))}
            </div>

            {/* Column 3 */}
            <div className="space-y-5 animate-marquee-vertical group-hover/marquee:[animation-play-state:paused] motion-reduce:animate-none">
              {[...col3, ...col3].map((rev, i) => (
                <ReviewCard key={`${rev.id}-${i}`} review={rev} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default GoogleReviewsSection;
