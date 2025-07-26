import { test, expect, describe } from 'bun:test';
import {
  ABOUT_METADATA,
  ANIMATION_CONFIG,
  EXTERNAL_LINKS,
  INTERNAL_LINKS,
  CONTENT_SECTIONS,
  PAGE_STYLING,
} from '../constants';

describe('About Constants', () => {
  describe('ABOUT_METADATA', () => {
    test('should have correct title and description', () => {
      expect(ABOUT_METADATA.title).toBe('About - Zekher');
      expect(ABOUT_METADATA.description).toContain('Holocaust memory with AI');
    });

    test('should have expected keywords', () => {
      expect(ABOUT_METADATA.keywords).toContain('Holocaust education');
      expect(ABOUT_METADATA.keywords).toContain('AI ethics');
      expect(ABOUT_METADATA.keywords.length).toBeGreaterThan(0);
    });

    test('should have openGraph configuration', () => {
      expect(ABOUT_METADATA.openGraph).toBeDefined();
      expect(ABOUT_METADATA.openGraph.type).toBe('website');
    });
  });

  describe('ANIMATION_CONFIG', () => {
    test('should have consistent animation settings', () => {
      expect(ANIMATION_CONFIG.duration).toBe(0.8);
      expect(ANIMATION_CONFIG.ease).toBe('easeOut');
    });

    test('should have progressive delays', () => {
      const delays = Object.values(ANIMATION_CONFIG.delays);
      expect(delays).toEqual([0.2, 0.4, 0.6]);
    });
  });

  describe('EXTERNAL_LINKS', () => {
    test('should have valid URLs', () => {
      Object.values(EXTERNAL_LINKS).forEach(url => {
        expect(url).toMatch(/^https?:\/\/.+/);
      });
    });

    test('should include key external resources', () => {
      expect(EXTERNAL_LINKS.yadVashemLexicon).toContain('yadvashem.org');
      expect(EXTERNAL_LINKS.boderInterviews).toContain('voices.library.iit.edu');
    });
  });

  describe('INTERNAL_LINKS', () => {
    test('should have valid internal paths', () => {
      Object.values(INTERNAL_LINKS).forEach(path => {
        expect(path).toMatch(/^\/[a-z\/]+$/);
      });
    });
  });

  describe('CONTENT_SECTIONS', () => {
    test('should have all required sections', () => {
      expect(CONTENT_SECTIONS.mission).toBeDefined();
      expect(CONTENT_SECTIONS.problem).toBeDefined();
      expect(CONTENT_SECTIONS.resources).toBeDefined();
    });

    test('should include Hebrew translation for mission', () => {
      expect(CONTENT_SECTIONS.mission.hebrewTranslation).toContain('זכר');
    });
  });

  describe('PAGE_STYLING', () => {
    test('should have consistent CSS classes', () => {
      expect(PAGE_STYLING.headingClasses).toBe('text-2xl font-semibold');
      expect(PAGE_STYLING.linkClasses).toBe('underline');
    });

    test('should have icon styling variants', () => {
      expect(PAGE_STYLING.iconClasses).toBe('inline w-4 h-4');
      expect(PAGE_STYLING.iconWithMargin).toBe('inline w-4 h-4 ml-1');
    });
  });
});