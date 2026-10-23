import * as Sentry from "@sentry/nextjs";

const SENTRY_DSN = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN;

Sentry.init({
  dsn: SENTRY_DSN,

  tracesSampleRate: 0.1,
  debug: false,

  beforeSend(event) {
    // Drop development environment errors
    if (process.env.NODE_ENV === "development") {
      return null;
    }
    return event;
  },
});
