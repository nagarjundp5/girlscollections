export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { dbService } from '@/lib/db';
import { requireStaffOrAdmin } from '@/lib/auth/admin';

export async function GET(request: Request) {
  const authRes = await requireStaffOrAdmin();
  if (authRes instanceof NextResponse) return authRes;

  try {

    const { searchParams } = new URL(request.url);
    const name = searchParams.get('name');

    if (!name || name.trim().length < 2) {
      return NextResponse.json({ matched: false });
    }

    const result = await dbService.checkProductSimilarity(name);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Check similarity API error:', error);
    return NextResponse.json({ matched: false }, { status: 500 });
  }
}
