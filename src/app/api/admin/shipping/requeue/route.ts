import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/admin';
import { verifyCsrfOrigin } from '@/lib/csrf';
import {
  findOrphanedShippingJobs,
  publishQStashShippingJobIdempotent,
} from '@/lib/orchestration/qstash-client';
import { writeAuditLog } from '@/lib/orchestration/audit-service';
import { db } from '@/db';
import * as schema from '@/db/schema';
import { eq, or } from 'drizzle-orm';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

/**
 * POST /api/admin/shipping/requeue
 *
 * Admin retry & requeue endpoint for shipping jobs.
 * Accepts optional body: { jobId?: string, orderId?: string }
 * If specific jobId or orderId is passed:
 *   - Resets status from FAILED to PENDING
 *   - Clears qstash_message_id
 *   - Publishes immediate QStash trigger
 * If no parameter is passed:
 *   - Finds all orphaned/failed shipping jobs and requeues them
 */
export async function POST(request: Request) {
  const csrfErr = verifyCsrfOrigin(request);
  if (csrfErr) return csrfErr;

  const authRes = await requireAdmin();
  if (authRes instanceof NextResponse) return authRes;

  try {
    let body: any = {};
    try {
      body = await request.json();
    } catch {
      // Empty body is acceptable for bulk requeue
    }

    const { jobId, orderId } = body;
    let targetJobs: any[] = [];

    if (jobId) {
      targetJobs = await db
        .select()
        .from(schema.shippingJobs)
        .where(eq(schema.shippingJobs.id, jobId));
    } else if (orderId) {
      targetJobs = await db
        .select()
        .from(schema.shippingJobs)
        .where(eq(schema.shippingJobs.order_id, orderId));
    } else {
      targetJobs = await findOrphanedShippingJobs();
    }

    if (targetJobs.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No eligible shipping jobs found to requeue.',
        requeued: 0,
      });
    }

    const results: Array<{
      jobId: string;
      orderId: string;
      status: 'requeued' | 'failed';
      messageId?: string;
      error?: string;
    }> = [];

    for (const job of targetJobs) {
      const correlationId = crypto.randomUUID();

      // Reset job to PENDING and clear qstash_message_id to allow clean publish
      await db
        .update(schema.shippingJobs)
        .set({
          status: 'PENDING',
          qstash_message_id: null,
          run_after: new Date(),
          updated_at: new Date(),
        })
        .where(eq(schema.shippingJobs.id, job.id));

      try {
        const result = await publishQStashShippingJobIdempotent({
          shippingJobId: job.id,
          orderId: job.order_id,
          correlationId,
          delaySeconds: 0, // Immediate dispatch
        });

        console.log(
          `[Admin Requeue] Shipping job ${job.id} dispatched! QStash Message ID: ${result.messageId || 'none'} (mode: ${result.mode})`
        );

        results.push({
          jobId: job.id,
          orderId: job.order_id,
          status: 'requeued',
          messageId: result.messageId,
        });

        await writeAuditLog({
          orderId: job.order_id,
          correlationId,
          action: 'ADMIN_REQUEUE_SHIPPING_JOB_SUCCESS',
          details: { jobId: job.id, messageId: result.messageId, mode: result.mode },
        });
      } catch (err: any) {
        console.error(`[Admin Requeue] Failed to publish job ${job.id}:`, err?.message);
        results.push({
          jobId: job.id,
          orderId: job.order_id,
          status: 'failed',
          error: err?.message || String(err),
        });

        await writeAuditLog({
          orderId: job.order_id,
          correlationId,
          action: 'ADMIN_REQUEUE_SHIPPING_JOB_FAILED',
          details: { jobId: job.id, error: err?.message || String(err) },
        });
      }
    }

    const requeued = results.filter((r) => r.status === 'requeued').length;
    const failed = results.filter((r) => r.status === 'failed').length;

    return NextResponse.json({
      success: true,
      message: `Requeued ${requeued} shipping job(s). ${failed} failed.`,
      total: targetJobs.length,
      requeued,
      failed,
      results,
    });
  } catch (err: any) {
    console.error('[Admin Requeue] Error:', err);
    return NextResponse.json(
      { error: err?.message || 'Failed to requeue shipping jobs' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ error: 'Method Not Allowed' }, { status: 405 });
}
