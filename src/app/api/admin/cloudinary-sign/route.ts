export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { requireStaffOrAdmin } from '@/lib/auth/admin';
import { verifyCsrfOrigin } from '@/lib/csrf';

export async function POST(request: Request) {
  const csrfErr = verifyCsrfOrigin(request);
  if (csrfErr) return csrfErr;

  const authResult = await requireStaffOrAdmin();
  if (authResult instanceof NextResponse) return authResult;
  try {
    const body = await request.json();
    const { params } = body; // Parameters sent by the frontend (e.g. folder, timestamp)

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!cloudName || !apiKey || !apiSecret) {
      return NextResponse.json({ error: 'Cloudinary server credentials not configured' }, { status: 500 });
    }

    if (!params) {
      return NextResponse.json({ error: 'Params to sign are required' }, { status: 400 });
    }

    // Sort parameters alphabetically
    const sortedKeys = Object.keys(params).sort();
    const paramString = sortedKeys
      .map((key) => `${key}=${params[key]}`)
      .join('&');

    // Create SHA-1 signature with api_secret
    const stringToSign = `${paramString}${apiSecret}`;
    const signature = crypto.createHash('sha1').update(stringToSign).digest('hex');

    return NextResponse.json({
      signature,
      apiKey,
      cloudName,
      timestamp: params.timestamp,
    });

  } catch (error) {
    console.error('Cloudinary signing server error:', error);
    return NextResponse.json({ error: 'Failed to generate upload signature' }, { status: 500 });
  }
}
