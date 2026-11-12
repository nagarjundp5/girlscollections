export interface CategoryLike {
  slug: string;
  group?: 'women' | 'kids' | string;
  target?: 'women' | 'kids' | string;
  name?: string;
}

// Canonical slug mappings between display/legacy circle slugs and DB category slugs
const CANONICAL_KIDS_CATEGORY_MAP: Record<string, string> = {
  'western-bodycon': 'bodycon-dresses-for-kids',
  'bodycon': 'bodycon-dresses-for-kids',
  'bodycon-dresses-for-kids': 'bodycon-dresses-for-kids',
  'skirt-and-top': 'kids-western-skirt-and-top',
  'western-skirt-and-top': 'kids-western-skirt-and-top',
  'kids-western-skirt-and-top': 'kids-western-skirt-and-top',
  'lehenga-blouse-pattu-pavadai': 'lehenga-blouse-pattu-pavadai',
  'cotton-daily-frock': 'kids-cotton-daily-frock',
  'kids-cotton-daily-frock': 'kids-cotton-daily-frock',
  'traditional-gown': 'kids-traditional-gown-1-pc',
  'kids-traditional-gown-1-pc': 'kids-traditional-gown-1-pc',
  'party-wear-frock': 'kids-party-wear-frock',
  'kids-party-wear-frock': 'kids-party-wear-frock',
};

const CANONICAL_WOMEN_CATEGORY_MAP: Record<string, string> = {
  'skirt-and-top': 'skirt-and-top',
  'bodycon': 'western-bodycon',
  'western-bodycon': 'western-bodycon',
  'all-kurta-sets': 'all-kurta-sets',
  'anarkali-kurta-suit-sets': 'anarkali-kurta-suit-sets',
  'co-ord-set': 'co-ord-set',
  'lehenga-blouse-pattu-pavadai': 'lehenga-blouse-pattu-pavadai',
};

/**
 * Resolves any category slug to its canonical database slug for the given division.
 */
export function resolveCanonicalCategorySlug(categorySlug: string, division: 'women' | 'kids' | string): string {
  const cleanSlug = (categorySlug || '').toLowerCase().trim();
  const div = (division || 'women').toLowerCase();

  if (div === 'kids') {
    return CANONICAL_KIDS_CATEGORY_MAP[cleanSlug] || cleanSlug;
  }
  return CANONICAL_WOMEN_CATEGORY_MAP[cleanSlug] || cleanSlug;
}

/**
 * Single source of truth helper categoryHref(category, division).
 * Used by homepage circles, navigation drawer, search overlay, and footer.
 */
export function categoryHref(
  category: string | CategoryLike,
  division?: 'women' | 'kids' | string
): string {
  const rawSlug = typeof category === 'string' ? category : category?.slug || '';
  const div = (
    division ||
    (typeof category === 'object' ? category.group || category.target : undefined) ||
    'women'
  ).toLowerCase();

  const canonicalSlug = resolveCanonicalCategorySlug(rawSlug, div);
  return `/shop?category=${encodeURIComponent(canonicalSlug)}&target=${encodeURIComponent(div)}`;
}

