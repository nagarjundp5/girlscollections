export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { db } from '@/db';
import * as schema from '@/db/schema';
import { z } from 'zod';

import { rateLimit } from '@/lib/rateLimit';

const contactSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  message: z.string().min(1).max(2000),
});

export async function POST(request: Request) {
  const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';
  const rl = await rateLimit(`contact:${ip}`, 5, 10 * 60 * 1000);
  if (!rl.success) {
    return NextResponse.json(
      { error: `Too many contact submissions. Retry in ${rl.reset} seconds.` },
      { status: 429, headers: { 'Retry-After': String(rl.reset) } }
    );
  }

  try {
    const body = await request.json();

    // Validate request body
    const validation = contactSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid message contents' }, { status: 400 });
    }

    const { name, email, message } = validation.data;

    // Save submission to database
    const [submission] = await db
      .insert(schema.contactMessages)
      .values({ name, email, message })
      .returning();

    return NextResponse.json({ success: true, submission });
  } catch (error) {
    console.error('Contact submission API Error:', error);
    return NextResponse.json({ error: 'Failed to record message' }, { status: 500 });
  }
}
