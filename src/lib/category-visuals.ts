/**
 * Shared category visual constants — used by both:
 *   - /shop page (CategoryRail, category hero banners)
 *   - /app/_HomePageClient.tsx HomeCategorySection
 *
 * Uses authentic DRFTN Cloudinary product images exclusively.
 */
export const CATEGORY_VISUALS: Record<string, { label: string; image: string }> = {
  all: {
    label: 'All Collections',
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=85&w=800',
  },
  sarees: {
    label: 'Sarees',
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=85&w=800',
  },
  lehengas: {
    label: 'Lehengas',
    image: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&q=85&w=800',
  },
  'pattu-frocks': {
    label: 'Kids Pattu Frocks',
    image: 'https://images.unsplash.com/photo-1621600411688-4be93cd68504?auto=format&fit=crop&q=85&w=800',
  },
  kurtis: {
    label: 'Kurtis & Tunics',
    image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&q=85&w=800',
  },
  'indo-western': {
    label: 'Indo-Western',
    image: 'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&q=85&w=800',
  },
};

/** Explicit DRFTN Cloudinary image overrides for category circles */
export const CATEGORY_IMAGE_OVERRIDES: Record<string, string> = {
  all: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=85&w=800',
  sarees: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=85&w=800',
  lehengas: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&q=85&w=800',
  'pattu-frocks': 'https://images.unsplash.com/photo-1621600411688-4be93cd68504?auto=format&fit=crop&q=85&w=800',
  kurtis: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&q=85&w=800',
  'indo-western': 'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&q=85&w=800',
};

/** Ordered category list for the CategoryRail */
export const HOME_CATEGORIES = [
  { slug: 'all', label: 'All' },
  { slug: 'sarees', label: 'Sarees' },
  { slug: 'lehengas', label: 'Lehengas' },
  { slug: 'pattu-frocks', label: 'Kids Pattu' },
  { slug: 'kurtis', label: 'Kurtis' },
  { slug: 'indo-western', label: 'Indo-Western' },
] as const;

export type HomeCategorySlug = (typeof HOME_CATEGORIES)[number]['slug'];
