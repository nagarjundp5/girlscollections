/**
 * SHAPE RULE GUIDELINE:
 * - CIRCLES = Category / discovery navigation (e.g. CircularCategoryScroller)
 * - ARCHES = Heritage / editorial storytelling sections (e.g. The Edit / ShopByCategoryBento)
 * - RECTANGLES = Product / shopping grids (e.g. ProductRail, ProductGrid)
 */

export interface CategoryItem {
  id: string;
  slug: string;
  name: string;
  shortLabel?: string;
  displayLabel?: string;
  group: 'women' | 'kids';
  image: string | null;
  featured: boolean;
  featuredOrder?: number;
  description?: string;
}

export interface CategorySubItem {
  id: string;
  name: string;
  slug: string;
  description?: string;
}

export interface CategoryGroup {
  id: string;
  title: string;
  slug: string;
  items: CategorySubItem[];
}

export interface PrimaryCategory {
  id: string;
  name: string;
  slug: string;
  groups: CategoryGroup[];
}

// Canonical URL Generator helper
export function getCategoryHref(category: CategoryItem): string {
  return `/shop?category=${category.slug}&target=${category.group}`;
}

// Exact Client-Supplied Women Categories (17 items) — Full names strictly preserved
export const WOMEN_CATEGORIES: CategoryItem[] = [
  { id: 'all-kurta-sets', slug: 'all-kurta-sets', name: 'All Kurta Sets', displayLabel: 'KURTA SETS', group: 'women', image: '/categories/all-kurta-sets.webp', featured: true, featuredOrder: 1, description: 'Complete traditional & contemporary kurta suit ensembles' },
  { id: 'anarkali-kurta-suit-sets', slug: 'anarkali-kurta-suit-sets', name: 'Anarkali Kurta Suit Sets', displayLabel: 'ANARKALI', group: 'women', image: '/categories/anarkali-kurta-suit-sets.webp', featured: true, featuredOrder: 2, description: 'Royal flared Anarkalis with embellished dupattas' },
  { id: 'co-ord-set', slug: 'co-ord-set', name: 'Co-ord Set', displayLabel: 'CO-ORD SETS', group: 'women', image: '/categories/co-ord-set.webp', featured: true, featuredOrder: 3, description: 'Matching silk & festive co-ord trousers & tunic sets' },
  { id: 'skirt-and-top', slug: 'skirt-and-top', name: 'Skirt and Top', displayLabel: 'SKIRT & TOP', group: 'women', image: '/categories/skirt-and-top.webp', featured: true, featuredOrder: 4, description: 'Twirl-worthy skirts paired with embroidered cropped tops' },
  { id: 'straight-cut-kurta-suit-sets', slug: 'straight-cut-kurta-suit-sets', name: 'Straight Cut Kurta Suit Sets', group: 'women', image: null, featured: false, description: 'Sleek geometric straight-fit celebratory kurtas' },
  { id: 'palazzo-kurta-suit-sets', slug: 'palazzo-kurta-suit-sets', name: 'Palazzo Kurta Suit Sets', group: 'women', image: null, featured: false, description: 'Flowy wide-leg palazzo pants with tailored kurtis' },
  { id: 'a-line-kurta-sets', slug: 'a-line-kurta-sets', name: 'A-Line Kurta Sets', group: 'women', image: null, featured: false, description: 'Gracefully flared A-line cuts for versatile occasions' },
  { id: 'bottom-wear', slug: 'bottom-wear', name: 'Bottom Wear', group: 'women', image: null, featured: false, description: 'Pants, salwars, churidars & tailored festive trousers' },
  { id: '2-pc-kurta-set', slug: '2-pc-kurta-set', name: '2-Pc Kurta Set', group: 'women', image: null, featured: false, description: 'Curated 2-piece kurta and bottom pairings' },
  { id: 'western-short-tops-or-short-kurtis', slug: 'western-short-tops-or-short-kurtis', name: 'Western Short Tops or Short Kurtis', group: 'women', image: null, featured: false, description: 'Chic short kurtis & fusion western tops' },
  { id: 'only-kurta', slug: 'only-kurta', name: 'Only Kurta', group: 'women', image: null, featured: false, description: 'Standalone kurtas in silk, Chanderi & cotton' },
  { id: 'single-pc-long-anarkali', slug: 'single-pc-long-anarkali', name: 'Single-pc Long Anarkali', group: 'women', image: null, featured: false, description: 'Floor-length one-piece statement Anarkali gowns' },
  { id: 'long-jacket-kurta', slug: 'long-jacket-kurta', name: 'Long Jacket Kurta', group: 'women', image: null, featured: false, description: 'Layered jacket kurtas with zari motif highlights' },
  { id: 'plus-size-kurta-sets', slug: 'plus-size-kurta-sets', name: 'Plus Size Kurta Sets', group: 'women', image: null, featured: false, description: 'Inclusive curve-tailored festive kurta suit sets' },
  { id: 'plus-size-only-kurta', slug: 'plus-size-only-kurta', name: 'Plus Size Only Kurta', group: 'women', image: null, featured: false, description: 'Comfort-crafted plus size standalone kurtas' },
  { id: 'plus-size-short-kurta', slug: 'plus-size-short-kurta', name: 'Plus Size Short Kurta', group: 'women', image: null, featured: false, description: 'Versatile plus size short kurtis & tops' },
  { id: 'lehenga-blouse-or-pattu-pavadai', slug: 'lehenga-blouse-or-pattu-pavadai', name: 'Lehenga Blouse or Pattu Pavadai', group: 'women', image: null, featured: false, description: 'Traditional silk lehenga skirts & blouse drapes' },
];

