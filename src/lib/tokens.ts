/**
 * The Girls Collections — Design System Tokens
 * Unified spacing, motion system, and editorial typography scale.
 */

export const TOKENS = {
  // Mobile & Desktop Spacing Systems
  spacing: {
    mobile: {
      pagePx: 'px-4 sm:px-6', // 16px / 24px
      sectionPy: 'py-12 sm:py-16', // 48px - 64px
      gap: 'gap-4 sm:gap-6', // 16px - 24px
    },
    desktop: {
      maxWidth: 'max-w-[1440px]',
      pagePx: 'lg:px-12 xl:px-16', // 48px - 64px
      sectionPy: 'md:py-20 lg:py-24', // 80px - 96px
      gap: 'gap-6 lg:gap-8', // 24px - 32px
    },
  },

  // Motion Durations & Easing Curves
  motion: {
    easeLuxury: [0.16, 1, 0.3, 1], // Smooth cubic bezier
    easeFast: [0.25, 0.1, 0.25, 1.0],

    durationFast: 0.2, // 200ms
    durationComponent: 0.35, // 350ms
    durationEditorial: 0.5, // 500ms
    staggerOffset: 0.08, // 80ms entrance stagger
  },

  // Standardized Editorial Typography Scale (Taruni-inspired confidence)
  typography: {
    // 1. Kicker / Eyebrow: 11-12px, uppercase, tracked +0.2em, General Sans medium, muted tone
    kicker: 'font-sans font-bold text-[11px] sm:text-xs text-zariGold tracking-[0.2em] uppercase',
    kickerMuted: 'font-sans font-semibold text-[11px] sm:text-xs text-inkNavy/60 tracking-[0.2em] uppercase',
    
    // 2. Section Title: Upright Fraunces, 32-40px mobile / 48-56px desktop, bold, tight tracking
    sectionTitle: 'font-serif font-bold text-3xl sm:text-4xl lg:text-5xl text-inkNavy tracking-tight leading-[1.15]',
    
    // 3. Section Subtitle: General Sans, 15-16px, muted tone, relaxed line-height
    sectionSubtitle: 'font-sans text-sm sm:text-base text-inkNavy/70 leading-relaxed max-w-xl',

    // 4. Card Title: Upright Fraunces, 20-24px, font-bold
    cardTitle: 'font-serif font-bold text-xl sm:text-2xl text-inkNavy tracking-tight leading-snug',
    cardTitleLight: 'font-serif font-bold text-xl sm:text-2xl text-ivory tracking-tight leading-snug',

    // 5. Card Subtitle / Meta: General Sans, 13-14px, muted
    cardSubtitle: 'font-sans text-xs sm:text-sm text-inkNavy/60 font-normal leading-normal',
    cardSubtitleLight: 'font-sans text-xs sm:text-sm text-ivory/80 font-light leading-normal',

    // 6. Prices & UI Labels: General Sans with tabular numbers
    price: 'font-sans font-bold text-inkNavy font-tnum text-sm sm:text-base',
    priceStrike: 'font-sans text-inkNavy/40 line-through font-normal text-xs font-tnum',
  },

  // Restraint & Surface Rules
  restraint: {
    cardBorder: 'border border-zariGold/20',
    cardBorderHover: 'hover:border-zariGold/50',
    cardRadius: 'rounded-2xl', // Modern soft-rounded corners
    subtleShadow: 'shadow-[0_4px_24px_rgba(13,14,26,0.06)]',
  },
};
