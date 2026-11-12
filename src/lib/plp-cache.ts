import { z } from 'zod';
import { createHash } from 'crypto';
import { redis, isRedisConfigured } from '@/lib/redis';
import { dbService } from '@/lib/db';
import { Product } from '@/data/shopData';
import { resolveCanonicalCategorySlug } from '@/lib/categoryHref';
import { matchProducts } from '@/lib/search/match';

// ─── 1. Zod Validation & Whitelist Schema (Safely handles duplicates & arrays) ───
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
  .passthrough(); // Allow Next.js internal router params like _rsc without throwing

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

  // Target whitelist
  let target: 'women' | 'kids' | 'all' = 'all';
  const rawTarget = String(parsed.target || 'all').toLowerCase();
  if (rawTarget === 'women' || rawTarget === 'kids') {
    target = rawTarget;
  }

  // Categories parsing & capping
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

  // Helper to parse, sort, deduplicate, and cap string arrays
  const parseCleanArray = (val: string | string[] | undefined): string[] => {
    if (!val) return [];
    const list = Array.isArray(val) ? val : String(val).split(',');
    const set = new Set<string>();
    list.forEach((item) => {
      const clean = String(item).trim();
      if (clean && clean.length <= 50) set.add(clean);
    });
    return Array.from(set).sort().slice(0, 10); // cap max 10 values
  };

  const categories = Array.from(categoriesSet).sort().slice(0, 10);
  const sizes = parseCleanArray(parsed.sizes);
  const colours = parseCleanArray(parsed.colours);
  const fabrics = parseCleanArray(parsed.fabrics);
  const occasions = parseCleanArray(parsed.occasions);

  // Price rounding to nearest 100
  const rawMin = Math.max(0, Number(parsed.minPrice) || 0);
  const rawMax = Math.min(100000, Number(parsed.maxPrice) || 100000);
  const minPrice = Math.round(rawMin / 100) * 100;
  const maxPrice = Math.round(rawMax / 100) * 100;

  // Discount whitelist
  const allowedDiscounts = [0, 10, 20, 30, 50];
  const parsedDisc = Number(parsed.discount) || 0;
  const discount = allowedDiscounts.includes(parsedDisc) ? parsedDisc : 0;

  // In Stock
  let inStockOnly = false;
  if (Array.isArray(parsed.inStock)) {
    inStockOnly = parsed.inStock.some((v) => v === true || v === 'true');
  } else {
    inStockOnly = parsed.inStock === true || parsed.inStock === 'true';
  }

  // Sort whitelist
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

  // Pagination clamping
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

// ─── 3. Version Invalidation & Cache Key ────────────────────────────────────────
let cachedVersion: { ver: string; expiresAt: number } | null = null;

export async function getPlpCacheVersion(): Promise<string> {
  const now = Date.now();
  if (cachedVersion && cachedVersion.expiresAt > now) {
    return cachedVersion.ver;
  }

  if (!isRedisConfigured()) {
    return '1';
  }

  try {
    const raw = await redis.get('plp:ver');
    const ver = raw ? String(raw) : '1';
    cachedVersion = { ver, expiresAt: now + 5000 }; // 5s in-memory TTL
    return ver;
  } catch {
    return '1';
  }
}

export function buildPlpCacheKey(params: NormalizedPlpParams, version: string): { key: string; hash: string } {
  const canonical = JSON.stringify({
    q: params.q || '',
    t: params.target,
    c: params.categories,
    s: params.sizes,
    col: params.colours,
    f: params.fabrics,
    o: params.occasions,
    min: params.minPrice,
    max: params.maxPrice,
    d: params.discount,
    stk: params.inStockOnly,
    srt: params.sort,
    p: params.page,
    l: params.limit,
  });

  const hash = createHash('sha256').update(canonical).digest('hex').slice(0, 24);
  const key = `plp:v${version}:${hash}`;
  return { key, hash };
}

