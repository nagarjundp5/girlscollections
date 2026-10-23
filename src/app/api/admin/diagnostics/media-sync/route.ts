import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/admin';
import { db } from '@/db';
import * as schema from '@/db/schema';
import { eq } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function GET() {
  const authResult = await requireAdmin();
  if (authResult instanceof NextResponse) return authResult;

  try {
    const [allProducts, allCategories, allImages] = await Promise.all([
      db.select().from(schema.products),
      db.select().from(schema.categories),
      db.select().from(schema.productImages),
    ]);

    const productsWithoutImages: Array<{ id: string; name: string; category: string }> = [];
    const productsWithBrokenImages: Array<{ id: string; name: string; brokenUrl: string }> = [];

    const dbImageProductIds = new Set(allImages.map((img: any) => img.product_id));

    for (const prod of allProducts) {
      const hasProductImages = (prod.images && prod.images.length > 0) || dbImageProductIds.has(prod.id);
      if (!hasProductImages) {
        productsWithoutImages.push({ id: prod.id, name: prod.name, category: prod.category });
      }

      if (prod.images && Array.isArray(prod.images)) {
        for (const imgUrl of prod.images) {
          if (!imgUrl || typeof imgUrl !== 'string' || (!imgUrl.startsWith('http://') && !imgUrl.startsWith('https://') && !imgUrl.startsWith('/'))) {
            productsWithBrokenImages.push({ id: prod.id, name: prod.name, brokenUrl: String(imgUrl) });
          }
        }
      }
    }

    const categoriesWithoutImages = allCategories
      .filter((cat: any) => !cat.image_url || cat.image_url.trim() === '')
      .map((cat: any) => ({ id: cat.id, name: cat.name, slug: cat.slug }));

    const validProductIds = new Set(allProducts.map((p: any) => p.id));
    const orphanedImageRecords = allImages
      .filter((img: any) => !validProductIds.has(img.product_id))
      .map((img: any) => ({ id: img.id, productId: img.product_id, url: img.image_url }));

    return NextResponse.json({
      summary: {
        totalProducts: allProducts.length,
        totalCategories: allCategories.length,
        totalProductImages: allImages.length,
        orphanedImagesCount: orphanedImageRecords.length,
        productsWithoutImagesCount: productsWithoutImages.length,
        categoriesWithoutImagesCount: categoriesWithoutImages.length,
        brokenImageUrlsCount: productsWithBrokenImages.length,
      },
      details: {
        productsWithoutImages,
        categoriesWithoutImages,
        orphanedImageRecords,
        productsWithBrokenImages,
      },
    });
  } catch (err: any) {
    console.error('Media sync diagnostic GET error:', err);
    return NextResponse.json({ error: 'Failed to run media sync diagnostic' }, { status: 500 });
  }
}
