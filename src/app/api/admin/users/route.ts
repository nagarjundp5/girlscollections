import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/admin';
import { db } from '@/db';
import * as schema from '@/db/schema';
import { desc, eq, or, ilike, sql } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const authRes = await requireAdmin();
  if (authRes instanceof NextResponse) return authRes;

  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const page = Math.max(1, Number(searchParams.get('page') || '1'));
    const limit = Math.max(1, Number(searchParams.get('limit') || '25'));
    const offset = (page - 1) * limit;

    let searchCondition = undefined;
    if (search.trim()) {
      const pattern = `%${search.trim()}%`;
      searchCondition = or(
        ilike(schema.users.name, pattern),
        ilike(schema.users.phone, pattern),
        ilike(schema.users.email, pattern)
      );
    }

    // 1. Total Count query for pagination
    const countQuery = db
      .select({ count: sql<number>`count(distinct ${schema.users.id})::int` })
      .from(schema.users);

    if (searchCondition) {
      countQuery.where(searchCondition);
    }
    const [countResult] = await countQuery;
    const totalCount = countResult?.count || 0;

    // 2. Fetch users + orders
    const usersQuery = db
      .select({
        id: schema.users.id,
        name: schema.users.name,
        phone: schema.users.phone,
        email: schema.users.email,
        createdAt: schema.users.created_at,
        authProvider: schema.users.auth_provider,
        totalOrders: sql<number>`count(${schema.orders.id})::int`,
      })
      .from(schema.users)
      .leftJoin(schema.orders, eq(schema.users.id, schema.orders.user_id));

    if (searchCondition) {
      usersQuery.where(searchCondition);
    }

    const items = await usersQuery
      .groupBy(schema.users.id)
      .orderBy(desc(schema.users.created_at))
      .limit(limit)
      .offset(offset);

    return NextResponse.json({
      success: true,
      users: items,
      pagination: {
        total: totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit),
      }
    });

  } catch (error) {
    console.error('Admin Registered Users API error:', error);
    return NextResponse.json({ error: 'Internal server error occurred' }, { status: 500 });
  }
}
