/**
 * Utilities for masking PII in logs to ensure zero customer data leaks.
 */
export function maskEmail(email?: string | null): string {
  if (!email || !email.includes('@')) return '***@***.***';
  const [local, domain] = email.split('@');
  if (local.length <= 2) return `*@${domain}`;
  return `${local[0]}***${local[local.length - 1]}@${domain}`;
}

export function maskPhone(phone?: string | null): string {
  if (!phone) return '**********';
  const clean = phone.replace(/\D/g, '');
  if (clean.length < 4) return '****';
  return `******${clean.slice(-4)}`;
}
