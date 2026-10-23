import { NextResponse } from 'next/server';
import { db } from '@/db';
import * as schema from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import { z } from 'zod';
import { requireAdmin } from '@/lib/auth/admin';

const discountCodeSchema = z.object({
  code: z.string().min(1),
  discount_type: z.enum(['percentage', 'fixed_amount', 'percent', 'flat']),
  discount_value: z.number().int().positive(),
  min_order_value: z.number().int().nonnegative().default(0),
  max_discount_amount: z.number().int().positive().nullable().optional(),
  usage_limit: z.number().int().positive().nullable().optional(),
  target_phone: z.string().nullable().optional(),
  is_phone_locked: z.boolean().default(false),
  is_active: z.boolean().default(true),
  expires_at: z.string().nullable().optional(),
});

export async function GET() {
  const authResult = await requireAdmin();
  if (authResult instanceof NextResponse) return authResult;

  try {
    const list = await db
      .select()
      .from(schema.discountCodes)
      .orderBy(desc(schema.discountCodes.created_at));
    
    return NextResponse.json({ discountCodes: list });
  } catch (error) {
    console.error('Admin discounts GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch discount codes' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const authResult = await requireAdmin();
  if (authResult instanceof NextResponse) return authResult;

  try {
    const body = await request.json();
    const validation = discountCodeSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid coupon inputs', details: validation.error.format() }, { status: 400 });
    }

    const { code, discount_type, discount_value, min_order_value, max_discount_amount, usage_limit, target_phone, is_phone_locked, is_active, expires_at } = validation.data;
    const cleanCode = code.toUpperCase().trim();
    const cleanPhone = target_phone ? target_phone.replace(/\D/g, '').slice(-10) : null;
    const normalizedType = (discount_type === 'percent' ? 'percentage' : discount_type === 'flat' ? 'fixed_amount' : discount_type) as 'percentage' | 'fixed_amount';

    const [newDiscount] = await db
      .insert(schema.discountCodes)
      .values({
        code: cleanCode,
        discount_type: normalizedType,
        discount_value,
        min_order_value,
        max_discount_amount: max_discount_amount || null,
        usage_limit: usage_limit || null,
        used_count: 0,
        target_phone: cleanPhone,
        is_phone_locked: Boolean(cleanPhone || is_phone_locked),
        is_active,
        expires_at: expires_at ? new Date(expires_at) : null,
        updated_at: new Date(),
      })
      .returning();

    return NextResponse.json({ success: true, discountCode: newDiscount });
  } catch (error) {
    console.error('Admin discounts POST error:', error);
    return NextResponse.json({ error: 'Failed to create discount code' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const authResult = await requireAdmin();
  if (authResult instanceof NextResponse) return authResult;

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Discount code ID parameter is required' }, { status: 400 });
    }

    const body = await request.json();
    const partialSchema = discountCodeSchema.partial();
    const validation = partialSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid coupon updates', details: validation.error.format() }, { status: 400 });
    }

    const updates: any = { ...validation.data, updated_at: new Date() };
    if (updates.code) updates.code = updates.code.toUpperCase().trim();
    if (updates.target_phone !== undefined) {
      updates.target_phone = updates.target_phone ? updates.target_phone.replace(/\D/g, '').slice(-10) : null;
      updates.is_phone_locked = Boolean(updates.target_phone || updates.is_phone_locked);
    }
    if (updates.expires_at !== undefined) updates.expires_at = updates.expires_at ? new Date(updates.expires_at) : null;

    const [updatedDiscount] = await db
      .update(schema.discountCodes)
      .set(updates)
      .where(eq(schema.discountCodes.id, id))
      .returning();

    if (!updatedDiscount) {
      return NextResponse.json({ error: 'Discount code not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, discountCode: updatedDiscount });
  } catch (error) {
    console.error('Admin discounts PATCH error:', error);
    return NextResponse.json({ error: 'Failed to update discount code' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const authResult = await requireAdmin();
  if (authResult instanceof NextResponse) return authResult;

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Discount code ID parameter is required' }, { status: 400 });
    }

    const deleted = await db
      .delete(schema.discountCodes)
      .where(eq(schema.discountCodes.id, id))
      .returning();

    if (deleted.length === 0) {
      return NextResponse.json({ error: 'Discount code not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Admin discounts DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete discount code' }, { status: 500 });
  }
}