// Format DB product to PLP Product
export function formatDbProductToShopProduct(p: any): Product {
  const priceRupees = p.price > 10000 ? Math.round(p.price / 100) : p.price;
  const originalPriceRupees = p.compare_price
    ? p.compare_price > 10000
      ? Math.round(p.compare_price / 100)
      : p.compare_price
    : undefined;

  let sizesList: any[] = [];
  if (Array.isArray(p.sizes)) {
    sizesList = p.sizes.map((s: any) =>
      typeof s === 'string' ? { size: s, inStock: true } : s
    );
  } else if (p.stock_quantity && typeof p.stock_quantity === 'object') {
    sizesList = Object.entries(p.stock_quantity).map(([size, qty]) => ({
      size,
      inStock: Number(qty) > 0,
    }));
  }

  if (sizesList.length === 0) {
    sizesList = [
      { size: 'XS', inStock: true },
      { size: 'S', inStock: true },
      { size: 'M', inStock: true },
      { size: 'L', inStock: true },
      { size: 'XL', inStock: true },
    ];
  }

  const cat = (p.category || '').toLowerCase();
  const subcat = (p.subcategory || '').toLowerCase();
  const isKids =
    p.gender === 'kids' ||
    cat.includes('kids') ||
    cat.includes('children') ||
    cat.includes('frock') ||
    subcat.includes('kids');

  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    category: p.category || 'ethnic-wear',
    target: isKids ? 'kids' : 'women',
    subcategory: p.subcategory || p.category || '',
    occasion: p.occasion || 'Festive Wear',
    price: priceRupees,
    originalPrice: originalPriceRupees,
    isNew: true,
    isBestSeller: !!p.is_featured,
    isSale: !!originalPriceRupees,
    images: Array.isArray(p.images) && p.images.length > 0 ? p.images : [],
    sizes: sizesList,
    colors:
      Array.isArray(p.colours) && p.colours.length > 0
        ? p.colours.map((c: string) => ({ name: c, hex: '#B8924A' }))
        : [{ name: 'Standard', hex: '#C9A66B' }],
    fabric: p.fabric || p.description || 'Premium Ethnic Wear',
    style_silhouette: p.style_silhouette || undefined,
    work_type: p.work_type || undefined,
    sleeve: p.sleeve || undefined,
    neckline: p.neckline || undefined,
    description: p.description || '',
    careInstructions: ['Dry Clean Only'],
    rating: 5.0,
    reviewsCount: 18,
  };
}

// ─── 4. Neon Query & Data Computation ───────────────────────────────────────────
export async function executeNeonPlpQuery(params: NormalizedPlpParams): Promise<PlpCacheValue> {
  const rawProducts = await dbService.getProducts();
  const allProducts: Product[] = rawProducts.map(formatDbProductToShopProduct);

  // Apply filters
  const filtered = allProducts.filter((p: any) => {
    // Division / Target
    if (params.target !== 'all') {
      const prodTarget = (p.target || p.gender || '').toLowerCase();
      if (params.target === 'women' && prodTarget === 'kids') return false;
      if (params.target === 'kids' && prodTarget !== 'kids') return false;
    }

    // Categories (with canonical mapping for Kids Western Bodycon & Skirt and Top)
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

    // Price range
    const price = Number(p.price) || 0;
    if (price < params.minPrice || (params.maxPrice > 0 && price > params.maxPrice)) {
      return false;
    }

    // Occasion
    if (params.occasions.length > 0) {
      const occ = (p.occasion || '').toLowerCase();
      if (!params.occasions.some((o) => occ.includes(o.toLowerCase()))) return false;
    }

    // Sizes
    if (params.sizes.length > 0) {
      const prodSizes = Array.isArray(p.sizes) ? p.sizes : [];
      const hasMatchingSize = prodSizes.some((s: any) => {
        const sName = typeof s === 'string' ? s : s.size;
        const inStock = typeof s === 'string' ? true : s.inStock ?? true;
        return params.sizes.includes(sName) && (!params.inStockOnly || inStock);
      });
      if (!hasMatchingSize) return false;
    }

    // In Stock Only
    if (params.inStockOnly) {
      const prodSizes = Array.isArray(p.sizes) ? p.sizes : [];
      const hasStock =
        prodSizes.length === 0 ||
        prodSizes.some((s: any) => (typeof s === 'string' ? true : s.inStock ?? true));
      if (!hasStock) return false;
    }

    // Colours
    if (params.colours.length > 0) {
      const prodColours = Array.isArray(p.colors)
        ? p.colors.map((c: any) => (typeof c === 'string' ? c : c.name).toLowerCase())
        : [];
      if (!params.colours.some((c) => prodColours.includes(c.toLowerCase()))) return false;
    }

    // Fabrics
    if (params.fabrics.length > 0) {
      const fab = (p.fabric || '').toLowerCase();
      if (!params.fabrics.some((f) => fab.includes(f.toLowerCase()))) return false;
    }

    // Discount
    if (params.discount > 0) {
      const orig = Number(p.originalPrice || p.compare_price) || 0;
      if (!orig || orig <= price) return false;
      const disc = Math.round(((orig - price) / orig) * 100);
      if (disc < params.discount) return false;
    }

    return true;
  });

  // Apply search query matching if `q` parameter is present
  let matchedList = filtered;
  if (params.q) {
    const searchRes = matchProducts(filtered, params.q, {
      targetPreference: params.target === 'all' ? undefined : params.target,
      limit: 100,
    });
    matchedList = searchRes.results;
  }

  // Sort
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
      return 0; // 'featured' keeps curated order
    });
  }

  const finalFiltered = matchedList;

  // Compute Facets
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

  // Slice Pagination
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

