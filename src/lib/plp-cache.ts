import { z } from 'zod';
import { Product } from '@/data/shopData';
import { resolveCanonicalCategorySlug } from '@/lib/categoryHref';
import { matchProducts } from '@/lib/search/match';
import { getCachedSlimCatalogue, toShopProduct } from '@/lib/catalogue';

// ─── 1. Zod Validation & Whitelist Schema ──────────────────────────────────────
const singleString = z.preprocess((val) => {
  if (Array.isArray(val)) return val[0];
  return val;
}, z.string().optional());

const singleNumber = z.preprocess((val) => {
  if (Array.isArray(val)) return val[0];
  return val;
}, z.coerce.number().optional());

export const PlpQueryInputSchema = z
  .object({
    q: singleString,
    target: singleString.default('all'),
    category: singleString,
    categories: z.union([z.string(), z.array(z.string())]).optional(),
    sizes: z.union([z.string(), z.array(z.string())]).optional(),
    colours: z.union([z.string(), z.array(z.string())]).optional(),
    fabrics: z.union([z.string(), z.array(z.string())]).optional(),
    occasions: z.union([z.string(), z.array(z.string())]).optional(),
    minPrice: singleNumber.default(0),
    maxPrice: singleNumber.default(100000),
    discount: singleNumber.default(0),
    inStock: z
      .union([z.boolean(), z.string(), z.array(z.union([z.boolean(), z.string()]))])
      .optional()
      .default(false),
    sort: singleString.default('featured'),
    page: singleNumber.default(1),
    limit: singleNumber.default(24),
  })
  .passthrough();

export interface NormalizedPlpParams {
  q?: string;
  target: 'women' | 'kids' | 'all';
  categories: string[];
  sizes: string[];
  colours: string[];
  fabrics: string[];
  occasions: string[];
  minPrice: number;
  maxPrice: number;
  discount: number;
  inStockOnly: boolean;
  sort: 'featured' | 'newest' | 'price-low' | 'price-high' | 'popular' | 'discount';
  page: number;
  limit: number;
}

export interface PlpCacheValue {
  products: Product[];
  total: number;
  hasMore: boolean;
  page: number;
  limit: number;
  facets: {
    categories: Record<string, number>;
    sizes: Record<string, number>;
    colours: Record<string, number>;
    fabrics: Record<string, number>;
    occasions: Record<string, number>;
  };
  builtAt: number;
}

export type CacheStatus = 'HIT' | 'MISS' | 'STALE';

export interface PlpResultWithMeta {
  data: PlpCacheValue;
  cacheStatus: CacheStatus;
  neonQueries: number;
}

// ─── 2. Normalization Function ──────────────────────────────────────────────────
export function normalizePlpParams(raw: Record<string, any>): NormalizedPlpParams {
  const parsed = PlpQueryInputSchema.parse(raw);

  let target: 'women' | 'kids' | 'all' = 'all';
  const rawTarget = String(parsed.target || 'all').toLowerCase();
  if (rawTarget === 'women' || rawTarget === 'kids') {
    target = rawTarget;
  }

  const categoriesSet = new Set<string>();
  if (parsed.category) {
    categoriesSet.add(String(parsed.category).trim().toLowerCase());
  }
  if (parsed.categories) {
    const list = Array.isArray(parsed.categories) ? parsed.categories : parsed.categories.split(',');
    list.forEach((c) => {
      const clean = String(c).trim().toLowerCase();
      if (clean) categoriesSet.add(clean);
    });
  }

  const parseCleanArray = (val: string | string[] | undefined): string[] => {
    if (!val) return [];
    const list = Array.isArray(val) ? val : String(val).split(',');
    const set = new Set<string>();
    list.forEach((item) => {
      const clean = String(item).trim();
      if (clean && clean.length <= 50) set.add(clean);
    });
    return Array.from(set).sort().slice(0, 10);
  };

  const categories = Array.from(categoriesSet).sort().slice(0, 10);
  const sizes = parseCleanArray(parsed.sizes);
  const colours = parseCleanArray(parsed.colours);
  const fabrics = parseCleanArray(parsed.fabrics);
  const occasions = parseCleanArray(parsed.occasions);

  const rawMin = Math.max(0, Number(parsed.minPrice) || 0);
  const rawMax = Math.min(100000, Number(parsed.maxPrice) || 100000);
  const minPrice = Math.round(rawMin / 100) * 100;
  const maxPrice = Math.round(rawMax / 100) * 100;

  const allowedDiscounts = [0, 10, 20, 30, 50];
  const parsedDisc = Number(parsed.discount) || 0;
  const discount = allowedDiscounts.includes(parsedDisc) ? parsedDisc : 0;

  let inStockOnly = false;
  if (Array.isArray(parsed.inStock)) {
    inStockOnly = parsed.inStock.some((v) => v === true || v === 'true');
  } else {
    inStockOnly = parsed.inStock === true || parsed.inStock === 'true';
  }

  const allowedSorts: NormalizedPlpParams['sort'][] = [
    'featured',
    'newest',
    'price-low',
    'price-high',
    'popular',
    'discount',
  ];
  const sort = allowedSorts.includes(parsed.sort as any)
    ? (parsed.sort as NormalizedPlpParams['sort'])
    : 'featured';

  const page = Math.max(1, Math.min(100, Number(parsed.page) || 1));
  const limit = Math.max(1, Math.min(50, Number(parsed.limit) || 24));

  return {
    q: parsed.q ? String(parsed.q).trim() : undefined,
    target,
    categories,
    sizes,
    colours,
    fabrics,
    occasions,
    minPrice,
    maxPrice,
    discount,
    inStockOnly,
    sort,
    page,
    limit,
  };
}

