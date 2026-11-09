
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

// ── Production Security Guard ──────────────────────────────────────────────
if (process.env.NODE_ENV === 'production' && process.env.SKIP_ADMIN_AUTH === 'true') {
  throw new Error(
    'CRITICAL SECURITY VIOLATION: SKIP_ADMIN_AUTH=true is enabled while NODE_ENV=production. Production builds strictly prohibit bypassing admin authentication.'
  );
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  productionBrowserSourceMaps: false,
  experimental: {
    serverComponentsExternalPackages: ['firebase-admin', '@google-cloud/firestore', '@grpc/grpc-js', 'pg'],
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), browsing-topics=()',
          },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              // Scripts — Clerk JS, Cloudflare Turnstile, Razorpay, Phone.Email, TGC domain
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' blob: https://checkout.razorpay.com https://cdn.razorpay.com https://cdn.jsdelivr.net https://*.clerk.accounts.dev https://*.accounts.dev https://*.clerk.com https://*.clerk.dev https://*.protect.clerk.com https://clerk.browser.js https://challenges.cloudflare.com https://*.phone.email https://auth.phone.email https://user.phone.email https://www.phone.email https://*.thegirlscollections.com https://thegirlscollections.com https://*.vercel.app",
              "script-src-elem 'self' 'unsafe-inline' 'unsafe-eval' blob: https://checkout.razorpay.com https://cdn.razorpay.com https://cdn.jsdelivr.net https://*.clerk.accounts.dev https://*.accounts.dev https://*.clerk.com https://*.clerk.dev https://*.protect.clerk.com https://clerk.browser.js https://challenges.cloudflare.com https://*.phone.email https://auth.phone.email https://user.phone.email https://www.phone.email https://*.thegirlscollections.com https://thegirlscollections.com https://*.vercel.app",
              // Styles
              "style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://*.clerk.com https://*.clerk.accounts.dev https://*.accounts.dev https://*.thegirlscollections.com",
              // Images (Cloudinary CDN, Clerk, local, data, blob)
              "img-src 'self' data: https: blob: https://res.cloudinary.com https://img.clerk.com https://*.clerk.com https://*.phone.email",
              // Connections (fetch/XHR/WebSocket, Clerk FAPI & protect wildcard port, Cloudinary, Razorpay, Upstash, Phone.Email)
              "connect-src 'self' https: wss: blob: https://api.cloudinary.com https://res.cloudinary.com https://api.razorpay.com https://*.clerk.accounts.dev https://*.accounts.dev https://*.clerk.com https://*.clerk.dev https://*.protect.clerk.com:* https://*.thegirlscollections.com https://*.vercel.app https://*.phone.email https://auth.phone.email https://user.phone.email",
              // Workers / service workers
              "worker-src blob: 'self' https://*.clerk.accounts.dev https://*.accounts.dev https://*.clerk.com",
              // Frames — Razorpay, Clerk, Cloudflare Turnstile, Phone.Email
              "frame-src 'self' https://api.razorpay.com https://checkout.razorpay.com https://*.clerk.accounts.dev https://*.accounts.dev https://*.clerk.com https://*.protect.clerk.com https://challenges.cloudflare.com https://*.phone.email https://auth.phone.email https://*.thegirlscollections.com https://*.vercel.app",
              "frame-ancestors 'none'",
              // Fonts
              "font-src 'self' data: https://fonts.gstatic.com https://cdn.jsdelivr.net",
            ].join('; '),
          },
        ],
      },
    ];
  },
  webpack(config, { isServer }) {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        dns: false,
        crypto: false,
        'util/types': false,
      };
    }

    // onnxruntime-web exports "./webgpu" with "node: null" — webpack picks up the
    // node condition and rejects it even for client bundles. Alias directly to the
    // physical file to bypass the broken exports field.
    config.resolve.alias = {
      ...config.resolve.alias,
      'onnxruntime-web/webgpu': resolve(__dirname, 'node_modules/onnxruntime-web/dist/ort.min.js'),
      'onnxruntime-web$': resolve(__dirname, 'node_modules/onnxruntime-web/dist/ort.min.js'),
      'onnxruntime-web': resolve(__dirname, 'node_modules/onnxruntime-web/dist/ort.min.js'),
    };
    
    return config;
  },
};

import { withSentryConfig } from "@sentry/nextjs";

export default withSentryConfig(nextConfig, {
  // For all available options, see:
  // https://github.com/getsentry/sentry-webpack-plugin#options

  org: "webibi",
  project: "javascript-nextjs",

  // Only print logs for uploading source maps in CI or production builds
  silent: !process.env.CI,

  // For all available options, see:
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

  // Upload a larger set of source maps for prettier stack traces (increases build time)
  widenClientFileUpload: true,

  // Route Sentry requests through Tunneling to avoid ad blockers
  // tunnelRoute: "/monitoring",

  // Hides source maps from visitors
  hideSourceMaps: true,

  webpack: {
    // Automatically annotate React components to show their full name in breadcrumbs and stack traces
    reactComponentAnnotation: {
      enabled: true,
    },
    // Enables automatic Instrumentation of Vercel Cron Jobs
    automaticVercelMonitors: true,
    treeshake: {
      // Automatically tree-shake Sentry logger statements to reduce bundle size
      removeDebugLogging: true,
    },
  },
});
