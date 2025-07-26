import { describe, test, expect } from 'bun:test';
import {
  NAVIGATION_SECTIONS,
  ROUTES
} from './index';

describe('Navigation Constants', () => {
  test('NAVIGATION_SECTIONS has expected values', () => {
    expect(NAVIGATION_SECTIONS.PROJECT).toBe('Project');
    expect(NAVIGATION_SECTIONS.EVERYONE).toBe('Everyone');
    expect(NAVIGATION_SECTIONS.DEVELOPERS).toBe('Developers');
    expect(NAVIGATION_SECTIONS.UNKNOWN).toBe('Unknown');
  });

  test('ROUTES has expected paths', () => {
    expect(ROUTES.HOME).toBe('/');
    expect(ROUTES.ABOUT).toBe('/about');
    expect(ROUTES.CHAT).toBe('/chat');
    expect(ROUTES.SOURCES).toBe('/sources');
    expect(ROUTES.DEVELOPERS_MCP).toBe('/developers/mcp');
    expect(ROUTES.DEVELOPERS).toBe('/developers');
  });

  test('all routes start with forward slash', () => {
    Object.values(ROUTES).forEach(route => {
      expect(route).toMatch(/^\//);
    });
  });
});