// ─── 3. In-Memory Filter & Sort against Cached Slim Catalogue ───────────────────
export async function executeNeonPlpQuery(params: NormalizedPlpParams): Promise<PlpCacheValue> {
  const slimCatalogue = await getCachedSlimCatalogue();
  const allProducts: Product[] = slimCatalogue.map(toShopProduct);

  const filtered = allProducts.filter((p: any) => {
    if (params.target !== 'all') {
      const prodTarget = (p.target || p.gender || '').toLowerCase();
      if (params.target === 'women' && prodTarget === 'kids') return false;
      if (params.target === 'kids' && prodTarget !== 'kids') return false;
    }

    if (params.categories.length > 0) {
      const cat = (p.category || '').toLowerCase();
      const subcat = (p.subcategory || '').toLowerCase();
      const matches = params.categories.some((rawC) => {
        const c = rawC.toLowerCase();
        if (cat.includes(c) || subcat.includes(c) || c.includes(cat)) return true;
        const canon = resolveCanonicalCategorySlug(c, params.target);
        if (cat.includes(canon) || subcat.includes(canon) || canon.includes(cat)) return true;
        if ((c.includes('bodycon') || canon.includes('bodycon')) && (cat.includes('bodycon') || subcat.includes('bodycon'))) return true;
        if ((c.includes('skirt') || canon.includes('skirt')) && (cat.includes('skirt') || subcat.includes('skirt'))) return true;
        return false;
      });
      if (!matches) return false;
    }

    const price = Number(p.price) || 0;
    if (price < params.minPrice || (params.maxPrice > 0 && price > params.maxPrice)) {
      return false;
    }

    if (params.occasions.length > 0) {
      const occ = (p.occasion || '').toLowerCase();
      if (!params.occasions.some((o) => occ.includes(o.toLowerCase()))) return false;
    }

    if (params.sizes.length > 0) {
      const prodSizes = Array.isArray(p.sizes) ? p.sizes : [];
      const hasMatchingSize = prodSizes.some((s: any) => {
        const sName = typeof s === 'string' ? s : s.size;
        const inStock = typeof s === 'string' ? true : s.inStock ?? true;
        return params.sizes.includes(sName) && (!params.inStockOnly || inStock);
      });
      if (!hasMatchingSize) return false;
    }

    if (params.inStockOnly) {
      const prodSizes = Array.isArray(p.sizes) ? p.sizes : [];
      const hasStock =
        prodSizes.length === 0 ||
        prodSizes.some((s: any) => (typeof s === 'string' ? true : s.inStock ?? true));
      if (!hasStock) return false;
    }

    if (params.colours.length > 0) {
      const prodColours = Array.isArray(p.colors)
        ? p.colors.map((c: any) => (typeof c === 'string' ? c : c.name).toLowerCase())
        : [];
      if (!params.colours.some((c) => prodColours.includes(c.toLowerCase()))) return false;
    }

    if (params.fabrics.length > 0) {
      const fab = (p.fabric || '').toLowerCase();
      if (!params.fabrics.some((f) => fab.includes(f.toLowerCase()))) return false;
    }

    if (params.discount > 0) {
      const orig = Number(p.originalPrice || p.compare_price) || 0;
      if (!orig || orig <= price) return false;
      const disc = Math.round(((orig - price) / orig) * 100);
      if (disc < params.discount) return false;
    }

    return true;
  });

  let matchedList = filtered;
  if (params.q) {
    const searchRes = matchProducts(filtered, params.q, {
      targetPreference: params.target === 'all' ? undefined : params.target,
      limit: 100,
    });
    matchedList = searchRes.results;
  }

  if (params.sort !== 'featured' || !params.q) {
    matchedList.sort((a: any, b: any) => {
      const priceA = Number(a.price) || 0;
      const priceB = Number(b.price) || 0;
      if (params.sort === 'price-low') return priceA - priceB;
      if (params.sort === 'price-high') return priceB - priceA;
      if (params.sort === 'newest') return (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0);
      if (params.sort === 'popular') return (b.isBestSeller ? 1 : 0) - (a.isBestSeller ? 1 : 0);
      if (params.sort === 'discount') {
        const discA = a.originalPrice ? (a.originalPrice - a.price) / a.originalPrice : 0;
        const discB = b.originalPrice ? (b.originalPrice - b.price) / b.originalPrice : 0;
        return discB - discA;
      }
      return 0;
    });
  }

  const finalFiltered = matchedList;

  const facets = {
    categories: {} as Record<string, number>,
    sizes: {} as Record<string, number>,
    colours: {} as Record<string, number>,
    fabrics: {} as Record<string, number>,
    occasions: {} as Record<string, number>,
  };

  finalFiltered.forEach((p: any) => {
    if (p.category) facets.categories[p.category] = (facets.categories[p.category] || 0) + 1;
    if (p.occasion) facets.occasions[p.occasion] = (facets.occasions[p.occasion] || 0) + 1;
    if (p.fabric) facets.fabrics[p.fabric] = (facets.fabrics[p.fabric] || 0) + 1;
    if (Array.isArray(p.sizes)) {
      p.sizes.forEach((s: any) => {
        const sName = typeof s === 'string' ? s : s.size;
        if (sName) facets.sizes[sName] = (facets.sizes[sName] || 0) + 1;
      });
    }
    if (Array.isArray(p.colors)) {
      p.colors.forEach((c: any) => {
        const cName = typeof c === 'string' ? c : c.name;
        if (cName) facets.colours[cName] = (facets.colours[cName] || 0) + 1;
      });
    }
  });

  const total = finalFiltered.length;
  const startIndex = (params.page - 1) * params.limit;
  const paginatedProducts = finalFiltered.slice(startIndex, startIndex + params.limit);
  const hasMore = startIndex + params.limit < total;

  return {
    products: paginatedProducts,
    total,
    hasMore,
    page: params.page,
    limit: params.limit,
    facets,
    builtAt: Date.now(),
  };
}

// ─── 4. Main PLP Data Access (Served with 0 Redis hits from Vercel Data Cache) ──
export async function getPlpData(rawParams: Record<string, any>): Promise<PlpResultWithMeta> {
  const params = normalizePlpParams(rawParams);
  const data = await executeNeonPlpQuery(params);

  return {
    data,
    cacheStatus: 'HIT',
    neonQueries: 0,
  };
}

export async function getPlpCacheVersion(): Promise<string> {
  return '1';
}

export function buildPlpCacheKey(): { key: string; hash: string } {
  return { key: 'plp:v1:static', hash: 'static' };
}

export async function triggerPlpRebuildImmediate(): Promise<void> {
  // No-op: Redis PLP version invalidation removed in favor of Vercel Data Cache revalidateTag
}

export async function executeDbPlpWarmup(): Promise<number> {
  // No-op: warming removed in favor of Vercel Data Cache
  return 0;
}
