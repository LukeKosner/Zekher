import { test, expect, mock } from 'bun:test';

const mockRedirect = mock(() => {});

// Mock next/navigation
mock.module('next/navigation', () => ({
  redirect: mockRedirect,
}));

// Import after mocking
import DevelopersPage, { metadata } from '../page';

test('DevelopersPage should redirect to /developers/mcp', () => {
  DevelopersPage();
  expect(mockRedirect).toHaveBeenCalledWith('/developers/mcp');
});

test('DevelopersPage should have correct metadata export', () => {
  expect(metadata).toBeDefined();
  expect(metadata.title).toBe('Developers - Zekher');
});