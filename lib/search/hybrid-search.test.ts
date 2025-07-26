import { describe, test, expect, mock } from 'bun:test';
import { rrfScore } from './hybrid-search';

// Mock database connection for testing
mock.module('@/lib/database', () => ({
  db: {
    select: mock(() => ({
      from: mock(() => ({
        innerJoin: mock(() => ({
          where: mock(() => ({
            limit: mock(() => Promise.resolve([]))
          }))
        })),
        where: mock(() => ({
          orderBy: mock(() => ({
            limit: mock(() => Promise.resolve([]))
          })),
          limit: mock(() => Promise.resolve([]))
        }))
      }))
    }))
  }
}));

describe('Hybrid Search Utilities', () => {
  test('rrfScore calculates correctly', () => {
    expect(rrfScore(1)).toBeCloseTo(1 / 61, 5);
    expect(rrfScore(0)).toBeCloseTo(1 / 60, 5);
    expect(rrfScore(5, 10)).toBeCloseTo(1 / 15, 5);
  });

  test('rrfScore with custom k value', () => {
    const k = 100;
    const rank = 50;
    expect(rrfScore(rank, k)).toBeCloseTo(1 / (k + rank), 5);
  });
});