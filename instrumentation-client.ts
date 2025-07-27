// This file configures the initialization of Sentry on the client.
// The added config here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: 'https://9d51e82e70a187500f1c0079b59adbe5@o4509628078882816.ingest.us.sentry.io/4509628080062464',
  integrations: [
    Sentry.replayIntegration(),
    // Send console.log, console.error, and console.warn calls as logs to Sentry
    Sentry.consoleLoggingIntegration({ levels: ["log", "error", "warn"] }),
    Sentry.browserTracingIntegration(),
  ],
  tracesSampleRate: 1,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
  _experiments: {enableLogs: true},
});

// Sentry logger reference and usage examples
const {logger} = Sentry;

// Example logger usage:
// logger.trace("Starting database connection", { database: "users" });
// logger.debug(logger.fmt`Cache miss for user: ${userId}`);
// logger.info("Updated profile", { profileId: 345 });
// logger.warn("Rate limit reached for endpoint", { endpoint: "/api/results/", isEnterprise: false });
// logger.error("Failed to process payment", { orderId: "order_123", amount: 99.99 });
// logger.fatal("Database connection pool exhausted", { database: "users", activeConnections: 100 });

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
