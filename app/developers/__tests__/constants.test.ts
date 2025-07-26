import { test, expect, describe } from 'bun:test';
import {
  DEVELOPERS_METADATA,
  MCP_METADATA,
  ANIMATION_CONFIG,
  EXTERNAL_LINKS,
  MCP_SERVER_CONFIG,
  CONTACT,
  MCP_CAPABILITIES,
  PAGE_STYLING,
} from '../constants';

describe('Developers Constants', () => {
  describe('DEVELOPERS_METADATA', () => {
    test('should have correct title and description', () => {
      expect(DEVELOPERS_METADATA.title).toBe('Developers - Zekher');
      expect(DEVELOPERS_METADATA.description).toBe(
        'Developer resources for integrating Zekher\'s Holocaust education tools into your applications.'
      );
    });

    test('should have expected keywords', () => {
      expect(DEVELOPERS_METADATA.keywords).toContain('MCP server');
      expect(DEVELOPERS_METADATA.keywords).toContain('Holocaust API');
      expect(DEVELOPERS_METADATA.keywords.length).toBeGreaterThan(0);
    });

    test('should have openGraph configuration', () => {
      expect(DEVELOPERS_METADATA.openGraph).toBeDefined();
      expect(DEVELOPERS_METADATA.openGraph.type).toBe('website');
    });
  });

  describe('ANIMATION_CONFIG', () => {
    test('should have consistent animation settings', () => {
      expect(ANIMATION_CONFIG.duration).toBe(0.8);
      expect(ANIMATION_CONFIG.ease).toBe('easeOut');
    });

    test('should have progressive delays', () => {
      const delays = Object.values(ANIMATION_CONFIG.delays);
      expect(delays).toEqual([0.2, 0.4, 0.6, 0.8, 1.0]);
    });
  });

  describe('EXTERNAL_LINKS', () => {
    test('should have valid URLs', () => {
      Object.values(EXTERNAL_LINKS).forEach(url => {
        expect(url).toMatch(/^https?:\/\/.+/);
      });
    });
  });

  describe('MCP_SERVER_CONFIG', () => {
    test('should have expected endpoints', () => {
      expect(MCP_SERVER_CONFIG.endpoints.primary).toBe('/sse');
      expect(MCP_SERVER_CONFIG.endpoints.fallback).toBe('/mcp');
    });
  });

  describe('MCP_CAPABILITIES', () => {
    test('should have tools configuration', () => {
      expect(MCP_CAPABILITIES.tools.name).toBe('yad_vashem_holocaust_lexicon');
      expect(MCP_CAPABILITIES.tools.maxResults).toBe(6);
      expect(MCP_CAPABILITIES.tools.maxTerms).toBe(6);
    });

    test('should have prompts configuration', () => {
      expect(MCP_CAPABILITIES.prompts.name).toBe('holocaust_education_context');
      expect(MCP_CAPABILITIES.prompts.description).toContain('context and guidelines');
    });
  });

  describe('PAGE_STYLING', () => {
    test('should have consistent CSS classes', () => {
      expect(PAGE_STYLING.headingClasses).toBe('text-2xl font-semibold');
      expect(PAGE_STYLING.linkClasses).toBe('underline');
    });
  });
});