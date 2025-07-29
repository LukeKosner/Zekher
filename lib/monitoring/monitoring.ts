import * as Sentry from "@sentry/nextjs";
import { withSpan, addSpanEvent } from "../monitoring/telemetry";
import { 
  ErrorType, 
  Severity, 
  type AudioLoadingMetrics, 
  type CitationUrlMetrics, 
  type MonitoringConfig 
} from "./types";

const { logger } = Sentry;

// Re-export types for backward compatibility
export { ErrorType, Severity, type AudioLoadingMetrics, type CitationUrlMetrics, type MonitoringConfig };

import { DEFAULT_CONFIG } from "./config";

/**
 * Sanitizes error messages to remove sensitive information
 */
function sanitizeErrorMessage(
  message: string,
  config: MonitoringConfig
): string {
  let sanitized = message;

  for (const pattern of config.sensitiveDataPatterns) {
    sanitized = sanitized.replace(pattern, "[REDACTED]");
  }

  return sanitized;
}

/**
 * Sanitizes metadata object to remove sensitive information
 */
function sanitizeMetadata(
  metadata: Record<string, any>,
  config: MonitoringConfig
): Record<string, any> {
  const sanitized: Record<string, any> = {};

  for (const [key, value] of Object.entries(metadata)) {
    if (typeof value === "string") {
      sanitized[key] = sanitizeErrorMessage(value, config);
    } else if (typeof value === "object" && value !== null) {
      sanitized[key] = sanitizeMetadata(value, config);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
}

/**
 * Logs audio loading metrics and errors
 */
export function trackAudioLoading(metrics: AudioLoadingMetrics): Promise<void> {
  const config = DEFAULT_CONFIG;

  return withSpan(
    "api",
    "audio_loading_tracking",
    (span) => {
      const sanitizedMetrics = sanitizeMetadata(metrics, config);

      // Add span attributes
      span.setAttributes({
        "audio.speaker_name": metrics.speakerName,
        "audio.success": metrics.success,
        "audio.fallback_used": metrics.fallbackUsed,
        "audio.url_source": metrics.urlSource,
        "audio.load_time_ms": metrics.loadTimeMs || 0
      });

      if (config.enableMetrics) {
        // Track success/failure metrics
        if (metrics.success) {
          addSpanEvent(span, "audio_loading_success", {
            speaker_name: metrics.speakerName,
            load_time_ms: metrics.loadTimeMs || 0,
            url_source: metrics.urlSource
          });

          if (config.logLevel === "debug") {
            logger.info("Audio loading success", sanitizedMetrics);
          }
        } else {
          addSpanEvent(span, "audio_loading_failure", {
            speaker_name: metrics.speakerName,
            error_type: metrics.errorType || "UNKNOWN",
            fallback_used: metrics.fallbackUsed
          });

          console.warn("Audio loading failure:", sanitizedMetrics);
        }
      }

      if (config.enableErrorTracking && !metrics.success) {
        const sanitizedError = sanitizeErrorMessage(
          metrics.errorMessage || "Unknown audio loading error",
          config
        );

        // Send to Sentry with context
        Sentry.withScope((scope) => {
          scope.setTag("error_type", metrics.errorType || "UNKNOWN");
          scope.setTag("component", "audio_loading");
          scope.setContext("audio_metrics", sanitizedMetrics);

          const severity =
            metrics.errorType === ErrorType.NETWORK ? "warning" : "error";
          scope.setLevel(severity);

          Sentry.captureMessage(
            `Audio loading failed: ${sanitizedError}`,
            severity
          );
        });
      }

      // Alert on critical failures
      if (config.enableAlerts && !metrics.success && !metrics.fallbackUsed) {
        console.error(
          "CRITICAL: Audio loading failed without fallback:",
          sanitizedMetrics
        );

        Sentry.withScope((scope) => {
          scope.setTag("alert_type", "critical_audio_failure");
          scope.setLevel("fatal");
          Sentry.captureMessage(
            `Critical audio loading failure for ${metrics.speakerName}`,
            "fatal"
          );
        });
      }
    },
    {
      operation: "track_audio_loading",
      speaker_name: metrics.speakerName
    }
  );
}

/**
 * Tracks citation URL generation metrics and errors
 */
export function trackCitationUrlGeneration(metrics: CitationUrlMetrics): Promise<void> {
  const config = DEFAULT_CONFIG;

  return withSpan(
    "api",
    "citation_url_tracking",
    (span) => {
      const sanitizedMetrics = sanitizeMetadata(metrics, config);

      // Add span attributes
      span.setAttributes({
        "citation.page_type": metrics.pageType,
        "citation.filename": metrics.filename,
        "citation.success": metrics.success
      });

      if (config.enableMetrics) {
        if (metrics.success) {
          addSpanEvent(span, "citation_url_generation_success", {
            page_type: metrics.pageType,
            filename: metrics.filename
          });

          if (config.logLevel === "debug") {
            logger.info("Citation URL generation success", sanitizedMetrics);
          }
        } else {
          addSpanEvent(span, "citation_url_generation_failure", {
            page_type: metrics.pageType,
            filename: metrics.filename,
            error_type: metrics.errorType || "UNKNOWN"
          });

          console.warn("Citation URL generation failure:", sanitizedMetrics);
        }
      }

      if (config.enableErrorTracking && !metrics.success) {
        const sanitizedError = sanitizeErrorMessage(
          metrics.errorMessage || "Unknown citation URL generation error",
          config
        );

        Sentry.withScope((scope) => {
          scope.setTag("error_type", metrics.errorType || "UNKNOWN");
          scope.setTag("component", "citation_url_generation");
          scope.setContext("citation_metrics", sanitizedMetrics);
          scope.setLevel("error");

          Sentry.captureMessage(
            `Citation URL generation failed: ${sanitizedError}`,
            "error"
          );
        });
      }

      // Alert on high failure rates
      if (config.enableAlerts && !metrics.success) {
        console.error("Citation URL generation failure:", sanitizedMetrics);

        Sentry.withScope((scope) => {
          scope.setTag("alert_type", "citation_url_failure");
          scope.setLevel("error");
          Sentry.captureMessage(
            `Citation URL generation failed for ${metrics.pageType}/${metrics.filename}`,
            "error"
          );
        });
      }
    },
    {
      operation: "track_citation_url_generation",
      page_type: metrics.pageType,
      filename: metrics.filename
    }
  );
}

/**
 * Tracks general URL validation errors
 */
export function trackUrlValidationError(
  url: string,
  errorType: ErrorType,
  errorMessage: string,
  severity: Severity = Severity.MEDIUM
): Promise<void> {
  const config = DEFAULT_CONFIG;
  const sanitizedUrl = sanitizeErrorMessage(url, config);
  const sanitizedError = sanitizeErrorMessage(errorMessage, config);

  return withSpan(
    "api",
    "url_validation_error",
    (span) => {
      span.setAttributes({
        "url_validation.error_type": errorType,
        "url_validation.severity": severity
      });

      if (config.enableErrorTracking) {
        Sentry.withScope((scope) => {
          scope.setTag("error_type", errorType);
          scope.setTag("component", "url_validation");
          scope.setLevel(severity === Severity.CRITICAL ? "fatal" : "error");

          scope.setContext("url_validation", {
            url: sanitizedUrl,
            error_type: errorType,
            severity
          });

          Sentry.captureMessage(
            `URL validation error: ${sanitizedError}`,
            "error"
          );
        });
      }

      console.error("URL validation error:", {
        url: sanitizedUrl,
        errorType,
        errorMessage: sanitizedError,
        severity
      });
    },
    {
      operation: "track_url_validation_error",
      error_type: errorType
    }
  );
}

/**
 * Tracks speaker mapping errors
 */
export function trackSpeakerMappingError(
  speakerName: string,
  errorMessage: string,
  fallbackUsed: boolean = false
): Promise<void> {
  const config = DEFAULT_CONFIG;
  const sanitizedError = sanitizeErrorMessage(errorMessage, config);

  return withSpan(
    "api",
    "speaker_mapping_error",
    (span) => {
      span.setAttributes({
        "speaker_mapping.speaker_name": speakerName,
        "speaker_mapping.fallback_used": fallbackUsed
      });

      if (config.enableErrorTracking) {
        Sentry.withScope((scope) => {
          scope.setTag("error_type", ErrorType.SPEAKER_MAPPING);
          scope.setTag("component", "speaker_mapping");
          scope.setLevel(fallbackUsed ? "warning" : "error");

          scope.setContext("speaker_mapping", {
            speaker_name: speakerName,
            fallback_used: fallbackUsed
          });

          Sentry.captureMessage(
            `Speaker mapping error: ${sanitizedError}`,
            "error"
          );
        });
      }

      const logLevel = fallbackUsed ? "warn" : "error";
      console[logLevel]("Speaker mapping error:", {
        speakerName,
        errorMessage: sanitizedError,
        fallbackUsed
      });
    },
    {
      operation: "track_speaker_mapping_error",
      speaker_name: speakerName
    }
  );
}

/**
 * Tracks blob URL configuration errors
 */
export function trackBlobUrlConfigError(
  errorMessage: string,
  configSection?: string
): Promise<void> {
  const config = DEFAULT_CONFIG;
  const sanitizedError = sanitizeErrorMessage(errorMessage, config);

  return withSpan(
    "api",
    "blob_url_config_error",
    (span) => {
      span.setAttributes({
        "blob_config.section": configSection || "unknown"
      });

      if (config.enableErrorTracking) {
        Sentry.withScope((scope) => {
          scope.setTag("error_type", ErrorType.BLOB_URL_CONFIG);
          scope.setTag("component", "blob_url_config");
          scope.setLevel("warning");

          scope.setContext("blob_config", {
            section: configSection,
            error_message: sanitizedError
          });

          Sentry.captureMessage(
            `Blob URL config error: ${sanitizedError}`,
            "warning"
          );
        });
      }

      console.warn("Blob URL configuration error:", {
        section: configSection,
        errorMessage: sanitizedError
      });
    },
    {
      operation: "track_blob_url_config_error",
      config_section: configSection || "unknown"
    }
  );
}

/**
 * Creates a monitoring context for tracking multiple related operations
 */
export function createMonitoringContext(operationName: string) {
  const startTime = Date.now();
  const metrics = {
    successCount: 0,
    errorCount: 0,
    totalOperations: 0
  };

  return {
    trackSuccess: () => {
      metrics.successCount++;
      metrics.totalOperations++;
    },

    trackError: (errorType: ErrorType, errorMessage: string) => {
      metrics.errorCount++;
      metrics.totalOperations++;

      const config = DEFAULT_CONFIG;
      const sanitizedError = sanitizeErrorMessage(errorMessage, config);

      if (config.enableErrorTracking) {
        Sentry.withScope((scope) => {
          scope.setTag("error_type", errorType);
          scope.setTag("operation", operationName);
          scope.setLevel("error");

          Sentry.captureMessage(
            `${operationName} error: ${sanitizedError}`,
            "error"
          );
        });
      }
    },

    finish: () => {
      const duration = Date.now() - startTime;
      const successRate =
        metrics.totalOperations > 0
          ? (metrics.successCount / metrics.totalOperations) * 100
          : 0;

      logger.info(logger.fmt`Operation completed: ${operationName}`, {
        duration: `${duration}ms`,
        successCount: metrics.successCount,
        errorCount: metrics.errorCount,
        totalOperations: metrics.totalOperations,
        successRate: `${successRate.toFixed(2)}%`
      });

      // Alert on low success rates
      if (
        DEFAULT_CONFIG.enableAlerts &&
        successRate < 80 &&
        metrics.totalOperations >= 5
      ) {
        Sentry.withScope((scope) => {
          scope.setTag("alert_type", "low_success_rate");
          scope.setLevel("warning");

          scope.setContext("operation_metrics", {
            operation: operationName,
            success_rate: successRate,
            total_operations: metrics.totalOperations,
            error_count: metrics.errorCount
          });

          Sentry.captureMessage(
            `Low success rate for ${operationName}: ${successRate.toFixed(2)}%`,
            "warning"
          );
        });
      }

      return {
        duration,
        successCount: metrics.successCount,
        errorCount: metrics.errorCount,
        totalOperations: metrics.totalOperations,
        successRate
      };
    }
  };
}

/**
 * Utility to safely execute operations with monitoring
 */
export async function withMonitoring<T>(
  operationName: string,
  operation: () => Promise<T> | T,
  errorType: ErrorType = ErrorType.CONFIGURATION
): Promise<T> {
  const startTime = Date.now();

  try {
    const result = await operation();
    const duration = Date.now() - startTime;

    if (DEFAULT_CONFIG.logLevel === "debug") {
      logger.info(logger.fmt`Operation completed successfully: ${operationName}`, {
        duration: `${duration}ms`
      });
    }

    return result;
  } catch (error) {
    const duration = Date.now() - startTime;
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    const sanitizedError = sanitizeErrorMessage(errorMessage, DEFAULT_CONFIG);

    console.error(
      `${operationName} failed after ${duration}ms:`,
      sanitizedError
    );

    if (DEFAULT_CONFIG.enableErrorTracking) {
      Sentry.withScope((scope) => {
        scope.setTag("error_type", errorType);
        scope.setTag("operation", operationName);
        scope.setLevel("error");

        scope.setContext("operation_context", {
          operation_name: operationName,
          duration_ms: duration,
          error_message: sanitizedError
        });

        if (error instanceof Error) {
          Sentry.captureException(error);
        } else {
          Sentry.captureMessage(
            `${operationName} failed: ${sanitizedError}`,
            "error"
          );
        }
      });
    }

    throw error;
  }
}
