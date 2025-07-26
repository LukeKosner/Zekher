import { describe, test, expect } from 'bun:test';
import {
  ENV_CONFIG,
  NODE_ENVIRONMENTS,
  DB_DEFAULTS,
  getEnvValue,
  isProduction,
  getMonitoringConfig
} from './index';

describe('Shared Constants', () => {
  test('ENV_CONFIG has expected values', () => {
    expect(ENV_CONFIG.DEFAULT_ENV).toBe('development');
    expect(ENV_CONFIG.DEFAULT_BASE_URL).toBe('https://zekher.com');
    expect(ENV_CONFIG.LOCAL_BASE_URL).toBe('http://localhost:3000');
  });

  test('NODE_ENVIRONMENTS has expected values', () => {
    expect(NODE_ENVIRONMENTS.DEVELOPMENT).toBe('development');
    expect(NODE_ENVIRONMENTS.TEST).toBe('test');
    expect(NODE_ENVIRONMENTS.PRODUCTION).toBe('production');
  });

  test('DB_DEFAULTS has expected values', () => {
    expect(DB_DEFAULTS.ID_LENGTH).toBe(191);
    expect(DB_DEFAULTS.FILENAME_LENGTH).toBe(255);
    expect(DB_DEFAULTS.TITLE_LENGTH).toBe(255);
    expect(DB_DEFAULTS.URL_LENGTH).toBe(500);
  });
});

describe('Shared Utilities', () => {
  test('getEnvValue returns correct values based on environment', () => {
    expect(getEnvValue('prod', 'dev', 'production')).toBe('prod');
    expect(getEnvValue('prod', 'dev', 'development')).toBe('dev');
    expect(getEnvValue('prod', 'dev', 'test')).toBe('dev');
  });

  test('isProduction correctly identifies production environment', () => {
    expect(isProduction('production')).toBe(true);
    expect(isProduction('development')).toBe(false);
    expect(isProduction('test')).toBe(false);
  });

  test('getMonitoringConfig returns correct config based on environment', () => {
    const prodConfig = getMonitoringConfig('production');
    expect(prodConfig.enableMetrics).toBe(true);
    expect(prodConfig.enableAlerts).toBe(true);
    expect(prodConfig.logLevel).toBe('warn');

    const devConfig = getMonitoringConfig('development');
    expect(devConfig.enableMetrics).toBe(false);
    expect(devConfig.enableAlerts).toBe(false);
    expect(devConfig.logLevel).toBe('debug');
  });
});