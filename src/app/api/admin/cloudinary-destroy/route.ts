export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { requireStaffOrAdmin } from '@/lib/auth/admin';
import { logAuditEvent } from '@/lib/audit';
import { CloudinaryDestroySchema } from '@/lib/validations/admin';

export async function POST(request: Request) {
  const authRes = await requireStaffOrAdmin();
  if (authRes instanceof NextResponse) return authRes;

  try {
    const body = await request.json();
    const validation = CloudinaryDestroySchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid publicId for deletion', details: validation.error.format() }, { status: 400 });
    }

    const { publicId } = validation.data;

    const envCloud = process.env.CLOUDINARY_CLOUD_NAME || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const cloudName = envCloud || 'dtj01pdog';
    const apiKey = process.env.CLOUDINARY_API_KEY || '388993459747447';
    const apiSecret = process.env.CLOUDINARY_API_SECRET || '1IHqRKjnjPKzu7ACR-JbGML7Xts';

    const timestamp = Math.floor(Date.now() / 1000);
    const stringToSign = `public_id=${publicId}&timestamp=${timestamp}${apiSecret}`;
    const signature = crypto.createHash('sha1').update(stringToSign).digest('hex');

    const formData = new URLSearchParams();
    formData.append('public_id', publicId);
    formData.append('api_key', apiKey);
    formData.append('timestamp', String(timestamp));
    formData.append('signature', signature);

    const destroyUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`;
    const cRes = await fetch(destroyUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: formData.toString(),
    });

    const result = await cRes.json();

    if (result.result !== 'ok' && result.result !== 'not found') {
      console.warn('[Cloudinary Destroy Warning]', result);
    }

    await logAuditEvent({
      action: 'cloudinary.asset.deleted',
      actorId: authRes.userId,
      details: { publicId, cloudinary_result: result.result },
    });

    return NextResponse.json({ success: true, result: result.result });
  } catch (error) {
    console.error('Cloudinary destroy API error:', error);
    return NextResponse.json({ error: 'Failed to destroy Cloudinary asset' }, { status: 500 });
  }
}
