import type { Product } from '@/types';

export interface CategoryEditorialSlide {
  id: string;
  title: string;
  description: string;
  categorySlug: string;
  ctaText: string;
  cards: Product[];
}

/** The ONLY 4 categories allowed in The Edit — in this exact order */
const ALLOWED_CATEGORIES: Record<
  string,
  { title: string; description: string; ctaText: string; slug: string; aliases: string[] }
> = {
  anarkalis: {
    title: 'ANARKALIS & SUITS',
    description: 'Handwoven organza, silk & zari.\nTimeless Indian elegance.',
    ctaText: 'Explore Anarkalis',
    slug: 'anarkalis',
    aliases: ['anarkalis', 'anarkali', 'suits', 'suit-sets', 'organza'],
  },
  lehengas: {
    title: 'ROYAL LEHENGAS',
    description: 'Bespoke hand embroidery.\nCrafted for royal celebrations.',
    ctaText: 'Discover Lehengas',
    slug: 'lehengas',
    aliases: ['lehengas', 'lehenga', 'choli', 'wedding-guest', 'bridesmaid-edit'],
  },
  'pattu-frocks': {
    title: 'KIDS PATTU FROCKS',
    description: 'Pure Kanjeevaram silks.\n100% breathable cotton lining.',
    ctaText: 'View Pattu Frocks',
    slug: 'pattu-frocks',
    aliases: ['pattu-frocks', 'kids-pattu', 'kids-lehenga', 'kids', 'frocks'],
  },
  kurtis: {
    title: 'KURTA SETS & GOWNS',
    description: 'Flowing silhouettes.\nMoti & Gota Patti embellishments.',
    ctaText: 'Browse Kurta Sets',
    slug: 'kurtis',
    aliases: ['kurtis', 'kurta', 'indo-western', 'gowns', 'co-ords'],
  },
};

const CATEGORY_ORDER = ['anarkalis', 'lehengas', 'pattu-frocks', 'kurtis'];

/**
 * Builds exactly 4 editorial slides — one per allowed category.
 * Each slide shows EXACTLY 4 products (2×2 grid).
 * Matches by category + aliases, and backfills if fewer than 4 items exist for a category.
 */
export function buildCategoryEditorialSlides(products: Product[]): CategoryEditorialSlide[] {
  if (!products || products.length === 0) return [];

  const used = new Set<string>();
  const slides: CategoryEditorialSlide[] = [];

  for (const catKey of CATEGORY_ORDER) {
    const meta = ALLOWED_CATEGORIES[catKey];
    const catProducts: Product[] = [];

    // 1. Direct & Alias matching
    for (const p of products) {
      if (used.has(p.id)) continue;
      const cat = (p.category || '').toLowerCase().trim();
      const sub = (p.subcategory || '').toLowerCase().trim();
      const name = (p.name || '').toLowerCase().trim();

      const isMatch =
        meta.aliases.includes(cat) ||
        meta.aliases.includes(sub) ||
        meta.aliases.some((alias) => name.includes(alias));

      if (isMatch) {
        catProducts.push(p);
        used.add(p.id);
        if (catProducts.length === 4) break;
      }
    }

    // 2. Backfill if fewer than 4 matching products found
    if (catProducts.length < 4) {
      for (const p of products) {
        if (used.has(p.id)) continue;
        catProducts.push(p);
        used.add(p.id);
        if (catProducts.length === 4) break;
      }
    }

    if (catProducts.length > 0) {
      slides.push({
        id: `edit-${catKey}`,
        title: meta.title,
        description: meta.description,
        categorySlug: meta.slug,
        ctaText: meta.ctaText,
        cards: catProducts.slice(0, 4),
      });
    }
  }

  return slides;
}
