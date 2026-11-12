import { NextResponse } from 'next/server';

export const revalidate = 86400; // 24 hours ISR

export async function GET() {
  return NextResponse.json(
    {
      code: 'TGC10',
      value: 10,
      type: 'percent',
    },
    {
      status: 200,
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    }
  );
}
