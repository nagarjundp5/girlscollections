export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { db } from '@/db';
import * as schema from '@/db/schema';
import { eq } from 'drizzle-orm';
import { requireStaffOrAdmin } from '@/lib/auth/admin';
import { logAuditEvent } from '@/lib/audit';

export async function POST(request: Request) {
  const authRes = await requireStaffOrAdmin();
  if (authRes instanceof NextResponse) return authRes;

  try {
    const { productId } = await request.json();
    if (!productId) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    // 1. Fetch source product
    const [original] = await db
      .select()
      .from(schema.products)
      .where(eq(schema.products.id, productId))
      .limit(1);

    if (!original) {
      return NextResponse.json({ error: 'Source product not found' }, { status: 404 });
    }

    // 2. Generate unique duplicated name and slug
    const copySuffix = Math.floor(1000 + Math.random() * 9000);
    const newName = `${original.name} (Copy)`;
    const newSlug = `${original.slug}-copy-${copySuffix}`;

    // 3. Insert duplicated product
    const [duplicatedProduct] = await db
      .insert(schema.products)
      .values({
        name: newName,
        slug: newSlug,
        description: original.description,
        price: original.price,
        compare_price: original.compare_price,
        category: original.category,
        subcategory: original.subcategory,
        gender: original.gender,
        images: original.images || [],
        sizes: original.sizes || ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
        stock_quantity: original.stock_quantity || { XS: 0, S: 0, M: 0, L: 0, XL: 0, XXL: 0 },
        is_featured: false,
        is_active: original.is_active,
        weight_grams: original.weight_grams || 250,
        length_cm: original.length_cm,
        breadth_cm: original.breadth_cm,
        height_cm: original.height_cm,
      })
      .returning();

    // 4. Fetch and duplicate variants if present
    const originalVariants = await db
      .select()
      .from(schema.productVariants)
      .where(eq(schema.productVariants.product_id, productId));

    if (originalVariants.length > 0) {
      for (const v of originalVariants) {
        const vSku = `${v.sku}-COPY-${copySuffix}`;
        await db.insert(schema.productVariants).values({
          product_id: duplicatedProduct.id,
          colour_name: v.colour_name,
          colour_hex: v.colour_hex,
          images: v.images || [],
          sizes: v.sizes || [],
          stock_quantity: v.stock_quantity || {},
          stock_qty: v.stock_qty || 0,
          sku: vSku,
          price_override: v.price_override,
          is_active: v.is_active,
        });
      }
    }

    await logAuditEvent({
      action: 'products.duplicate',
      actorId: authRes.userId,
      details: {
        original_id: productId,
        new_id: duplicatedProduct.id,
        new_name: newName,
      },
    });

    return NextResponse.json({
      success: true,
      product: duplicatedProduct,
    });
  } catch (error: any) {
    console.error('Product duplication error:', error);
    return NextResponse.json({ error: error.message || 'Failed to duplicate product' }, { status: 500 });
  }
}
