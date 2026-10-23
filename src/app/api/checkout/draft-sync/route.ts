import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { draftId, customerInfo, items, subtotal, verifiedPhone, step, isCompleted } = body;

    if (!draftId) {
      return NextResponse.json({ error: 'Missing draftId' }, { status: 400 });
    }

    // Sanitize object to strip undefined values (Firestore setDoc throws error on undefined)
    const cleanCustomerInfo = customerInfo ? JSON.parse(JSON.stringify(customerInfo, (k, v) => v === undefined ? null : v)) : null;
    const cleanItems = Array.isArray(items) ? JSON.parse(JSON.stringify(items, (k, v) => v === undefined ? null : v)) : [];

    try {
      const draftRef = doc(db, 'draftCheckouts', draftId);
      await setDoc(
        draftRef,
        {
          draftId,
          customerInfo: cleanCustomerInfo,
          items: cleanItems,
          subtotal: subtotal || 0,
          verifiedPhone: verifiedPhone || null,
          step: step || 1,
          isCompleted: !!isCompleted,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
    } catch (firestoreErr: any) {
      console.warn('Firestore draft sync non-fatal warning:', firestoreErr?.message || firestoreErr);
    }

    return NextResponse.json({ success: true, draftId });
  } catch (err: any) {
    console.error('Draft checkout sync error:', err);
    return NextResponse.json({ success: true, warning: err.message || 'Failed to sync draft' });
  }
}