// Exact Client-Supplied Kids Categories (22 items) — Full names strictly preserved
export const KIDS_CATEGORIES: CategoryItem[] = [
  { id: 'kids-lehenga-blouse-or-pattu-pavadai', slug: 'kids-lehenga-blouse-or-pattu-pavadai', name: 'Lehenga Blouse or Pattu Pavadai', displayLabel: 'LEHENGA & PATTU', group: 'kids', image: '/categories/kids-lehenga-blouse-or-pattu-pavadai.webp', featured: true, featuredOrder: 1, description: 'Pure silk Kanjeevaram Pattu Pavadai sets for young girls' },
  { id: 'kids-traditional-gown-1-pc', slug: 'kids-traditional-gown-1-pc', name: 'Traditional Gown – 1 Pc', displayLabel: 'TRADITIONAL GOWNS', group: 'kids', image: '/categories/kids-traditional-gown-1-pc.webp', featured: true, featuredOrder: 2, description: 'Single-piece traditional festive ethnic gowns' },
  { id: 'party-wear-frocks', slug: 'party-wear-frocks', name: 'Party Wear Frocks', displayLabel: 'PARTY WEAR FROCKS', group: 'kids', image: '/categories/party-wear-frocks.webp', featured: true, featuredOrder: 3, description: 'Tulle & organza layered birthday frocks' },
  { id: 'children-co-ord-set', slug: 'children-co-ord-set', name: 'Children Co-ord Set', displayLabel: 'KIDS CO-ORD SETS', group: 'kids', image: '/categories/children-co-ord-set.webp', featured: true, featuredOrder: 4, description: 'Matching printed & solid kids co-ord sets' },
  { id: 'kids-cotton-lehenga-blouse-or-cotton-pattu-pavadai', slug: 'kids-cotton-lehenga-blouse-or-cotton-pattu-pavadai', name: 'Cotton Lehenga Blouse or Cotton Pattu Pavadai', group: 'kids', image: null, featured: false, description: 'Soft breathable cotton Pattu Pavadai for daily celebrations' },
  { id: 'kids-lehenga-davani-or-lehengas', slug: 'kids-lehenga-davani-or-lehengas', name: 'Lehenga Davani or Lehengas', group: 'kids', image: null, featured: false, description: 'Miniature lehenga sets & twirl-worthy kids lehengas' },
  { id: 'children-anarkali-suit', slug: 'children-anarkali-suit', name: 'Children Anarkali Suits', group: 'kids', image: null, featured: false, description: 'Pre-stitched festive suit ensembles tailored for young girls' },
  { id: 'children-kurta-sets', slug: 'children-kurta-sets', name: 'Children Kurta Sets', group: 'kids', image: null, featured: false, description: 'Embroidered silk & cotton kurta suit sets' },
  { id: 'children-only-kurta', slug: 'children-only-kurta', name: 'Children Only Kurta', group: 'kids', image: null, featured: false, description: 'Standalone kurtis for casual & festive wear' },
  { id: 'children-leggings', slug: 'children-leggings', name: 'Children Leggings', group: 'kids', image: null, featured: false, description: 'Soft stretch cotton leggings for kids' },
  { id: 'traditional-frocks', slug: 'traditional-frocks', name: 'Traditional Frocks', group: 'kids', image: null, featured: false, description: 'Classic South Indian motif festive frocks' },
  { id: 'cotton-frocks-or-daily-wear-frocks', slug: 'cotton-frocks-or-daily-wear-frocks', name: 'Cotton Frocks or Daily Wear Frocks', group: 'kids', image: null, featured: false, description: 'Comfortable everyday printed cotton frocks' },
  { id: 'party-wear-gowns', slug: 'party-wear-gowns', name: 'Party Wear Gowns', group: 'kids', image: null, featured: false, description: 'Royal evening party gowns for special events' },
  { id: 'kids-sharara-set', slug: 'kids-sharara-set', name: 'Sharara Set', group: 'kids', image: null, featured: false, description: 'Playful tiered shararas with short kurtis' },
  { id: 'ghagra-choli', slug: 'ghagra-choli', name: 'Ghagra Choli', group: 'kids', image: null, featured: false, description: 'Colorful flared ghagras with embroidered blouses' },
  { id: 'crop-top-with-palazzo-3-pc-set', slug: 'crop-top-with-palazzo-3-pc-set', name: 'Crop Top with Palazzo – 3 Pc Set', group: 'kids', image: null, featured: false, description: 'Modern 3-piece crop top & palazzo set with shrug' },
  { id: 'dothi-set', slug: 'dothi-set', name: 'Dothi Set', group: 'kids', image: null, featured: false, description: 'Pre-draped dhoti pants paired with embellished tops' },
  { id: 'casual-frocks', slug: 'casual-frocks', name: 'Casual Frocks', group: 'kids', image: null, featured: false, description: 'Lightweight breezy casual frocks' },
  { id: 'bodycon-dresses-for-kids', slug: 'bodycon-dresses-for-kids', name: 'Bodycon Dresses for Kids', group: 'kids', image: null, featured: false, description: 'Stretch western dresses for young girls' },
  { id: 'denim-dresses-for-kids', slug: 'denim-dresses-for-kids', name: 'Denim Dresses for Kids', group: 'kids', image: null, featured: false, description: 'Durable denim pinafores & shirt dresses' },
  { id: 'kids-western-skirt-and-top', slug: 'kids-western-skirt-and-top', name: 'Western Skirt and Top', group: 'kids', image: null, featured: false, description: 'Contemporary western skirt and blouse duos' },
  { id: 'casual-palazzo-set', slug: 'casual-palazzo-set', name: 'Casual Palazzo Set', group: 'kids', image: null, featured: false, description: 'Relaxed everyday palazzo top pairings' },
];

