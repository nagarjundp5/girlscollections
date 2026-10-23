export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { db } from '@/db';
import * as schema from '@/db/schema';
import { inArray, eq } from 'drizzle-orm';
import { requireStaffOrAdmin } from '@/lib/auth/admin';
import { logAuditEvent } from '@/lib/audit';
import { BulkReassignSchema } from '@/lib/validations/admin';

export async function POST(request: Request) {
  const authRes = await requireStaffOrAdmin();
  if (authRes instanceof NextResponse) return authRes;

  try {
    const body = await request.json();
    const validation = BulkReassignSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid bulk reassign parameters', details: validation.error.format() }, { status: 400 });
    }

    const { productIds, targetSubcategoryId } = validation.data;

    // 1. Fetch target subcategory to get its slug
    const [targetCat] = await db
      .select()
      .from(schema.categories)
      .where(eq(schema.categories.id, targetSubcategoryId))
      .limit(1);

    if (!targetCat) {
      return NextResponse.json({ error: 'Target subcategory not found' }, { status: 404 });
    }

    // 2. Perform chunked updates (batches of 100 products max per query for safety)
    const BATCH_SIZE = 100;
    let totalUpdated = 0;

    for (let i = 0; i < productIds.length; i += BATCH_SIZE) {
      const batchIds = productIds.slice(i, i + BATCH_SIZE);
      const updatedBatch = await db
        .update(schema.products)
        .set({
          subcategory: targetCat.slug,
          updated_at: new Date(),
        })
        .where(inArray(schema.products.id, batchIds as any))
        .returning({ id: schema.products.id });

      totalUpdated += updatedBatch.length;
    }

    await logAuditEvent({
      action: 'products.bulk_reassign_subcategory',
      actorId: authRes.userId,
      details: {
        product_count: totalUpdated,
        target_subcategory_id: targetSubcategoryId,
        target_subcategory_slug: targetCat.slug,
      },
    });

    return NextResponse.json({
      success: true,
      updatedCount: totalUpdated,
      targetSubcategory: targetCat,
    });
  } catch (error) {
    console.error('Bulk category reassign error:', error);
    return NextResponse.json({ error: 'Failed to reassign products to new subcategory' }, { status: 500 });
  }
}
