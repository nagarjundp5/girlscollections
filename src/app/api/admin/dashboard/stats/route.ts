import { NextResponse } from 'next/server';
import { db } from '@/db';
import * as schema from '@/db/schema';
import { desc } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // 1. Fetch all orders and products via Drizzle
    const [orders, products] = await Promise.all([
      db.select().from(schema.orders),
      db.select().from(schema.products),
    ]);

    // 2. Setup date boundaries
    const now = new Date();
    
    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);

    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - 7); // Rolling 7-day week
    startOfWeek.setHours(0, 0, 0, 0);

    const startOfMonth = new Date(now);
    startOfMonth.setDate(1); // Calendar month
    startOfMonth.setHours(0, 0, 0, 0);

    // 3. Compute stats
    let revenueToday = 0;
    let revenueWeek = 0;
    let revenueMonth = 0;

    let ordersToday = 0;
    let ordersWeek = 0;
    let ordersMonth = 0;

    let pendingOrders = 0;

    for (const order of orders) {
      const orderDate = new Date(order.created_at);
      const isPaid = order.payment_status === 'paid';
      const isPending = order.order_status !== 'delivered' && order.order_status !== 'cancelled';

      if (isPending) {
        pendingOrders++;
      }

      // Check dates matching
      if (orderDate >= startOfToday) {
        ordersToday++;
        if (isPaid) revenueToday += Number(order.total);
      }
      if (orderDate >= startOfWeek) {
        ordersWeek++;
        if (isPaid) revenueWeek += Number(order.total);
      }
      if (orderDate >= startOfMonth) {
        ordersMonth++;
        if (isPaid) revenueMonth += Number(order.total);
      }
    }

    // 4. Low stock calculation (stock quantity <= 2 in any size)
    const lowStockItems = products
      .filter((product: any) => {
        const stock = (product.stock_quantity || {}) as Record<string, number>;
        return Object.values(stock).some((qty) => qty <= 2);
      })
      .map((product: any) => ({
        id: product.id,
        name: product.name,
        images: product.images,
        sizes: product.sizes,
        stock_quantity: product.stock_quantity,
      }));

    return NextResponse.json({
      revenue: {
        today: revenueToday,
        week: revenueWeek,
        month: revenueMonth,
      },
      orders: {
        today: ordersToday,
        week: ordersWeek,
        month: ordersMonth,
        pending: pendingOrders,
      },
      inventory: {
        totalProducts: products.length,
        activeProducts: products.filter((p: any) => p.is_active).length,
        lowStockItems: lowStockItems,
      },
    });

  } catch (error) {
    console.error('Admin dashboard stats exception:', error);
    return NextResponse.json({ error: 'Internal server error occurred' }, { status: 500 });
  }
}