export const ALL_CATEGORIES: CategoryItem[] = [
  ...WOMEN_CATEGORIES,
  ...KIDS_CATEGORIES,
];

export function getFeaturedCategories(group: 'women' | 'kids'): CategoryItem[] {
  const items = group === 'women' ? WOMEN_CATEGORIES : KIDS_CATEGORIES;
  return items
    .filter((cat) => cat.featured)
    .sort((a, b) => (a.featuredOrder || 99) - (b.featuredOrder || 99));
}

export interface OccasionBucket {
  id: string;
  title: string;
  slug: string;
  items: CategoryItem[];
}

// Backward-compatible exports for components referencing legacy types
export const WOMEN_TRADITIONAL_ITEMS: CategorySubItem[] = WOMEN_CATEGORIES.map((item) => ({
  id: item.id,
  name: item.name,
  slug: item.slug,
  description: item.description,
}));

export const WOMEN_FROCKS_WESTERN_ITEMS: CategorySubItem[] = [];

export const KIDS_ETHNIC_ITEMS: CategorySubItem[] = KIDS_CATEGORIES.map((item) => ({
  id: item.id,
  name: item.name,
  slug: item.slug,
  description: item.description,
}));

// Client-defined Occasion-based Buckets for Ladies (4 Columns)
export const WOMEN_BUCKETS: OccasionBucket[] = [
  {
    id: 'women-ethnic',
    title: 'Ethnic Wear',
    slug: 'ethnic-wear',
    items: WOMEN_CATEGORIES.filter((c) => [
      'all-kurta-sets',
      'anarkali-kurta-suit-sets',
      'straight-cut-kurta-suit-sets',
      'palazzo-kurta-suit-sets',
      'a-line-kurta-sets',
      '2-pc-kurta-set',
      'only-kurta',
      'long-jacket-kurta',
    ].includes(c.id)),
  },
  {
    id: 'women-party',
    title: 'Party Wear',
    slug: 'party-wear',
    items: WOMEN_CATEGORIES.filter((c) => [
      'single-pc-long-anarkali',
      'lehenga-blouse-or-pattu-pavadai',
    ].includes(c.id)),
  },
  {
    id: 'women-casual-western',
    title: 'Casual / Western',
    slug: 'casual-western',
    items: WOMEN_CATEGORIES.filter((c) => [
      'co-ord-set',
      'skirt-and-top',
      'bottom-wear',
      'western-short-tops-or-short-kurtis',
    ].includes(c.id)),
  },
  {
    id: 'women-plus-size',
    title: 'Plus Size',
    slug: 'plus-size',
    items: WOMEN_CATEGORIES.filter((c) => [
      'plus-size-kurta-sets',
      'plus-size-only-kurta',
      'plus-size-short-kurta',
    ].includes(c.id)),
  },
];

