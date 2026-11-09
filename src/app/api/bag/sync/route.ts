import { NextResponse } from 'next/server';
import { db } from '@/db';
import * as schema from '@/db/schema';
import { inArray } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { items } = body;

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ items: [] });
    }

    const productIds: string[] = Array.from(new Set(items.map((i: any) => i.id).filter(Boolean)));
    if (productIds.length === 0) {
      return NextResponse.json({ items: [] });
    }

    // Fetch live products
    const liveProducts = await db
      .select()
      .from(schema.products)
      .where(inArray(schema.products.id, productIds));

    // Fetch live sizes & prices
    const liveSizes = await db
      .select()
      .from(schema.productSizes)
      .where(inArray(schema.productSizes.product_id, productIds));

    const productMap = new Map<string, any>(liveProducts.map((p: any) => [p.id, p]));
    const sizeMap = new Map<string, any>(liveSizes.map((s: any) => [`${s.product_id}:${s.size_key}`, s]));

    const validatedItems: any[] = [];
    const seenCombos = new Set<string>();

    for (const item of items) {
      const comboKey = `${item.id}:${item.size}`;
      if (seenCombos.has(comboKey)) continue;
      seenCombos.add(comboKey);

      const prod = productMap.get(item.id);
      if (!prod || !prod.is_active) continue;

      const sizeRow = sizeMap.get(comboKey);
      const stockQuantityMap = prod.stock_quantity as Record<string, number> | null;
      const availableStock = sizeRow !== undefined ? Number(sizeRow.stock ?? 0) : Number(stockQuantityMap?.[item.size] ?? 0);

      if (availableStock <= 0) continue; // Skip sold-out items

      const livePrice = sizeRow?.price ? (sizeRow.price / 100) : (prod.price / 100);
      const requestedQty = Math.max(1, parseInt(item.quantity) || 1);
      const cappedQty = Math.min(requestedQty, availableStock);

      validatedItems.push({
        ...item,
        price: livePrice,
        quantity: cappedQty,
        stock_quantity: { [item.size]: availableStock },
      });
    }

    return NextResponse.json({
      success: true,
      items: validatedItems,
    });
  } catch (error) {
    console.error('[POST /api/bag/sync error]:', error);
    return NextResponse.json({ error: 'Failed to sync bag' }, { status: 500 });
  }
}
