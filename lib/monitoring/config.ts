import { MonitoringConfig } from "./types";

/**
 * Default monitoring configuration
 */
export const DEFAULT_CONFIG: MonitoringConfig = {
  enableMetrics: process.env.NODE_ENV === "production",
  enableErrorTracking: true,
  enableAlerts: process.env.NODE_ENV === "production",
  logLevel: process.env.NODE_ENV === "production" ? "warn" : "debug",
  sensitiveDataPatterns: [
    /https:\/\/storage\.googleapis\.com\/[^/]+\/[^/]+\/[^/]+/g, // GCS URLs
    /blob:[^/]+\/[^/]+/g, // Blob URLs
    /DATABASE_URL=.*/g, // Database URLs
    /API_KEY=.*/g, // API keys
    /SECRET=.*/g, // Secrets
  ]
};