// ─── 5. Main PLP Data Access with SWR, Previous-Version Fallback & Locks ────────
const TTL_FRESH_MS = 5 * 60 * 1000; // 5 minutes fresh
const TTL_REDIS_SEC = 30 * 60; // 30 minutes in Redis

export async function getPlpData(rawParams: Record<string, any>): Promise<PlpResultWithMeta> {
  const params = normalizePlpParams(rawParams);
  const version = await getPlpCacheVersion();
  const { key, hash } = buildPlpCacheKey(params, version);

  if (!isRedisConfigured()) {
    const freshData = await executeNeonPlpQuery(params);
    return { data: freshData, cacheStatus: 'MISS', neonQueries: 1 };
  }

  // 1 GET per request on a hit (Redis Cost requirement)
  let cached: PlpCacheValue | null = null;
  try {
    const raw = await redis.get(key);
    if (raw) {
      cached = typeof raw === 'string' ? JSON.parse(raw) : (raw as PlpCacheValue);
    }
  } catch (err) {
    console.warn('[PlpCache] Redis read error:', err);
  }

  const now = Date.now();

  // A) CACHE HIT (Fresh for 5 minutes)
  if (cached && now - cached.builtAt <= TTL_FRESH_MS) {
    return {
      data: cached,
      cacheStatus: 'HIT',
      neonQueries: 0,
    };
  }

  // B) CACHE STALE (Served stale up to 30 min while background revalidation runs)
  if (cached) {
    revalidateInBackground(key, hash, params).catch((err) =>
      console.warn('[PlpCache] Background SWR error:', err)
    );

    return {
      data: cached,
      cacheStatus: 'STALE',
      neonQueries: 0,
    };
  }

  // C) PART C.1: Fall back to PREVIOUS version's data (STALE) if present
  // So no visitor ever waits for a cold Neon query during or after an admin write!
  const prevVerNum = Number(version) - 1;
  if (prevVerNum >= 1) {
    const prevKey = `plp:v${prevVerNum}:${hash}`;
    try {
      const prevRaw = await redis.get(prevKey);
      if (prevRaw) {
        const prevData = typeof prevRaw === 'string' ? JSON.parse(prevRaw) : (prevRaw as PlpCacheValue);
        // Serve previous version data immediately!
        revalidateInBackground(key, hash, params).catch((err) =>
          console.warn('[PlpCache] SWR rebuild error:', err)
        );
        return {
          data: prevData,
          cacheStatus: 'STALE',
          neonQueries: 0,
        };
      }
    } catch {
      // Fall through to miss handling
    }
  }

  // D) CACHE MISS: Single-flight lock (SET NX, 10s)
  const lockKey = `plp:lock:${hash}`;
  let hasLock = false;
  try {
    const lockAcquired = await redis.set(lockKey, '1', { nx: true, ex: 10 });
    hasLock = !!lockAcquired;
  } catch {
    hasLock = true;
  }

  // Query Neon once
  const freshData = await executeNeonPlpQuery(params);

  // Store in Redis (TTL 30 min, max 60s for empty lists to prevent stale empty caches)
  const ttl = freshData.total === 0 ? 60 : TTL_REDIS_SEC;
  try {
    await redis.set(key, JSON.stringify(freshData), { ex: ttl });
    if (hasLock) {
      await redis.del(lockKey);
    }
  } catch (err) {
    console.warn('[PlpCache] Redis write error:', err);
  }

  return {
    data: freshData,
    cacheStatus: 'MISS',
    neonQueries: 1,
  };
}

// ─── 6. Background Revalidation Runner ──────────────────────────────────────────
async function revalidateInBackground(
  key: string,
  hash: string,
  params: NormalizedPlpParams
): Promise<void> {
  const lockKey = `plp:lock:${hash}`;
  try {
    const lock = await redis.set(lockKey, '1', { nx: true, ex: 10 });
    if (!lock) return;

    const fresh = await executeNeonPlpQuery(params);
    const ttl = fresh.total === 0 ? 60 : TTL_REDIS_SEC;
    await redis.set(key, JSON.stringify(fresh), { ex: ttl });
    await redis.del(lockKey);
  } catch (err) {
    console.warn('[PlpCache] Background revalidation failed:', err);
  }
}