// Client-defined Occasion-based Buckets for Kids (3 Columns)
export const KIDS_BUCKETS: OccasionBucket[] = [
  {
    id: 'kids-ethnic',
    title: 'Ethnic Wear',
    slug: 'ethnic-wear',
    items: KIDS_CATEGORIES.filter((c) => [
      'children-kurta-sets',
      'children-only-kurta',
      'children-anarkali-suit',
      'kids-lehenga-blouse-or-pattu-pavadai',
      'kids-cotton-lehenga-blouse-or-cotton-pattu-pavadai',
      'kids-lehenga-davani-or-lehengas',
      'kids-sharara-set',
      'ghagra-choli',
      'dothi-set',
    ].includes(c.id)),
  },
  {
    id: 'kids-party',
    title: 'Party Wear',
    slug: 'party-wear',
    items: KIDS_CATEGORIES.filter((c) => [
      'kids-traditional-gown-1-pc',
      'party-wear-frocks',
      'party-wear-gowns',
      'traditional-frocks',
    ].includes(c.id)),
  },
  {
    id: 'kids-casual-western',
    title: 'Casual / Western',
    slug: 'casual-western',
    items: KIDS_CATEGORIES.filter((c) => [
      'cotton-frocks-or-daily-wear-frocks',
      'casual-frocks',
      'children-leggings',
      'bodycon-dresses-for-kids',
      'denim-dresses-for-kids',
      'kids-western-skirt-and-top',
      'casual-palazzo-set',
      'children-co-ord-set',
      'crop-top-with-palazzo-3-pc-set',
    ].includes(c.id)),
  },
];

export const CATEGORY_TAXONOMY: PrimaryCategory[] = [
  {
    id: 'women',
    name: 'Women',
    slug: 'women',
    groups: WOMEN_BUCKETS.map((b) => ({
      id: b.id,
      title: b.title,
      slug: b.slug,
      items: b.items.map((i) => ({
        id: i.id,
        name: i.name,
        slug: i.slug,
        description: i.description,
      })),
    })),
  },
  {
    id: 'kids',
    name: 'Kids Ethnic',
    slug: 'kids',
    groups: KIDS_BUCKETS.map((b) => ({
      id: b.id,
      title: b.title,
      slug: b.slug,
      items: b.items.map((i) => ({
        id: i.id,
        name: i.name,
        slug: i.slug,
        description: i.description,
      })),
    })),
  },
];

export const SHOP_BY_CATEGORY_ITEMS = WOMEN_CATEGORIES.filter((c) => c.featured).map((c) => ({
  id: c.id,
  name: c.name,
  slug: c.slug,
  image: c.image,
}));

export const SHOP_BY_EDIT_ITEMS = [
  {
    id: 'timeless-reds',
    title: 'Timeless Reds',
    subtitle: 'Auspicious vermillion & crimson silk ensembles',
    image: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&q=85&w=800',
    slug: 'timeless-reds',
  },
  {
    id: 'iconic-ivory',
    title: 'Iconic Ivory',
    subtitle: 'Chantilly lacework & organza weaves',
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=85&w=800',
    slug: 'iconic-ivory',
  },
  {
    id: 'bridesmaid-edit',
    title: 'The Bridesmaid Edit',
    subtitle: 'Flared lehengas & embroidered jacket gowns',
    image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&q=85&w=800',
    slug: 'bridesmaid-edit',
  },
  {
    id: 'handmade-details',
    title: 'Handmade Details',
    subtitle: 'Fine zardosi, moti & zari needlework',
    image: 'https://images.unsplash.com/photo-1621600411688-4be93cd68504?auto=format&fit=crop&q=85&w=800',
    slug: 'handmade-details',
  },
  {
    id: 'breezy-silks',
    title: 'Breezy Silks',
    subtitle: 'Featherlight Chanderi & pure organza suits',
    image: 'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&q=85&w=800',
    slug: 'breezy-silks',
  },
];
