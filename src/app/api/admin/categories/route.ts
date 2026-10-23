export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { db } from '@/db';
import * as schema from '@/db/schema';
import { eq, desc, or, count, sql } from 'drizzle-orm';
import { requireStaffOrAdmin, requireAdmin } from '@/lib/auth/admin';
import { logAuditEvent } from '@/lib/audit';
import { revalidateCategoryCache } from '@/lib/categories';
import { z } from 'zod';

const categoryInputSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  parent_group: z.string().optional().nullable(),
  age_group: z.enum(['ladies', 'kids', 'unisex']).default('ladies'),
  sort_order: z.number().int().default(0),
  image_url: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  parent_id: z.string().optional().nullable(),
  is_active: z.boolean().default(true),
  display_order: z.number().int().default(0),
});

export async function GET() {
  const authRes = await requireStaffOrAdmin();
  if (authRes instanceof NextResponse) return authRes;

  try {
    const [list, counts] = await Promise.all([
      db.select().from(schema.categories).orderBy(schema.categories.sort_order, desc(schema.categories.created_at)),
      db.select({ category: schema.products.category, cnt: count() }).from(schema.products).groupBy(schema.products.category),
    ]);

    const countMap: Record<string, number> = {};
    counts.forEach((c: { category: string | null; cnt: number | string }) => {
      if (c.category) countMap[c.category] = Number(c.cnt) || 0;
    });

    const categoriesWithCount = list.map((cat: Record<string, any>) => ({
      ...cat,
      productCount: countMap[cat.slug] || 0,
    }));
    
    return NextResponse.json({ categories: categoriesWithCount });
  } catch (error) {
    console.error('Admin categories GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
  }
}

import { verifyCsrfOrigin } from '@/lib/csrf';

export async function POST(request: Request) {
  const csrfErr = verifyCsrfOrigin(request);
  if (csrfErr) return csrfErr;

  const authRes = await requireStaffOrAdmin();
  if (authRes instanceof NextResponse) return authRes;

  try {
    const body = await request.json();
    const validation = categoryInputSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid category inputs', details: validation.error.format() }, { status: 400 });
    }

    const { name, slug, parent_group, age_group, sort_order, image_url, description, parent_id, is_active, display_order } = validation.data;

    // Check slug uniqueness
    const existing = await db
      .select({ id: schema.categories.id })
      .from(schema.categories)
      .where(eq(schema.categories.slug, slug))
      .limit(1);

    if (existing.length > 0) {
      return NextResponse.json({ error: `Category slug "${slug}" is already in use.` }, { status: 400 });
    }

    const [newCat] = await db
      .insert(schema.categories)
      .values({
        name,
        slug,
        parent_group: parent_group || null,
        age_group: age_group || 'ladies',
        sort_order: sort_order || 0,
        image_url: image_url || null,
        description: description || null,
        parent_id: parent_id || null,
        is_active,
        display_order: display_order || sort_order || 0,
      })
      .returning();

    await logAuditEvent({
      action: 'category.create',
      actorId: authRes.userId,
      details: { category_id: newCat.id, name, slug },
    });

    await revalidateCategoryCache();

    return NextResponse.json({ success: true, category: newCat });
  } catch (error) {
    console.error('Admin categories POST error:', error);
    return NextResponse.json({ error: 'Failed to create category' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const csrfErr = verifyCsrfOrigin(request);
  if (csrfErr) return csrfErr;

  const authRes = await requireStaffOrAdmin();
  if (authRes instanceof NextResponse) return authRes;

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Category ID parameter is required' }, { status: 400 });
    }

    const body = await request.json();
    const partialSchema = categoryInputSchema.partial();
    const validation = partialSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid category update inputs', details: validation.error.format() }, { status: 400 });
    }

    if (validation.data.slug) {
      const existing = await db
        .select({ id: schema.categories.id })
        .from(schema.categories)
        .where(eq(schema.categories.slug, validation.data.slug))
        .limit(1);

      if (existing.length > 0 && existing[0].id !== id) {
        return NextResponse.json({ error: `Category slug "${validation.data.slug}" is already in use by another category.` }, { status: 400 });
      }
    }

    const [updatedCat] = await db
      .update(schema.categories)
      .set({
        ...validation.data,
        updated_at: new Date(),
      })
      .where(eq(schema.categories.id, id))
      .returning();

    if (!updatedCat) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    await logAuditEvent({
      action: 'category.update',
      actorId: authRes.userId,
      details: { category_id: id, updates: validation.data },
    });

    await revalidateCategoryCache();

    return NextResponse.json({ success: true, category: updatedCat });
  } catch (error) {
    console.error('Admin categories PATCH error:', error);
    return NextResponse.json({ error: 'Failed to update category' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const csrfErr = verifyCsrfOrigin(request);
  if (csrfErr) return csrfErr;

  const authRes = await requireAdmin();
  if (authRes instanceof NextResponse) return authRes;

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Category ID parameter is required' }, { status: 400 });
    }

    const [category] = await db
      .select()
      .from(schema.categories)
      .where(eq(schema.categories.id, id))
      .limit(1);

    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    // Soft delete category by setting is_active = false
    const [softDeleted] = await db
      .update(schema.categories)
      .set({
        is_active: false,
        updated_at: new Date(),
      })
      .where(eq(schema.categories.id, id))
      .returning();

    await logAuditEvent({
      action: 'category.soft_delete',
      actorId: authRes.userId,
      details: { category_id: id, name: category.name, slug: category.slug },
    });

    await revalidateCategoryCache();

    return NextResponse.json({ success: true, category: softDeleted, message: 'Category deactivated (soft deleted).' });
  } catch (error) {
    console.error('Admin categories DELETE error:', error);
    return NextResponse.json({ error: 'Failed to deactivate category' }, { status: 500 });
  }
}
