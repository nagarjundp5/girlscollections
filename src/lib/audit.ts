import { db } from '@/db';
import { auditLogs } from '@/db/schema';
import crypto from 'crypto';

export interface AuditLogOptions {
  action: string;
  orderId?: string | null;
  actorId?: string | null;
  correlationId?: string;
  details?: Record<string, any>;
}

/**
 * Audit Logging Helper
 * Writes admin and system actions to Neon PostgreSQL audit_logs table.
 */
export async function logAuditEvent(options: AuditLogOptions): Promise<void> {
  try {
    const correlationId = options.correlationId || `corr_${crypto.randomBytes(8).toString('hex')}`;
    const detailsObj = {
      ...(options.details || {}),
      actor_id: options.actorId || 'system',
      timestamp: new Date().toISOString(),
    };

    await db.insert(auditLogs).values({
      order_id: options.orderId ? (options.orderId as any) : null,
      correlation_id: correlationId,
      action: options.action,
      worker_id: options.actorId || 'admin_panel',
      details: detailsObj,
    });
  } catch (error) {
    console.error('[AuditLog Error] Failed to record audit log event:', error);
  }
}
