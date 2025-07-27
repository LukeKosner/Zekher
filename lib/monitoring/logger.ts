import * as Sentry from "@sentry/nextjs";

// Get the Sentry logger
const { logger } = Sentry;

// Export logger for use throughout the application
export { logger };

// Helper functions for API logging with Sentry tracing
export function logApiRequest(
  method: string,
  endpoint: string,
  metadata: Record<string, any> = {}
) {
  return Sentry.startSpan(
    {
      op: "http.server",
      name: `${method} ${endpoint}`,
    },
    (span) => {
      span.setAttribute("http.method", method);
      span.setAttribute("http.url", endpoint);
      
      Object.entries(metadata).forEach(([key, value]) => {
        span.setAttribute(`request.${key}`, value);
      });

      logger.info(logger.fmt`API Request: ${method} ${endpoint}`, {
        method,
        endpoint,
        ...metadata,
      });

      return span;
    }
  );
}

export function logApiResponse(
  method: string,
  endpoint: string,
  statusCode: number,
  metadata: Record<string, any> = {}
) {
  logger.info(logger.fmt`API Response: ${method} ${endpoint} - ${statusCode}`, {
    method,
    endpoint,
    statusCode,
    ...metadata,
  });
}

export function logApiError(
  method: string,
  endpoint: string,
  error: Error,
  metadata: Record<string, any> = {}
) {
  logger.error(logger.fmt`API Error: ${method} ${endpoint}`, {
    method,
    endpoint,
    error: error.message,
    stack: error.stack,
    ...metadata,
  });
  
  Sentry.captureException(error, {
    tags: {
      component: "api",
      method,
      endpoint,
    },
    extra: metadata,
  });
}

// Utility function for tracing function execution
export function traceFunction<T>(
  name: string,
  op: string,
  fn: () => T | Promise<T>,
  attributes: Record<string, any> = {}
): T | Promise<T> {
  return Sentry.startSpan(
    {
      op,
      name,
    },
    (span) => {
      Object.entries(attributes).forEach(([key, value]) => {
        span.setAttribute(key, value);
      });
      
      return fn();
    }
  );
}