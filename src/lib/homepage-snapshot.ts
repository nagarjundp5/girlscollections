import { unstable_cache } from 'next/cache';
import { dbHttp } from '@/db';
import { sql } from 'drizzle-orm';
import { Product } from '@/types';
import { WOMEN_CATEGORIES, KIDS_CATEGORIES, CategoryItem } from '@/data/categoryTaxonomy';
import { resolveCanonicalCategorySlug } from '@/lib/categoryHref';

export interface TabbedProducts {
  all: Product[];
  women: Product[];
  kids: Product[];
}

export interface CategoryRowData {
  category: CategoryItem;
  products: Product[];
}

export interface TabbedCategoryRows {
  all: CategoryRowData[];
  women: CategoryRowData[];
  kids: CategoryRowData[];
}

export interface HomepageSnapshot {
  trending: TabbedProducts;
  newDrops: TabbedProducts;
  categoryRows: TabbedCategoryRows;
  spotlightProduct: Product | null;
  // Backwards compatibility fields
  womenTrending: Product[];
  kidsTrending: Product[];
  trendingProducts: Product[];
  updatedAt: string;
}

export type NormalizedGender = 'women' | 'kids' | 'unisex' | 'unknown';

/**
 * Normalizes any raw product gender / category into a single mapping.
 * Logs any active product with null or unknown gender.
 */
export function normalizeProductGender(
  rawGender?: string | null,
  category?: string | null,
  subcategory?: string | null
): NormalizedGender {
  const g = (rawGender || '').toLowerCase().trim();
  const c = (category || '').toLowerCase().trim();
  const s = (subcategory || '').toLowerCase().trim();

  if (
    g === 'kids' ||
    g === 'girls' ||
    g === 'boys' ||
    g === 'children' ||
    c.includes('kid') ||
    c.includes('frock') ||
    c.includes('pattu') ||
    s.includes('kid') ||
    s.includes('frock')
  ) {
    return 'kids';
  }
  if (g === 'both' || g === 'unisex') {
    return 'unisex';
  }
  if (
    g === 'women' ||
    g === 'ladies' ||
    g === 'womens' ||
    c.includes('kurta') ||
    c.includes('anarkali') ||
    c.includes('saree') ||
    c.includes('lehenga') ||
    c.includes('gown') ||
    c.includes('top')
  ) {
    return 'women';
  }
  return 'unknown';
}

function parseSizes(sizes: any): string[] {
  if (!sizes) return [];
  if (Array.isArray(sizes)) {
    return sizes.map((s) => (typeof s === 'object' && s !== null ? s.size || '' : String(s))).filter(Boolean);
  }
  if (typeof sizes === 'string') {
    try {
      const parsed = JSON.parse(sizes);
      if (Array.isArray(parsed)) {
        return parsed.map((s) => (typeof s === 'object' && s !== null ? s.size || '' : String(s))).filter(Boolean);
      }
      return [sizes];
    } catch {
      return [sizes];
    }
  }
  return [];
}

function parseStockQuantity(stock: any): Record<string, number> {
  if (!stock) return {};
  if (typeof stock === 'object' && !Array.isArray(stock)) return stock;
  if (typeof stock === 'string') {
    try {
      return JSON.parse(stock);
    } catch {
      return {};
    }
  }
  return {};
}

function mapRowToProduct(r: any): Product {
  const priceRupees = r.price > 100000 ? Math.round(r.price / 100) : r.price;
  const compareRupees = r.compare_price
    ? (r.compare_price > 100000 ? Math.round(r.compare_price / 100) : r.compare_price)
    : undefined;

  const normGender = r.norm_gender || normalizeProductGender(r.gender, r.category);

  return {
    id: r.id,
    name: r.name,
    slug: r.slug,
    price: priceRupees,
    compare_price: compareRupees,
    originalPrice: compareRupees,
    category: r.category,
    gender: r.gender || normGender,
    target: normGender === 'kids' ? 'kids' : 'women',
    images: r.image ? [r.image] : [],
    imageWidth: r.image_width ? Number(r.image_width) : 800,
    imageHeight: r.image_height ? Number(r.image_height) : 1200,
    sizes: parseSizes(r.sizes),
    stock_quantity: parseStockQuantity(r.stock_quantity),
    created_at: r.created_at ? new Date(r.created_at).toISOString() : new Date().toISOString(),
    is_active: true,
  } as unknown as Product;
}

