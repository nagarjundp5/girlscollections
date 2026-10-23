export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { db } from '@/db';
import * as schema from '@/db/schema';
import { sql, eq, and, gte, notInArray, count, sum } from 'drizzle-orm';
import { requireAdmin } from '@/lib/auth/admin';

export async function GET(request: Request) {
  const authRes = await requireAdmin();
  if (authRes instanceof NextResponse) return authRes;

  try {
    const { searchParams } = new URL(request.url);
    const range = searchParams.get('range') || 'month'; // 'today' | 'week' | 'month'

    const now = new Date();
    let startDate = new Date();

    if (range === 'today') {
      startDate.setHours(0, 0, 0, 0);
    } else if (range === 'week') {
      startDate.setDate(now.getDate() - 7);
    } else {
      // Month
      startDate.setDate(1);
      startDate.setHours(0, 0, 0, 0);
    }

    // 1. Authoritative Financial & Order Metrics from Neon PostgreSQL
    const [orderMetrics] = await db
      .select({
        totalOrders: count(),
        totalRevenuePaise: sum(schema.orders.total),
      })
      .from(schema.orders)
      .where(
        and(
          gte(schema.orders.created_at, startDate),
          eq(schema.orders.payment_status, 'paid'),
          notInArray(schema.orders.order_status, ['cancelled', 'failed', 'expired'])
        )
      );

    const [pendingOrdersResult] = await db
      .select({ count: count() })
      .from(schema.orders)
      .where(eq(schema.orders.order_status, 'placed'));

    // 2. Authoritative Catalog & Category Metrics
    const allProducts = await db.select().from(schema.products);
    const allCategories = await db.select().from(schema.categories);

    let lowStockCount = 0;
    const categoryProductCounts: Record<string, number> = {};

    allProducts.forEach((p: any) => {
      // Check low stock (< 5 total stock)
      const stockVals = Object.values(p.stock_quantity || {}) as number[];
      const totalStock = stockVals.reduce((acc: number, qty: number) => acc + (qty || 0), 0);
      if (totalStock < 5) lowStockCount++;

      if (p.subcategory) {
        categoryProductCounts[p.subcategory] = (categoryProductCounts[p.subcategory] || 0) + 1;
      }
      if (p.category) {
        categoryProductCounts[p.category] = (categoryProductCounts[p.category] || 0) + 1;
      }
    });

    // Category Health Analysis (subcategories with 0 or < 2 products)
    const categoryHealth = allCategories
      .filter((c: any) => c.is_active)
      .map((c: any) => {
        const prodCount = categoryProductCounts[c.slug] || 0;
        return {
          id: c.id,
          name: c.name,
          slug: c.slug,
          productCount: prodCount,
          isHealthy: prodCount >= 2,
        };
      })
      .sort((a: any, b: any) => a.productCount - b.productCount);

    const totalRevenueRupees = Math.round((Number(orderMetrics?.totalRevenuePaise || 0)) / 100);

    return NextResponse.json({
      success: true,
      range,
      metrics: {
        totalOrders: Number(orderMetrics?.totalOrders || 0),
        totalRevenue: totalRevenueRupees,
        pendingOrders: Number(pendingOrdersResult?.count || 0),
        totalProducts: allProducts.length,
        lowStockAlerts: lowStockCount,
        categoryCount: allCategories.length,
      },
      categoryHealth,
    });
  } catch (error) {
    console.error('Dashboard API error:', error);
    return NextResponse.json({ error: 'Failed to aggregate dashboard analytics' }, { status: 500 });
  }
}
