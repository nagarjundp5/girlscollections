import { NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import { dbService } from '@/lib/db';
import { adminProductSchema } from '@/lib/validations';
import { requireStaffOrAdmin, requireAdmin } from '@/lib/auth/admin';

/**
 * Bust all homepage category, featured, and trending caches for a product.
 * Always revalidate 'products-all', 'featured-products', and 'trending-products'.
 */
function bustProductCacheTags(category?: string) {
  revalidateTag('products-all');
  revalidateTag('featured-products');
  revalidateTag('trending-products');
  if (category) {
    revalidateTag(`products-${category}`);
  }
  console.log(`[revalidateTag] products-all, featured-products, trending-products${category ? `, products-${category}` : ''}`);
}

/**
 * GET /api/admin/products
 * Fetch all products (including inactive products) with exact stock levels
 */
export async function GET() {
  const authResult = await requireStaffOrAdmin();
  if (authResult instanceof NextResponse) return authResult;

  try {
    const rawProducts = await dbService.getAllProducts();
    
    // Server-side field sanitization: strip sales figures for staff role
    const isStaff = authResult.role === 'staff';
    const products = (rawProducts || []).map((p: any) => {
      if (!isStaff) return p;
      const { units_sold, ...staffSafeProduct } = p;
      return staffSafeProduct;
    });

    return NextResponse.json({ products });
  } catch (error) {
    console.error('Admin products GET exception:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

import { verifyCsrfOrigin } from '@/lib/csrf';

async function cleanupCloudinaryAssets(images: any[]) {
  if (!Array.isArray(images) || images.length === 0) return;
  try {
    const { v2: cloudinary } = await import('cloudinary');
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'dtj01pdog';
    const apiKey = process.env.CLOUDINARY_API_KEY || '388993459747447';
    const apiSecret = process.env.CLOUDINARY_API_SECRET || '1IHqRKjnjPKzu7ACR-JbGML7Xts';

    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
      secure: true,
    });

    for (const item of images) {
      const imgUrl = typeof item === 'string' ? item : item?.url || item?.publicId;
      if (!imgUrl) continue;
      let publicId = imgUrl;
      if (imgUrl.includes('/upload/')) {
        const parts = imgUrl.split('/upload/');
        const afterUpload = parts[1] || '';
        const fileWithoutExt = afterUpload.substring(0, afterUpload.lastIndexOf('.')) || afterUpload;
        const pathSegments = fileWithoutExt.split('/').filter((s: string) => !s.match(/^v\d+$/) && !s.includes(','));
        publicId = pathSegments.join('/');
      }
      if (publicId) {
        console.log(`[Server-Side Cloudinary Cleanup] Destroying orphaned asset on DB failure: ${publicId}`);
        await cloudinary.uploader.destroy(publicId).catch(err => console.warn(`Cloudinary destroy warning for ${publicId}:`, err));
      }
    }
  } catch (err) {
    console.error('[Server-Side Cloudinary Cleanup Error]:', err);
  }
}

/**
 * POST /api/admin/products
 * Create a new product with full fields validation
 */
export async function POST(request: Request) {
  const csrfErr = verifyCsrfOrigin(request);
  if (csrfErr) return csrfErr;

  const authResult = await requireStaffOrAdmin();
  if (authResult instanceof NextResponse) return authResult;

  let requestBody: any = null;
  try {
    const body = await request.json();
    requestBody = body;
    
    // Validate request schema
    const validationResult = adminProductSchema.safeParse(body);
    if (!validationResult.success) {
      console.error('Admin product creation validation error:', JSON.stringify(validationResult.error.format()));
      // Server-side cleanup of Cloudinary uploads if request validation fails
      if (body.images) {
        await cleanupCloudinaryAssets(body.images);
      }
      const firstIssue = validationResult.error.issues[0]?.message || 'Invalid product details';
      return NextResponse.json(
        { error: firstIssue, details: validationResult.error.format() },
        { status: 400 }
      );
    }

    // Create product via dbService
    const newProduct = await dbService.createProduct(validationResult.data as any);

    // Save image array & AI metadata to Firestore `products` collection
    try {
      const { firestoreService } = await import('@/lib/firestore');
      const rawImgs: string[] = newProduct.images || body.images || [];
      const formattedImages = rawImgs.map((imgUrl: string, idx: number) => {
        let publicId = imgUrl;
        if (imgUrl.includes('/upload/')) {
          const parts = imgUrl.split('/upload/');
          const pathParts = parts[1].split('/');
          publicId = pathParts.filter(p => !p.match(/^v\d+$/) && !p.includes(',')).join('/');
        }
        return {
          url: imgUrl,
          publicId,
          sortOrder: idx,
        };
      });

      await firestoreService.setDoc('products', newProduct.id, {
        images: formattedImages,
        aiGenerated: body.aiGenerated || {
          usedAI: true,
          generatedAt: new Date().toISOString(),
          model: 'gemini-3.5-flash',
        },
        name: newProduct.name,
        slug: newProduct.slug,
        category: newProduct.category,
        updatedAt: new Date().toISOString(),
      });
    } catch (fsErr) {
      console.warn('[Firestore Sync Warning]:', fsErr);
    }

    // Bust Next.js Data Cache for the new product's category
    bustProductCacheTags(newProduct.category);

    return NextResponse.json({ success: true, product: newProduct });
  } catch (error: any) {
    console.error('Admin products POST exception:', error);
    // Server-side Cloudinary cleanup on Neon DB failure
    if (requestBody && requestBody.images) {
      await cleanupCloudinaryAssets(requestBody.images);
    }
    return NextResponse.json(
      { error: 'Failed to create product in database' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/products
 * Update existing product fields
 */
export async function PATCH(request: Request) {
  const authResult = await requireStaffOrAdmin();
  if (authResult instanceof NextResponse) return authResult;

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const body = await request.json();

    // Check if bulk update
    if (!id && body.ids && Array.isArray(body.ids) && body.ids.length > 0) {
      const { db } = await import('@/db');
      const schema = await import('@/db/schema');
      const { inArray } = await import('drizzle-orm');

      const updateData: Record<string, any> = {
        updated_at: new Date(),
      };

      if (body.weight_grams !== undefined) {
        const weightVal = Number(body.weight_grams);
        if (!isNaN(weightVal) && weightVal > 0) updateData.weight_grams = weightVal;
      }
      if (typeof body.is_active === 'boolean') {
        updateData.is_active = body.is_active;
      }
      if (typeof body.category === 'string' && body.category.trim() !== '') {
        updateData.category = body.category.trim();
      }
      if (typeof body.gender === 'string' && ['women', 'kids', 'unisex'].includes(body.gender)) {
        updateData.gender = body.gender;
      }

      await db
        .update(schema.products)
        .set(updateData)
        .where(inArray(schema.products.id, body.ids));

      bustProductCacheTags();
      return NextResponse.json({ success: true, count: body.ids.length });
    }

    if (!id) {
      return NextResponse.json({ error: 'Product ID parameter is required' }, { status: 400 });
    }
    
    // Partial validation of incoming edits
    const partialProductSchema = adminProductSchema.partial();
    const validationResult = partialProductSchema.safeParse(body);
    if (!validationResult.success) {
      console.error('Admin product patch validation error:', JSON.stringify(validationResult.error.format()));
      const firstIssue = validationResult.error.issues[0]?.message || 'Invalid update inputs';
      return NextResponse.json(
        { error: firstIssue, details: validationResult.error.format() },
        { status: 400 }
      );
    }

    // Update product via dbService
    const updatedProduct = await dbService.updateProduct(id, validationResult.data as any);

    // Save image array & metadata to Firestore `products` collection
    try {
      const { firestoreService } = await import('@/lib/firestore');
      const rawImgs: string[] = updatedProduct.images || body.images || [];
      const formattedImages = rawImgs.map((imgUrl: string, idx: number) => {
        let publicId = imgUrl;
        if (imgUrl.includes('/upload/')) {
          const parts = imgUrl.split('/upload/');
          const pathParts = parts[1].split('/');
          publicId = pathParts.filter(p => !p.match(/^v\d+$/) && !p.includes(',')).join('/');
        }
        return {
          url: imgUrl,
          publicId,
          sortOrder: idx,
        };
      });

      const fsData: Record<string, any> = {
        images: formattedImages,
        name: updatedProduct.name,
        slug: updatedProduct.slug,
        category: updatedProduct.category,
        updatedAt: new Date().toISOString(),
      };
      if (body.aiGenerated) {
        fsData.aiGenerated = body.aiGenerated;
      }

      await firestoreService.setDoc('products', updatedProduct.id, fsData, { merge: true });
    } catch (fsErr) {
      console.warn('[Firestore Sync Warning on PATCH]:', fsErr);
    }

    // Bust Next.js Data Cache — both new category (if changed) and old (conservative)
    bustProductCacheTags(updatedProduct.category);
    // Also bust category from incoming body in case category changed
    if (validationResult.data.category && validationResult.data.category !== updatedProduct.category) {
      revalidateTag(`products-${validationResult.data.category}`);
    }

    return NextResponse.json({ success: true, product: updatedProduct });
  } catch (error: any) {
    console.error('Admin products PATCH exception:', error);
    return NextResponse.json(
      { error: error?.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/products
 * Delete product by ID or bulk delete by IDs array (Admin only)
 */
export async function DELETE(request: Request) {
  const authResult = await requireAdmin();
  if (authResult instanceof NextResponse) return authResult;

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const idsParam = searchParams.get('ids');

    let bodyIds: string[] = [];
    try {
      const body = await request.json();
      if (body?.ids && Array.isArray(body.ids)) bodyIds = body.ids;
    } catch {
      // JSON body is optional
    }

    const targetIds = idsParam ? idsParam.split(',').filter(Boolean) : bodyIds;

    if (targetIds.length > 0) {
      const { db } = await import('@/db');
      const schema = await import('@/db/schema');
      const { inArray } = await import('drizzle-orm');

      await db.delete(schema.products).where(inArray(schema.products.id, targetIds));
      bustProductCacheTags();
      return NextResponse.json({ success: true, deletedCount: targetIds.length });
    }

    if (!id) {
      return NextResponse.json({ error: 'Product ID parameter or ids array is required' }, { status: 400 });
    }

    const success = await dbService.deleteProduct(id);
    if (!success) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Bust all category caches conservatively on delete
    bustProductCacheTags();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Admin products DELETE exception:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
