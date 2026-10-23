export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { db } from '@/db';
import * as schema from '@/db/schema';
import { shippingCalculateSchema } from '@/lib/validations';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // 1. Validate inputs (Zod)
    const validationResult = shippingCalculateSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json({ error: 'Invalid calculation payload' }, { status: 400 });
    }

    const { pincode, subtotal } = validationResult.data; // subtotal is in paise

    // 2. Fetch shipping config from database settings
    const dbSettings = await db.select().from(schema.settings);
    let freeShippingThreshold = 99900; // default ₹999 in paise
    let defaultShippingCharge = 9900;  // default ₹99 in paise

    dbSettings.forEach((row: any) => {
      if (row.key === 'free_shipping_threshold') freeShippingThreshold = Number(row.value);
      if (row.key === 'default_shipping_charge') defaultShippingCharge = Number(row.value);
    });

    // 3. Compute shipping charges (both subtotal and settings are in paise)
    const shippingAmount = subtotal >= freeShippingThreshold ? 0 : defaultShippingCharge;
    
    // Estimate delivery duration based on PIN code rules
    // (Bangalore prefix: 560 is 1-2 days, other Karnataka: 5xx is 2-3 days, others 4-6 days)
    const isLocalCity = pincode.startsWith('560');
    const isLocalRegion = pincode.startsWith('5');
    const estDays = isLocalCity ? '1-2 business days (Bangalore Local)' : isLocalRegion ? '2-3 business days' : '4-6 business days';

    return NextResponse.json({
      pincode,
      shipping: shippingAmount,
      estimated_delivery: estDays,
      serviceable: true,
    });

  } catch (error) {
    console.error('Shipping calculation API error:', error);
    return NextResponse.json({ error: 'An unexpected shipping calculator server error occurred' }, { status: 500 });
  }
}
