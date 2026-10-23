export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/admin';
import { db } from '@/db';
import * as schema from '@/db/schema';
import { logAuditEvent } from '@/lib/audit';
import crypto from 'crypto';

export interface OrphanAsset {
  publicId: string;
  url: string;
  width: number;
  height: number;
  bytes: number;
  format: string;
  createdAt: string;
  ageDays: number;
}

export async function GET() {
  const authRes = await requireAdmin();
  if (authRes instanceof NextResponse) return authRes;

  try {
    const envCloud = process.env.CLOUDINARY_CLOUD_NAME || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const cloudName = envCloud || 'dtj01pdog';
    const apiKey = process.env.CLOUDINARY_API_KEY || '388993459747447';
    const apiSecret = process.env.CLOUDINARY_API_SECRET || '1IHqRKjnjPKzu7ACR-JbGML7Xts';

    // 1. Fetch referenced image URLs from Neon DB
    const dbProducts = await db.select({ images: schema.products.images }).from(schema.products);
    const dbCategories = await db.select({ image_url: schema.categories.image_url }).from(schema.categories);

    const referencedUrls = new Set<string>();

    dbProducts.forEach((p: { images: string[] }) => {
      if (Array.isArray(p.images)) {
        p.images.forEach((img: string) => referencedUrls.add(img));
      }
    });

    dbCategories.forEach((c: { image_url: string | null }) => {
      if (c.image_url) referencedUrls.add(c.image_url);
    });

    // 2. Query Cloudinary Admin API for uploaded resources
    const timestamp = Math.floor(Date.now() / 1000);
    const authString = Buffer.from(`${apiKey}:${apiSecret}`).toString('base64');

    const cloudinaryRes = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/resources/image?max_results=500`,
      {
        headers: {
          Authorization: `Basic ${authString}`,
        },
      }
    );

    if (!cloudinaryRes.ok) {
      const errText = await cloudinaryRes.text();
      return NextResponse.json({ error: `Cloudinary API error: ${errText}` }, { status: 500 });
    }

    const cloudData = await cloudinaryRes.json();
    const resources: any[] = cloudData.resources || [];

    const now = Date.now();
    const orphans: OrphanAsset[] = [];

    resources.forEach((res) => {
      const isReferenced = Array.from(referencedUrls).some((ref) => ref.includes(res.public_id) || ref.includes(res.secure_url));

      const createdTime = new Date(res.created_at).getTime();
      const ageDays = Math.floor((now - createdTime) / (1000 * 60 * 60 * 24));

      // Orphan safety rule: Unreferenced AND older than 7 days
      if (!isReferenced && ageDays >= 7) {
        orphans.push({
          publicId: res.public_id,
          url: res.secure_url,
          width: res.width,
          height: res.height,
          bytes: res.bytes,
          format: res.format,
          createdAt: res.created_at,
          ageDays,
        });
      }
    });

    return NextResponse.json({
      success: true,
      totalCloudinaryResources: resources.length,
      orphanCount: orphans.length,
      orphans,
    });
  } catch (error) {
    console.error('Orphan scanner error:', error);
    return NextResponse.json({ error: 'Failed to scan Cloudinary orphan assets' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const authRes = await requireAdmin();
  if (authRes instanceof NextResponse) return authRes;

  try {
    const body = await request.json();
    const { publicIds } = body as { publicIds: string[] };

    if (!Array.isArray(publicIds) || publicIds.length === 0) {
      return NextResponse.json({ error: 'Array of publicIds is required' }, { status: 400 });
    }

    const envCloud = process.env.CLOUDINARY_CLOUD_NAME || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const cloudName = envCloud || 'dtj01pdog';
    const apiKey = process.env.CLOUDINARY_API_KEY || '388993459747447';
    const apiSecret = process.env.CLOUDINARY_API_SECRET || '1IHqRKjnjPKzu7ACR-JbGML7Xts';

    let deletedCount = 0;

    for (const publicId of publicIds) {
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

      if (cRes.ok) {
        deletedCount++;
        await logAuditEvent({
          action: 'cloudinary.orphan.deleted',
          actorId: authRes.userId,
          details: { publicId },
        });
      }
    }

    return NextResponse.json({ success: true, deletedCount });
  } catch (error) {
    console.error('Orphan delete error:', error);
    return NextResponse.json({ error: 'Failed to delete orphan assets' }, { status: 500 });
  }
}
