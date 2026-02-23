import { withSentryConfig } from "@sentry/nextjs";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@napi-rs/canvas"],
  outputFileTracingIncludes: {
    "/handler/pdf-preview": [
      "./node_modules/@napi-rs/canvas/**/*",
      "./node_modules/@napi-rs/canvas-*/**/*",
    ],
    "/handler/pdf-preview/route": [
      "./node_modules/@napi-rs/canvas/**/*",
      "./node_modules/@napi-rs/canvas-*/**/*",
    ],
  },
  env: {
    NEXT_PUBLIC_VERCEL_ENV: process.env.VERCEL_ENV
  },
  images: {
    unoptimized: false,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'unsplash.com',
      },
    ],
  },
  async headers() {
    const allowOrigin = process.env.CORS_ALLOW_ORIGIN?.trim();
    const corsHeaders = [
      ...(allowOrigin
        ? [
            {
              key: "Access-Control-Allow-Origin",
              value: allowOrigin,
            },
          ]
        : []),
      {
        key: "Access-Control-Allow-Methods",
        value: "GET, POST, OPTIONS",
      },
      {
        key: "Access-Control-Allow-Headers",
        value: "Content-Type, Authorization",
      },
    ];

    return [
      {
        source: "/api/:path*",
        headers: corsHeaders,
      }
    ];
  }
};

export default withSentryConfig(nextConfig, {
  // For all available options, see:
  // https://www.npmjs.com/package/@sentry/webpack-plugin#options

  org: "zekher",
  project: "javascript-nextjs",

  // Pass the auth token for source map uploads
  authToken: process.env.SENTRY_AUTH_TOKEN,

  // Only print logs for uploading source maps in CI
  silent: !process.env.CI,

  // For all available options, see:
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

  // Upload a larger set of source maps for prettier stack traces (increases build time)
  widenClientFileUpload: true,

  // Route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
  // This can increase your server load as well as your hosting bill.
  // Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
  // side errors will fail.
  tunnelRoute: true,

  // Automatically tree-shake Sentry logger statements to reduce bundle size
  disableLogger: true,

  // Enables automatic instrumentation of Vercel Cron Monitors. (Does not yet work with App Router route handlers.)
  // See the following for more information:
  // https://docs.sentry.io/product/crons/
  // https://vercel.com/docs/cron-jobs
  automaticVercelMonitors: false
});
