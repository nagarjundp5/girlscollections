import { NextResponse } from 'next/server';
import { firestoreService } from '@/lib/firestore';
import { rateLimit } from '@/lib/rateLimit';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      sessionId,
      draftId,
      userId,
      customerInfo,
      items,
      subtotal,
      verifiedPhone,
      step,
      stepName,
      status,
      failureReason,
      device,
      isCompleted,
    } = body;

    const id = sessionId || draftId;
    if (!id) {
      return NextResponse.json({ error: 'Missing session or draft ID' }, { status: 400 });
    }

    const phone = verifiedPhone || customerInfo?.phone || null;
    const cleanCustomerInfo = customerInfo ? JSON.parse(JSON.stringify(customerInfo, (k, v) => v === undefined ? null : v)) : null;
    const cleanItems = Array.isArray(items) ? JSON.parse(JSON.stringify(items, (k, v) => v === undefined ? null : v)) : [];

    // Map step name
    const resolvedStepName = stepName || (
      step === 1 ? 'address_added' :
      step === 2 ? 'payment_initiated' :
      isCompleted ? 'completed' : 'started'
    );

    const now = new Date().toISOString();

    // 1. Write / Update checkout_sessions (Admin SDK)
    const sessionDoc = {
      sessionId: id,
      userId: userId || null,
      phone: phone || null,
      name: cleanCustomerInfo?.name || null,
      customerInfo: cleanCustomerInfo,
      cartSnapshot: cleanItems,
      total: subtotal || 0,
      step: resolvedStepName,
      status: status || (isCompleted ? 'completed' : 'active'),
      failureReason: failureReason || null,
      device: device || req.headers.get('user-agent') || 'mobile',
      isCompleted: Boolean(isCompleted),
      updatedAt: now,
      createdAt: now,
    };

    await firestoreService.setDoc('checkout_sessions', id, sessionDoc, { merge: true });

    // 2. Debounced write to carts_abandoned (only when identified by phone or userId, debounced 30s)
    if (phone || userId) {
      const identifier = phone || userId;
      const debounceKey = `cart_track_debounce:${identifier}`;
      const rateCheck = await rateLimit(debounceKey, 1, 30000); // Max once per 30s

      if (rateCheck.success) {
        const cartDocId = `cart_${identifier.replace(/\D/g, '') || identifier}`;
        const abandonedDoc = {
          cartId: cartDocId,
          userId: userId || null,
          phone: phone || null,
          name: cleanCustomerInfo?.name || 'Customer',
          items: cleanItems.map((i: any) => ({
            productId: i.id || i.productId,
            name: i.name,
            size: i.size,
            quantity: i.quantity,
            price: i.price,
            image: i.image || '',
          })),
          cartTotal: subtotal || 0,
          status: isCompleted ? 'converted' : 'active',
          sourceDevice: device || req.headers.get('user-agent') || 'mobile',
          lastActivity: now,
          updatedAt: now,
        };

        await firestoreService.setDoc('carts_abandoned', cartDocId, abandonedDoc, { merge: true });
      }
    }

    return NextResponse.json({ ok: true, success: true, id });
  } catch (err: any) {
    console.error('Checkout draft-sync exception:', err);
    return NextResponse.json({ ok: false, success: false, error: err?.message || 'draft sync failed' }, { status: 200 });
  }
}
