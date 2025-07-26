/**
 * Shared utility functions used across domains
 */

import { NODE_ENVIRONMENTS, ENV_CONFIG } from './constants';
import { MONITORING_CONFIG } from '../monitoring/constants';

/** Helper to get environment-specific values */
export const getEnvValue = <T>(
  prodValue: T,
  devValue: T,
  env: string = process.env.NODE_ENV || ENV_CONFIG.DEFAULT_ENV
): T => {
  return env === NODE_ENVIRONMENTS.PRODUCTION ? prodValue : devValue;
};

/** Helper to check if environment is production */
export const isProduction = (env: string = process.env.NODE_ENV || ENV_CONFIG.DEFAULT_ENV): boolean => {
  return env === NODE_ENVIRONMENTS.PRODUCTION;
};

/** Helper to get monitoring config based on environment */
export const getMonitoringConfig = (env: string = process.env.NODE_ENV || ENV_CONFIG.DEFAULT_ENV) => ({
  enableMetrics: isProduction(env),
  enableErrorTracking: true,
  enableAlerts: isProduction(env), 
  logLevel: getEnvValue(
    MONITORING_CONFIG.LOG_LEVELS.PRODUCTION,
    MONITORING_CONFIG.LOG_LEVELS.DEVELOPMENT,
    env
  ),
  sensitiveDataPatterns: MONITORING_CONFIG.SENSITIVE_PATTERNS,
});