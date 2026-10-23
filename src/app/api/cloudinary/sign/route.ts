import { NextResponse } from 'next/server';
import { requireStaffOrAdmin } from '@/lib/auth/admin';
import { v2 as cloudinary } from 'cloudinary';

export const dynamic = 'force-dynamic';

export async function POST() {
  const authResult = await requireStaffOrAdmin();
  if (authResult instanceof NextResponse) return authResult;

  try {
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'lt3ga2by';
    const apiKey = process.env.CLOUDINARY_API_KEY || '699839186211678';
    const apiSecret = process.env.CLOUDINARY_API_SECRET || 'UwSFjYh_GRS6gkURYV0lK9Mf6fU';

    if (!apiSecret) {
      return NextResponse.json({ error: 'Cloudinary API secret is not configured on server' }, { status: 500 });
    }

    // Configure Cloudinary server-side
    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
      secure: true,
    });

    const timestamp = Math.floor(Date.now() / 1000);
    const folder = 'tgc/products';

    // Parameters to sign (alphabetical order)
    const paramsToSign = {
      folder,
      timestamp,
    };

    const signature = cloudinary.utils.api_sign_request(paramsToSign, apiSecret);

    return NextResponse.json({
      signature,
      timestamp,
      apiKey,
      cloudName,
      folder,
    });
  } catch (error: any) {
    console.error('Cloudinary sign route error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to generate upload signature' },
      { status: 500 }
    );
  }
}