/**
 * Builds separate bounded sets per tab (all, women, kids) in SQL.
 * Query 1: Trending + New Drops partitioned by gender using ROW_NUMBER() OVER
 * Query 2: Category rows partitioned by gender and category using ROW_NUMBER() OVER
 * Total rows returned stay strictly under ~150.
 */
async function fetchHomepageSnapshotRaw(): Promise<HomepageSnapshot> {
  // Query 1: Trending & New Drops partitioned by gender
  const trendingAndNewQuery = sql`
    WITH base_products AS (
      SELECT
        p.id,
        p.name,
        p.slug,
        p.price,
        p.compare_price,
        p.category,
        p.gender,
        p.created_at,
        COALESCE(p.sizes, ARRAY[]::text[]) AS sizes,
        COALESCE(p.stock, '{}'::jsonb) AS stock_quantity,
        COALESCE(pi.image_url, p.images[1], '') AS image,
        COALESCE(pi.width, 800) AS image_width,
        COALESCE(pi.height, 1200) AS image_height,
        COALESCE(pi.width, 800) AS image_width,
        COALESCE(pi.height, 1200) AS image_height,
        CASE
          WHEN lower(coalesce(p.gender, '')) IN ('kids', 'girls', 'boys', 'children')
            OR lower(coalesce(p.category, '')) LIKE '%kid%'
            OR lower(coalesce(p.category, '')) LIKE '%frock%'
            OR lower(coalesce(p.category, '')) LIKE '%pattu%'
            OR lower(coalesce(p.subcategory, '')) LIKE '%kid%'
            OR lower(coalesce(p.subcategory, '')) LIKE '%frock%'
            THEN 'kids'
          WHEN lower(coalesce(p.gender, '')) IN ('both', 'unisex')
            THEN 'unisex'
          WHEN lower(coalesce(p.gender, '')) IN ('women', 'ladies', 'womens')
            OR lower(coalesce(p.category, '')) LIKE '%kurta%'
            OR lower(coalesce(p.category, '')) LIKE '%anarkali%'
            OR lower(coalesce(p.category, '')) LIKE '%saree%'
            OR lower(coalesce(p.category, '')) LIKE '%lehenga%'
            THEN 'women'
          ELSE 'unknown'
        END AS norm_gender,
        p.is_trending,
        p.is_featured,
        p.is_best_seller,
        p.units_sold
      FROM products p
      LEFT JOIN LATERAL (
        SELECT pi.image_url, pi.width, pi.height
        FROM product_images pi
        WHERE pi.product_id = p.id
        ORDER BY pi.sort_order ASC, pi.created_at ASC
        LIMIT 1
      ) pi ON true
      WHERE p.is_active = true
        AND COALESCE(pi.image_url, p.images[1], '') <> ''
    ),
    recent_signals AS (
      SELECT
        elem->>'id' AS product_id,
        SUM(COALESCE((elem->>'quantity')::int, 1)) AS order_qty
      FROM orders o,
      LATERAL jsonb_array_elements(o.items) AS elem
      WHERE o.created_at >= NOW() - INTERVAL '7 days'
        AND o.order_status <> 'CANCELLED'
      GROUP BY elem->>'id'
    ),
    ranked_trending AS (
      SELECT bp.*,
        COALESCE(rs.order_qty, 0) AS signal_7d,
        ROW_NUMBER() OVER (
          PARTITION BY bp.norm_gender
          ORDER BY
            COALESCE(rs.order_qty, 0) DESC,
            bp.is_trending DESC,
            bp.is_best_seller DESC,
            bp.units_sold DESC,
            bp.created_at DESC,
            bp.id DESC
        ) AS rn_trend
      FROM base_products bp
      LEFT JOIN recent_signals rs ON rs.product_id = bp.id::text
    ),
    ranked_new AS (
      SELECT *,
        ROW_NUMBER() OVER (
          PARTITION BY norm_gender
          ORDER BY created_at DESC, id DESC
        ) AS rn_new
      FROM base_products
    )
    SELECT
      id, name, slug, price, compare_price, category, gender, created_at, image, image_width, image_height, sizes, stock_quantity, norm_gender,
      'trending' AS section, rn_trend AS rn
    FROM ranked_trending
    WHERE rn_trend <= 12
    UNION ALL
    SELECT
      id, name, slug, price, compare_price, category, gender, created_at, image, image_width, image_height, sizes, stock_quantity, norm_gender,
      'new' AS section, rn_new AS rn
    FROM ranked_new
    WHERE rn_new <= 12;
  `;

  // Query 2: Category rows partitioned by gender and category
  const categoryRowsQuery = sql`
    WITH base_products AS (
      SELECT
        p.id,
        p.name,
        p.slug,
        p.price,
        p.compare_price,
        p.category,
        p.gender,
        p.created_at,
        COALESCE(p.sizes, ARRAY[]::text[]) AS sizes,
        COALESCE(p.stock, '{}'::jsonb) AS stock_quantity,
        COALESCE(pi.image_url, p.images[1], '') AS image,
        COALESCE(pi.width, 800) AS image_width,
        COALESCE(pi.height, 1200) AS image_height,
        COALESCE(pi.width, 800) AS image_width,
        COALESCE(pi.height, 1200) AS image_height,
        CASE
          WHEN lower(coalesce(p.gender, '')) IN ('kids', 'girls', 'boys', 'children')
            OR lower(coalesce(p.category, '')) LIKE '%kid%'
            OR lower(coalesce(p.category, '')) LIKE '%frock%'
            OR lower(coalesce(p.category, '')) LIKE '%pattu%'
            OR lower(coalesce(p.subcategory, '')) LIKE '%kid%'
            OR lower(coalesce(p.subcategory, '')) LIKE '%frock%'
            THEN 'kids'
          WHEN lower(coalesce(p.gender, '')) IN ('both', 'unisex')
            THEN 'unisex'
          WHEN lower(coalesce(p.gender, '')) IN ('women', 'ladies', 'womens')
            OR lower(coalesce(p.category, '')) LIKE '%kurta%'
            OR lower(coalesce(p.category, '')) LIKE '%anarkali%'
            OR lower(coalesce(p.category, '')) LIKE '%saree%'
            OR lower(coalesce(p.category, '')) LIKE '%lehenga%'
            THEN 'women'
          ELSE 'unknown'
        END AS norm_gender
      FROM products p
      LEFT JOIN LATERAL (
        SELECT pi.image_url, pi.width, pi.height
        FROM product_images pi
        WHERE pi.product_id = p.id
        ORDER BY pi.sort_order ASC, pi.created_at ASC
        LIMIT 1
      ) pi ON true
      WHERE p.is_active = true
        AND COALESCE(pi.image_url, p.images[1], '') <> ''
    ),
    ranked_cat AS (
      SELECT *,
        ROW_NUMBER() OVER (
          PARTITION BY norm_gender, category
          ORDER BY created_at DESC, id DESC
        ) AS rn
      FROM base_products
    )
    SELECT id, name, slug, price, compare_price, category, gender, created_at, image, image_width, image_height, sizes, stock_quantity, norm_gender
    FROM ranked_cat
    WHERE rn <= 10;
  `;

  const [tAndNResult, catResult] = await Promise.all([
    dbHttp.execute(trendingAndNewQuery),
    dbHttp.execute(categoryRowsQuery),
  ]);

  const tAndNRows: any[] = (tAndNResult as any).rows || (Array.isArray(tAndNResult) ? tAndNResult : []);
  const catRows: any[] = (catResult as any).rows || (Array.isArray(catResult) ? catResult : []);

  console.log(`[HomepageSnapshot] Query 1 (Trending+New) rows: ${tAndNRows.length}, Query 2 (CategoryRows) rows: ${catRows.length}, Total: ${tAndNRows.length + catRows.length}`);

  // Log any unknown or null gender products
  [...tAndNRows, ...catRows].forEach((r) => {
    if (r.norm_gender === 'unknown') {
      console.warn(`[HomepageSnapshot] Active product with null/unknown gender: "${r.name}" (id: ${r.id}, gender: ${r.gender}, category: ${r.category})`);
    }
  });

  // Separate trending and new drops from Query 1
  const trendingRows = tAndNRows.filter((r) => r.section === 'trending');
  const newRows = tAndNRows.filter((r) => r.section === 'new');

  const womenTrendingCandidates = trendingRows.filter((r) => r.norm_gender === 'women' || r.norm_gender === 'unisex').map(mapRowToProduct);
  const kidsTrendingCandidates = trendingRows.filter((r) => r.norm_gender === 'kids' || r.norm_gender === 'unisex').map(mapRowToProduct);
  const allTrendingCandidates = trendingRows.map(mapRowToProduct);

  const womenNewCandidates = newRows.filter((r) => r.norm_gender === 'women' || r.norm_gender === 'unisex').map(mapRowToProduct);
  const kidsNewCandidates = newRows.filter((r) => r.norm_gender === 'kids' || r.norm_gender === 'unisex').map(mapRowToProduct);
  const allNewCandidates = newRows.map(mapRowToProduct);

  // Helper to dedupe and backfill from newest products of the SAME gender up to target count
  function buildSectionList(primaryList: Product[], backfillList: Product[], targetCount = 12, minCount = 8): Product[] {
    const seen = new Set<string>();
    const result: Product[] = [];

    // Add from primary list
    for (const p of primaryList) {
      if (!seen.has(p.id)) {
        seen.add(p.id);
        result.push(p);
        if (result.length >= targetCount) break;
      }
    }

    // If fewer than minCount, backfill from SAME gender backfillList
    if (result.length < minCount) {
      for (const p of backfillList) {
        if (!seen.has(p.id)) {
          seen.add(p.id);
          result.push(p);
          if (result.length >= targetCount) break;
        }
      }
    }

    return result;
  }

  // 1. Trending per gender tab
  const trendingWomen = buildSectionList(womenTrendingCandidates, womenNewCandidates, 12, 8);
  const trendingKids = buildSectionList(kidsTrendingCandidates, kidsNewCandidates, 12, 8);
  const trendingAll = buildSectionList(allTrendingCandidates, allNewCandidates, 12, 8);

  // 2. New Drops per gender tab
  const newDropsWomen = buildSectionList(womenNewCandidates, womenTrendingCandidates, 12, 8);
  const newDropsKids = buildSectionList(kidsNewCandidates, kidsTrendingCandidates, 12, 8);
  const newDropsAll = buildSectionList(allNewCandidates, allTrendingCandidates, 12, 8);

  // 3. Category rows per tab
  const catProducts = catRows.map(mapRowToProduct);

  const normalizeCat = (s?: string | null) => (s || '').toLowerCase().replace(/_/g, '-').trim();

  function matchCategory(p: Product, cat: CategoryItem): boolean {
    const cSlug = normalizeCat(cat.slug);
    const cId = normalizeCat(cat.id);
    const cCanon = normalizeCat(resolveCanonicalCategorySlug(cSlug, cat.group));
    const targetSlugs = new Set([cSlug, cId, cCanon]);

    const pCat = normalizeCat(p.category);
    if (pCat) {
      const pCanon = normalizeCat(resolveCanonicalCategorySlug(pCat, cat.group));
      if (targetSlugs.has(pCat) || targetSlugs.has(pCanon)) return true;
    }
    return false;
  }

  function dailySeedShuffle<T extends { id: string }>(arr: T[]): T[] {
    const daySeed = new Date().toISOString().slice(0, 10);
    return [...arr].sort((a, b) => {
      const ha = `${daySeed}:${a.id}`;
      const hb = `${daySeed}:${b.id}`;
      let va = 0;
      let vb = 0;
      for (let i = 0; i < ha.length; i++) va = (va * 31 + ha.charCodeAt(i)) | 0;
      for (let i = 0; i < hb.length; i++) vb = (vb * 31 + hb.charCodeAt(i)) | 0;
      return va - vb;
    });
  }

  function buildCategoryRowsForGender(
    taxonomyCategories: CategoryItem[],
    pool: Product[],
    initialSeenIds: Set<string>,
    maxRows = 5
  ): CategoryRowData[] {
    const rows: CategoryRowData[] = [];
    const usedProductIds = new Set<string>(initialSeenIds);

    for (const cat of taxonomyCategories) {
      if (rows.length >= maxRows) break;
      const catAll = dailySeedShuffle(pool.filter((p) => matchCategory(p, cat)));
      if (catAll.length === 0) continue;

      const unseen = catAll.filter((p) => !usedProductIds.has(p.id));
      const slice = unseen.slice(0, 8);

      // If fewer than 4 unseen products, backfill from same category without repeating inside this row
      if (slice.length < 4) {
        const inRow = new Set(slice.map((p) => p.id));
        for (const p of catAll) {
          if (!inRow.has(p.id)) {
            slice.push(p);
            inRow.add(p.id);
            if (slice.length >= 4) break;
          }
        }
      }

      if (slice.length === 0) continue;
      slice.forEach((p) => usedProductIds.add(p.id));
      rows.push({
        category: cat,
        products: slice,
      });
    }

    return rows;
  }

  const womenCatPool = catProducts.filter((p: any) => p.gender === 'women' || p.gender === 'unisex' || p.target === 'women');
  const kidsCatPool = catProducts.filter((p: any) => p.gender === 'kids' || p.gender === 'unisex' || p.target === 'kids');

  const womenSeen = new Set<string>(trendingWomen.map((p) => p.id));
  const kidsSeen = new Set<string>(trendingKids.map((p) => p.id));

  const womenCategoryRows = buildCategoryRowsForGender(WOMEN_CATEGORIES, womenCatPool, womenSeen, 5);
  const kidsCategoryRows = buildCategoryRowsForGender(KIDS_CATEGORIES, kidsCatPool, kidsSeen, 5);
  const allCategoryRows = [
    ...womenCategoryRows.slice(0, 3),
    ...kidsCategoryRows.slice(0, 2),
  ];

  const spotlightProduct = trendingAll[0] || newDropsAll[0] || null;

  console.log('\n=================== HOMEPAGE SNAPSHOT VERIFICATION TABLE ===================');
  console.log('| Tab   | Trending (Count & IDs) | New Drops (Count & IDs) | Category Rows (Count & Breakdown) |');
  console.log('| :---  | :---                   | :---                    | :---                              |');
  console.log(`| All   | Count: ${trendingAll.length} [${trendingAll.map((p) => p.id.slice(0, 8)).join(', ')}] | Count: ${newDropsAll.length} [${newDropsAll.map((p) => p.id.slice(0, 8)).join(', ')}] | ${allCategoryRows.length} rows: ${allCategoryRows.map((r) => `${r.category.name} (${r.products.length} prods: [${r.products.map((p) => p.id.slice(0, 8)).join(',')}])`).join('; ')} |`);
  console.log(`| Women | Count: ${trendingWomen.length} [${trendingWomen.map((p) => p.id.slice(0, 8)).join(', ')}] | Count: ${newDropsWomen.length} [${newDropsWomen.map((p) => p.id.slice(0, 8)).join(', ')}] | ${womenCategoryRows.length} rows: ${womenCategoryRows.map((r) => `${r.category.name} (${r.products.length} prods: [${r.products.map((p) => p.id.slice(0, 8)).join(',')}])`).join('; ')} |`);
  console.log(`| Kids  | Count: ${trendingKids.length} [${trendingKids.map((p) => p.id.slice(0, 8)).join(', ')}] | Count: ${newDropsKids.length} [${newDropsKids.map((p) => p.id.slice(0, 8)).join(', ')}] | ${kidsCategoryRows.length} rows: ${kidsCategoryRows.map((r) => `${r.category.name} (${r.products.length} prods: [${r.products.map((p) => p.id.slice(0, 8)).join(',')}])`).join('; ')} |`);
  console.log('============================================================================\n');

  return {
    trending: {
      all: trendingAll,
      women: trendingWomen,
      kids: trendingKids,
    },
    newDrops: {
      all: newDropsAll,
      women: newDropsWomen,
      kids: newDropsKids,
    },
    categoryRows: {
      all: allCategoryRows,
      women: womenCategoryRows,
      kids: kidsCategoryRows,
    },
    spotlightProduct,
    // Backwards-compatible fields
    womenTrending: trendingWomen,
    kidsTrending: trendingKids,
    trendingProducts: trendingAll,
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Cached homepage snapshot loader:
 * Key: "homepage-snapshot-v3" (bumped to v3 to discard old cached data)
 * Revalidate: 600 seconds
 * Tag: "homepage"
 */
export const getHomepageSnapshot = unstable_cache(
  async () => {
    try {
      return await fetchHomepageSnapshotRaw();
    } catch (err) {
      console.error('[HomepageSnapshot] Failed to build snapshot:', err);
      return {
        trending: { all: [], women: [], kids: [] },
        newDrops: { all: [], women: [], kids: [] },
        categoryRows: { all: [], women: [], kids: [] },
        spotlightProduct: null,
        womenTrending: [],
        kidsTrending: [],
        trendingProducts: [],
        updatedAt: new Date().toISOString(),
      };
    }
  },
  ['homepage-snapshot-v4'],
  { revalidate: 600, tags: ['homepage'] }
);

export async function saveHomepageSnapshot(): Promise<void> {
  // No-op: Invalidation is handled via revalidateTag('homepage')
}

export async function invalidateAndRebuildHomepageSnapshot(): Promise<void> {
  try {
    const { revalidatePath, revalidateTag } = await import('next/cache');
    revalidatePath('/', 'page');
    revalidateTag('homepage');
    revalidateTag('products');
  } catch {
    // Ignore outside request context
  }
}
