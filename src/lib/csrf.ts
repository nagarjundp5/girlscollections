import { NextResponse } from 'next/server';

/**
 * Validates Same-Origin semantics for state-changing HTTP requests (POST, PUT, PATCH, DELETE).
 * Protects against cross-site request forgery (CSRF) attempts by inspecting Origin and Referer headers.
 */
export function verifyCsrfOrigin(request: Request): NextResponse | null {
  const method = request.method.toUpperCase();
  // Safe methods do not mutate state
  if (['GET', 'HEAD', 'OPTIONS'].includes(method)) {
    return null;
  }

  const origin = request.headers.get('origin');
  const referer = request.headers.get('referer');
  const host = request.headers.get('host');

  if (!host) {
    return NextResponse.json(
      { error: 'Forbidden: Missing Host header' },
      { status: 403 }
    );
  }

  const targetOrigin = origin || (referer ? new URL(referer).origin : null);

  if (!targetOrigin) {
    return NextResponse.json(
      { error: 'Forbidden: Invalid or missing CSRF origin header' },
      { status: 403 }
    );
  }

  try {
    const originUrl = new URL(targetOrigin);
    const originHost = originUrl.host;

    // Allow host matching
    const isHostMatch = originHost === host;
    const isAppUrlMatch = process.env.NEXT_PUBLIC_APP_URL
      ? originUrl.origin === new URL(process.env.NEXT_PUBLIC_APP_URL).origin
      : false;

    if (!isHostMatch && !isAppUrlMatch) {
      return NextResponse.json(
        { error: 'Forbidden: Cross-origin state mutation blocked by CSRF guard' },
        { status: 403 }
      );
    }
  } catch (err) {
    return NextResponse.json(
      { error: 'Forbidden: Malformed CSRF origin header' },
      { status: 403 }
    );
  }

  return null;
}
