import { describe, test, expect } from 'bun:test';

describe('Lib Module Exports', () => {
  test('shared module exports', async () => {
    const sharedModule = await import('./shared');
    expect(sharedModule.ENV_CONFIG).toBeDefined();
    expect(sharedModule.NODE_ENVIRONMENTS).toBeDefined();
    expect(sharedModule.getEnvValue).toBeDefined();
    expect(sharedModule.isProduction).toBeDefined();
  });

  test('search module exports', async () => {
    const searchModule = await import('./search');
    expect(searchModule.TOOL_LIMITS).toBeDefined();
    expect(searchModule.SEARCH_CONFIG).toBeDefined();
    expect(searchModule.DATABASE_CONFIG).toBeDefined();
  });

  test('monitoring module exports', async () => {
    const monitoringModule = await import('./monitoring');
    expect(monitoringModule.TELEMETRY_CONFIG).toBeDefined();
    expect(monitoringModule.ERROR_TYPES).toBeDefined();
    expect(monitoringModule.SEVERITY_LEVELS).toBeDefined();
  });

  test('navigation module exports', async () => {
    const navigationModule = await import('./navigation');
    expect(navigationModule.NAVIGATION_SECTIONS).toBeDefined();
    expect(navigationModule.ROUTES).toBeDefined();
  });

  test('tools module exports', async () => {
    const toolsModule = await import('./tools');
    expect(toolsModule.toolDescriptions).toBeDefined();
    expect(toolsModule.nextStepsInstructions).toBeDefined();
    expect(toolsModule.errorMessages).toBeDefined();
  });
});