import * as Sentry from "@sentry/nextjs";

const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN || process.env.SENTRY_DSN;

Sentry.init({
  dsn: SENTRY_DSN,

  tracesSampleRate: 0.1,
  debug: false,

  beforeSend(event) {
    // 1. Drop localhost/development errors
    if (process.env.NODE_ENV === "development") {
      return null;
    }

    // 2. Drop browser extension/noise errors
    const errorMessage = event.exception?.values?.[0]?.value || "";
    const ignoredPatterns = [
      "extensions/",
      "chrome-extension://",
      "moz-extension://",
      "safari-web-extension://",
      "top.GLOBALS",
      "canvas.toDataURL",
      "ResizeObserver loop",
      "Script error",
    ];

    if (ignoredPatterns.some((pattern) => errorMessage.includes(pattern))) {
      return null;
    }

    return event;
  },
});
