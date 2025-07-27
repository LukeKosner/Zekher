// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: 'https://9d51e82e70a187500f1c0079b59adbe5@o4509628078882816.ingest.us.sentry.io/4509628080062464',

  // Adjust traces sample rate for production
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1,
  
  // Profile sampling rate for performance monitoring
  profilesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1,
  
  sendDefaultPii: true,
  
  integrations: [
    // Send console.log, console.error, and console.warn calls as logs to Sentry
    Sentry.consoleLoggingIntegration({ levels: ["log", "error", "warn"] }),
    Sentry.httpIntegration({
      breadcrumbs: true
    }),
    Sentry.onUncaughtExceptionIntegration({
      exitEvenIfOtherHandlersAreRegistered: false,
    }),
    Sentry.onUnhandledRejectionIntegration({
      mode: 'warn',
    }),
  ],

  
  // Add additional context
  initialScope: {
    tags: {
      component: 'server',
      version: process.env.npm_package_version || 'unknown',
    },
  },

  // Enable Sentry logging
  _experiments: {
    enableLogs: true,
  },
  
  // Capture unhandled promise rejections
  beforeSend(event, hint) {
    // Keep existing filtering logic
    if (process.env.NODE_ENV === 'production') {
      // Skip cancelled requests
      if (event.exception?.values?.some(value => 
        value.value?.includes('AbortError') || 
        value.value?.includes('cancelled')
      )) {
        return null;
      }
      
      // Skip network errors that are likely client-side
      if (event.exception?.values?.some(value => 
        value.value?.includes('Failed to fetch') ||
        value.value?.includes('NetworkError') ||
        value.value?.includes('ERR_BLOCKED_BY_CLIENT')
      )) {
        return null;
      }
    }
    
    return event;
  },
});