// ─── 7. PART C: WARMUP LIST FROM DB & ZERO-DOWNTIME VERSION PROMOTION ─────────
/**
 * Queries active categories directly from Neon and prebuilds Page 1 for:
 * active categories x women/kids x (featured, newest).
 * Prebuilds under targetVersion and promotes targetVersion to active plp:ver.
 */
export async function executeDbPlpWarmup(targetVersion: string): Promise<number> {
  console.log(`[PlpWarmup] Prebuilding cache for version ${targetVersion} directly from DB...`);
  const startTime = Date.now();
  let prebuiltCount = 0;

  try {
    const rawProducts = await dbService.getProducts();

    // Dynamically derive distinct active categories & targets from DB products
    const activeCombinations: Array<{ category?: string; target: 'all' | 'women' | 'kids' }> = [
      { target: 'all' },
      { target: 'women' },
      { target: 'kids' },
    ];

    const seenCombos = new Set<string>();
    rawProducts.forEach((p: any) => {
      const cat = (p.category || '').toLowerCase().trim();
      const target: 'women' | 'kids' =
        p.gender === 'kids' ||
        cat.includes('kids') ||
        cat.includes('children') ||
        cat.includes('frock')
          ? 'kids'
          : 'women';

      if (cat) {
        const comboKey = `${cat}:${target}`;
        if (!seenCombos.has(comboKey)) {
          seenCombos.add(comboKey);
          activeCombinations.push({ category: cat, target });
        }
      }
    });

    const sorts: ('featured' | 'newest')[] = ['featured', 'newest'];

    // Prebuild each combination for page 1
    for (const combo of activeCombinations) {
      for (const sort of sorts) {
        const params = normalizePlpParams({
          category: combo.category,
          target: combo.target,
          sort,
          page: 1,
          limit: 24,
        });

        const { key } = buildPlpCacheKey(params, targetVersion);
        const data = await executeNeonPlpQuery(params);

        if (isRedisConfigured()) {
          await redis.set(key, JSON.stringify(data), { ex: TTL_REDIS_SEC });
        }
        prebuiltCount++;
      }
    }

    // Promote targetVersion to active plp:ver once all default listings are ready!
    if (isRedisConfigured()) {
      await redis.set('plp:ver', targetVersion);
      cachedVersion = { ver: targetVersion, expiresAt: Date.now() + 5000 };
    }

    const durationMs = Date.now() - startTime;
    console.log(
      `[PlpWarmup] Successfully prebuilt ${prebuiltCount} DB listings under v${targetVersion} in ${durationMs}ms.`
    );
  } catch (err) {
    console.error('[PlpWarmup] Warmup from DB failed:', err);
  }

  return prebuiltCount;
}

/**
 * Triggered after admin writes:
 * Rebuilds immediately with NO 30s delay, while continuing to serve current version's data.
 */
export async function triggerPlpRebuildImmediate(): Promise<void> {
  const currentVer = await getPlpCacheVersion();
  const nextVer = String(Number(currentVer) + 1);

  // 1. Try QStash with 0 delay (immediate asynchronous execution)
  const qstashToken = process.env.QSTASH_TOKEN;
  if (qstashToken && !qstashToken.includes('placeholder') && !qstashToken.includes('mock')) {
    try {
      const { Client } = await import('@upstash/qstash');
      const { getSiteUrl, getQStashPublishHeaders } = await import('@/lib/getSiteUrl');
      const client = new Client({ token: qstashToken });

      const siteUrl = getSiteUrl();
      const targetUrl = `${siteUrl}/api/webhooks/qstash/plp-warmup`;

      const res = await client.publishJSON({
        url: targetUrl,
        body: { targetVersion: nextVer },
        delay: 0, // NO 30s delay
        headers: getQStashPublishHeaders(),
      });
      console.log(`[PlpCache] QStash plp-warmup dispatched! Message ID: ${res.messageId}`);
      return;
    } catch (err) {
      console.warn('[PlpCache] QStash dispatch failed, running local rebuild:', err);
    }
  }

  // 2. Direct local background rebuild if QStash not configured
  executeDbPlpWarmup(nextVer).catch((err) =>
    console.warn('[PlpCache] Local background warmup error:', err)
  );
}
