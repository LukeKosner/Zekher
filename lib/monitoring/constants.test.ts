import { describe, test, expect } from 'bun:test';
import {
  TELEMETRY_CONFIG,
  MONITORING_CONFIG,
  ERROR_TYPES,
  SEVERITY_LEVELS,
  SYSTEM_ERROR_INDICATORS
} from './index';

describe('Monitoring Constants', () => {
  test('TELEMETRY_CONFIG has expected structure', () => {
    expect(TELEMETRY_CONFIG.APP_VERSION).toBe('1.0.0');
    expect(TELEMETRY_CONFIG.TRACER_NAMES.API).toBe('holocaust-education-api');
    expect(TELEMETRY_CONFIG.TRACER_NAMES.LEXICON).toBe('lexicon-tool');
    expect(TELEMETRY_CONFIG.TRACER_NAMES.TESTIMONY).toBe('testimony-tool');
    expect(TELEMETRY_CONFIG.TRACER_NAMES.DATABASE).toBe('database');
    expect(TELEMETRY_CONFIG.TRACER_NAMES.SEARCH).toBe('search');
  });

  test('MONITORING_CONFIG has expected thresholds', () => {
    expect(MONITORING_CONFIG.LOG_LEVELS.PRODUCTION).toBe('warn');
    expect(MONITORING_CONFIG.LOG_LEVELS.DEVELOPMENT).toBe('debug');
    expect(MONITORING_CONFIG.THRESHOLDS.MIN_SUCCESS_RATE).toBe(80);
    expect(MONITORING_CONFIG.THRESHOLDS.MIN_OPERATIONS_FOR_RATE).toBe(5);
  });

  test('ERROR_TYPES includes all expected error types', () => {
    expect(ERROR_TYPES.AUDIO_LOADING).toBe('AUDIO_LOADING');
    expect(ERROR_TYPES.CITATION_URL_GENERATION).toBe('CITATION_URL_GENERATION');
    expect(ERROR_TYPES.URL_VALIDATION).toBe('URL_VALIDATION');
    expect(ERROR_TYPES.SPEAKER_MAPPING).toBe('SPEAKER_MAPPING');
    expect(ERROR_TYPES.BLOB_URL_CONFIG).toBe('BLOB_URL_CONFIG');
    expect(ERROR_TYPES.NETWORK).toBe('NETWORK');
    expect(ERROR_TYPES.CONFIGURATION).toBe('CONFIGURATION');
  });

  test('SEVERITY_LEVELS has correct values', () => {
    expect(SEVERITY_LEVELS.LOW).toBe('low');
    expect(SEVERITY_LEVELS.MEDIUM).toBe('medium');
    expect(SEVERITY_LEVELS.HIGH).toBe('high');
    expect(SEVERITY_LEVELS.CRITICAL).toBe('critical');
  });

  test('SYSTEM_ERROR_INDICATORS contains expected patterns', () => {
    expect(SYSTEM_ERROR_INDICATORS).toContain('Database connection failed');
    expect(SYSTEM_ERROR_INDICATORS).toContain('Search service unavailable');
    expect(SYSTEM_ERROR_INDICATORS).toContain('connection');
    expect(SYSTEM_ERROR_INDICATORS).toContain('ECONNREFUSED');
    expect(SYSTEM_ERROR_INDICATORS).toContain('timeout');
    expect(SYSTEM_ERROR_INDICATORS).toContain('unavailable');
    expect(SYSTEM_ERROR_INDICATORS).toContain('service');
  });

  test('MONITORING_CONFIG.SENSITIVE_PATTERNS are valid RegExp objects', () => {
    MONITORING_CONFIG.SENSITIVE_PATTERNS.forEach(pattern => {
      expect(pattern).toBeInstanceOf(RegExp);
    });
  });
});