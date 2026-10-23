import { NextResponse } from 'next/server';
import { db } from '@/db';
import * as schema from '@/db/schema';
import { desc } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const list = await db
      .select()
      .from(schema.contactMessages)
      .orderBy(desc(schema.contactMessages.created_at));
    
    return NextResponse.json({ submissions: list });
  } catch (error) {
    console.error('Admin contacts GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch contact messages' }, { status: 500 });
  }
}
