import { unstable_cache } from 'next/cache';
import { dbHttp } from '@/db';
import * as schema from '@/db/schema';
import { eq, desc, sql } from 'drizzle-orm';
import { Product as ShopProduct } from '@/data/shopData';
import { Product as TypesProduct } from '@/types';

export interface SlimCatalogueProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  compare_price?: number;
  category: string;
  subcategory?: string | null;
  gender: string;
  fabric?: string | null;
  occasion?: string | null;
  colours: string[];
  sizes: string[];
  age_ranges: string[];
  images: string[];
  in_stock: boolean;
  is_featured: boolean;
  is_trending?: boolean;
  is_best_seller?: boolean;
  is_new_arrival?: boolean;
  units_sold?: number;
  created_at: string;
}

/**
 * Raw slim query against Neon products table.
 * Selects only card fields + filter fields + in_stock boolean.
 * Zero table joins (no productImages, productVariants, productSizes, or productPriceGroups).
 */
async function fetchSlimCatalogueRaw(): Promise<SlimCatalogueProduct[]> {
  try {
    const rows = await dbHttp
      .select({
        id: schema.products.id,
        name: schema.products.name,
        slug: schema.products.slug,
        price: schema.products.price,
        compare_price: schema.products.compare_price,
        category: schema.products.category,
        subcategory: schema.products.subcategory,
        gender: schema.products.gender,
        fabric: schema.products.fabric,
        occasion: schema.products.occasion,
        colours: schema.products.colours,
        sizes: schema.products.sizes,
        age_ranges: schema.products.age_ranges,
        images: schema.products.images,
        stock_quantity: schema.products.stock_quantity,
        is_featured: schema.products.is_featured,
        is_trending: schema.products.is_trending,
        is_best_seller: schema.products.is_best_seller,
        is_new_arrival: schema.products.is_new_arrival,
        units_sold: schema.products.units_sold,
        created_at: schema.products.created_at,
      })
      .from(schema.products)
      .where(eq(schema.products.is_active, true))
      .orderBy(desc(schema.products.is_featured), desc(schema.products.created_at))
      .limit(50);

    return rows.map((r: any) => {
      const stockMap = r.stock_quantity && typeof r.stock_quantity === 'object' ? r.stock_quantity : {};
      const stockMapKeys = Object.keys(stockMap);

      // In-stock evaluation rule (zero subqueries)
      let hasStock = true;
      if (stockMapKeys.length > 0) {
        hasStock = Object.values(stockMap).some((qty: any) => Number(qty) > 0);
      } else {
        hasStock = true;
      }

      // Extract card images (primary and secondary hover only, max 2)
      const rawImgs = Array.isArray(r.images) ? r.images : [];
      const cardImgs = rawImgs.slice(0, 2);

      // Standardize sizes list to string array
      let sizesList: string[] = [];
      if (Array.isArray(r.sizes)) {
        sizesList = r.sizes.map((s: any) => (typeof s === 'string' ? s : s.size || String(s)));
      } else if (stockMap && Object.keys(stockMap).length > 0) {
        sizesList = Object.keys(stockMap);
      }

      return {
        id: r.id,
        name: r.name,
        slug: r.slug,
        price: Number(r.price) || 0,
        compare_price: r.compare_price ? Number(r.compare_price) : undefined,
        category: r.category || 'ethnic-wear',
        subcategory: r.subcategory || null,
        gender: r.gender || 'women',
        fabric: r.fabric || null,
        occasion: r.occasion || null,
        colours: Array.isArray(r.colours) ? r.colours : [],
        sizes: sizesList,
        age_ranges: Array.isArray(r.age_ranges) ? r.age_ranges : [],
        images: cardImgs,
        in_stock: hasStock,
        is_featured: Boolean(r.is_featured),
        is_trending: Boolean(r.is_trending),
        is_best_seller: Boolean(r.is_best_seller),
        is_new_arrival: Boolean(r.is_new_arrival),
        units_sold: typeof r.units_sold === 'number' ? r.units_sold : 0,
        created_at: r.created_at ? new Date(r.created_at).toISOString() : new Date().toISOString(),
      };
    });
  } catch (err) {
    console.error('[fetchSlimCatalogueRaw] Error fetching slim catalogue from Neon:', err);
    return [];
  }
}

