import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'Homepage snapshot caching is handled automatically by Vercel Data Cache (revalidateTag)',
    timestamp: new Date().toISOString(),
  });
}

export async function POST(request: Request) {
  return GET();
}