/**
 * Module-scope Next.js Data Cache for the entire storefront catalogue.
 * Cache tag: 'products'
 * Revalidate: 3600 seconds (1 hour natural edge drift, busted on admin mutations or stock changes)
 */
export const getCachedSlimCatalogue = unstable_cache(
  fetchSlimCatalogueRaw,
  ['tgc-slim-catalogue-v1'],
  {
    revalidate: 3600,
    tags: ['products'],
  }
);

/**
 * Converts a SlimCatalogueProduct into the storefront Product interface used by PLP and cards.
 */
export function toShopProduct(p: SlimCatalogueProduct): ShopProduct {
  const priceRupees = p.price > 10000 ? Math.round(p.price / 100) : p.price;
  const originalPriceRupees = p.compare_price
    ? p.compare_price > 10000
      ? Math.round(p.compare_price / 100)
      : p.compare_price
    : undefined;

  const sizesList = p.sizes.map((s) => ({
    size: s,
    inStock: p.in_stock,
  }));

  const cat = (p.category || '').toLowerCase();
  const subcat = (p.subcategory || '').toLowerCase();
  const isKids =
    p.gender === 'kids' ||
    cat.includes('kids') ||
    cat.includes('children') ||
    cat.includes('frock') ||
    subcat.includes('kids');

  let mappedOccasion: 'Festive' | 'Wedding Guest' | 'Everyday' | 'Gifting' = 'Festive';
  if (p.occasion) {
    const occ = p.occasion.toLowerCase();
    if (occ.includes('wedding')) mappedOccasion = 'Wedding Guest';
    else if (occ.includes('everyday') || occ.includes('casual')) mappedOccasion = 'Everyday';
    else if (occ.includes('gift')) mappedOccasion = 'Gifting';
    else mappedOccasion = 'Festive';
  }

  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    category: p.category || 'ethnic-wear',
    target: isKids ? 'kids' : 'women',
    subcategory: p.subcategory || p.category || '',
    occasion: mappedOccasion,
    price: priceRupees,
    originalPrice: originalPriceRupees,
    isNew: p.is_new_arrival ?? true,
    isBestSeller: p.is_best_seller ?? p.is_featured,
    isSale: !!originalPriceRupees,
    images: p.images,
    sizes: sizesList.length > 0 ? sizesList : [
      { size: 'XS', inStock: p.in_stock },
      { size: 'S', inStock: p.in_stock },
      { size: 'M', inStock: p.in_stock },
      { size: 'L', inStock: p.in_stock },
      { size: 'XL', inStock: p.in_stock },
    ],
    colors: p.colours.length > 0
      ? p.colours.map((c) => ({ name: c, hex: '#B8924A' }))
      : [{ name: 'Standard', hex: '#C9A66B' }],
    fabric: p.fabric || 'Premium Fabric',
    description: '',
    careInstructions: ['Dry Clean Only'],
    rating: 5.0,
    reviewsCount: 18,
  };
}

/**
 * Adapter: converts SlimCatalogueProduct to full TypesProduct (used by components/home and dbService).
 */
export function toTypesProduct(p: SlimCatalogueProduct): TypesProduct {
  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    description: '',
    price: p.price,
    compare_price: p.compare_price,
    category: p.category,
    subcategory: p.subcategory || undefined,
    gender: p.gender,
    images: p.images,
    sizes: p.sizes,
    stock_quantity: p.in_stock ? { default: 10 } : {},
    is_featured: p.is_featured,
    is_trending: p.is_trending,
    is_best_seller: p.is_best_seller,
    is_new_arrival: p.is_new_arrival,
    is_active: true,
    weight_grams: 500,
    units_sold: p.units_sold,
    age_ranges: p.age_ranges,
    colours: p.colours,
    fabric: p.fabric,
    occasion: p.occasion,
    created_at: p.created_at,
  };
}
