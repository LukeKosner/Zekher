/**
 * Sources API Route Tests
 * 
 * Comprehensive test suite for the sources API route following the checklist patterns.
 * Tests validation, error handling, database interactions, and response formatting.
 */

// Set test environment before imports
Object.defineProperty(process.env, 'NODE_ENV', {
  value: 'test',
  writable: false
});

import { describe, it, expect, beforeEach, vi, Mock } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from './route';
import { errorMessages } from '@/lib/prompts';

// Mock external dependencies
vi.mock('@/lib/db', () => ({
  db: {
    select: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    limit: vi.fn()
  }
}));

vi.mock('@/lib/db/schema', () => ({
  lexiconSources: {
    id: 'id',
    filename: 'filename',
    title: 'title'
  },
  testimonySources: {
    id: 'id',
    filename: 'filename',
    survivor_name: 'survivor_name'
  }
}));

vi.mock('drizzle-orm', () => ({
  eq: vi.fn()
}));

// Import mocked modules
import { db } from '@/lib/db';

describe('Sources API Route', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Parameter Validation', () => {
    it('should return validation error when type parameter is missing', async () => {
      const request = new NextRequest('http://localhost/api/sources?id=test-id');
      
      const response = await GET(request);
      const data = await response.json();
      
      expect(response.status).toBe(400);
      expect(data.error).toBe(errorMessages.sources.missingParams);
      expect(data.errorType).toBe('VALIDATION_ERROR');
      expect(data.metadata.timestamp).toBeDefined();
    });

    it('should return validation error when id parameter is missing', async () => {
      const request = new NextRequest('http://localhost/api/sources?type=lexicon');
      
      const response = await GET(request);
      const data = await response.json();
      
      expect(response.status).toBe(400);
      expect(data.error).toBe(errorMessages.sources.missingParams);
      expect(data.errorType).toBe('VALIDATION_ERROR');
    });

    it('should return validation error for invalid source type', async () => {
      const request = new NextRequest('http://localhost/api/sources?type=invalid&id=test-id');
      
      const response = await GET(request);
      const data = await response.json();
      
      expect(response.status).toBe(400);
      expect(data.error).toBe(errorMessages.sources.invalidType);
      expect(data.errorType).toBe('VALIDATION_ERROR');
      expect(data.metadata.type).toBe('invalid');
      expect(data.metadata.id).toBe('test-id');
    });

    it('should accept valid lexicon type', async () => {
      const mockResult = [{ id: 'test-id', filename: 'test.pdf', title: 'Test Entry' }];
      (db.limit as Mock).mockResolvedValue(mockResult);
      
      const request = new NextRequest('http://localhost/api/sources?type=lexicon&id=test-id');
      
      const response = await GET(request);
      
      expect(response.status).toBe(200);
    });

    it('should accept valid testimony type', async () => {
      const mockResult = [{ id: 'test-id', filename: 'test.txt', survivor_name: 'Test Survivor' }];
      (db.limit as Mock).mockResolvedValue(mockResult);
      
      const request = new NextRequest('http://localhost/api/sources?type=testimony&id=test-id');
      
      const response = await GET(request);
      
      expect(response.status).toBe(200);
    });
  });

  describe('Database Interactions', () => {
    it('should fetch lexicon source correctly', async () => {
      const mockResult = [{ 
        id: 'lexicon-123', 
        filename: 'holocaust-history.pdf', 
        title: 'Holocaust History' 
      }];
      (db.limit as Mock).mockResolvedValue(mockResult);
      
      const request = new NextRequest('http://localhost/api/sources?type=lexicon&id=lexicon-123');
      
      const response = await GET(request);
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.id).toBe('lexicon-123');
      expect(data.filename).toBe('holocaust-history.pdf');
      expect(data.title).toBe('Holocaust History');
    });

    it('should fetch testimony source correctly', async () => {
      const mockResult = [{ 
        id: 'testimony-456', 
        filename: 'survivor-story.txt', 
        survivor_name: 'John Doe' 
      }];
      (db.limit as Mock).mockResolvedValue(mockResult);
      
      const request = new NextRequest('http://localhost/api/sources?type=testimony&id=testimony-456');
      
      const response = await GET(request);
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.id).toBe('testimony-456');
      expect(data.filename).toBe('survivor-story.txt');
      expect(data.survivor_name).toBe('John Doe');
    });

    it('should return not found when source does not exist', async () => {
      (db.limit as Mock).mockResolvedValue([]);
      
      const request = new NextRequest('http://localhost/api/sources?type=lexicon&id=nonexistent');
      
      const response = await GET(request);
      const data = await response.json();
      
      expect(response.status).toBe(404);
      expect(data.error).toBe(errorMessages.sources.notFound);
      expect(data.errorType).toBe('NOT_FOUND');
      expect(data.metadata.type).toBe('lexicon');
      expect(data.metadata.id).toBe('nonexistent');
    });
  });

  describe('Error Handling', () => {
    it('should handle database errors gracefully', async () => {
      const dbError = new Error('Database connection failed');
      (db.limit as Mock).mockRejectedValue(dbError);
      
      const request = new NextRequest('http://localhost/api/sources?type=lexicon&id=test-id');
      
      const response = await GET(request);
      const data = await response.json();
      
      expect(response.status).toBe(500);
      expect(data.error).toBe('Database connection failed');
      expect(data.errorType).toBe('SYSTEM_ERROR');
      expect(data.metadata.timestamp).toBeDefined();
    });

    it('should handle unknown errors with fallback message', async () => {
      (db.limit as Mock).mockRejectedValue('Unknown error');
      
      const request = new NextRequest('http://localhost/api/sources?type=lexicon&id=test-id');
      
      const response = await GET(request);
      const data = await response.json();
      
      expect(response.status).toBe(500);
      expect(data.error).toBe(errorMessages.sources.systemError);
      expect(data.errorType).toBe('SYSTEM_ERROR');
    });
  });

  describe('Response Formatting', () => {
    it('should return properly structured success response', async () => {
      const mockResult = [{ 
        id: 'test-id', 
        filename: 'test.pdf', 
        title: 'Test Title' 
      }];
      (db.limit as Mock).mockResolvedValue(mockResult);
      
      const request = new NextRequest('http://localhost/api/sources?type=lexicon&id=test-id');
      
      const response = await GET(request);
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data).toEqual(mockResult[0]);
      expect(data.error).toBeUndefined();
    });

    it('should return properly structured error response', async () => {
      const request = new NextRequest('http://localhost/api/sources?type=invalid&id=test-id');
      
      const response = await GET(request);
      const data = await response.json();
      
      expect(data).toHaveProperty('error');
      expect(data).toHaveProperty('errorType');
      expect(data).toHaveProperty('metadata');
      expect(data.metadata).toHaveProperty('timestamp');
      expect(typeof data.metadata.timestamp).toBe('string');
    });

    it('should include request parameters in error metadata', async () => {
      const request = new NextRequest('http://localhost/api/sources?type=invalid&id=test-123');
      
      const response = await GET(request);
      const data = await response.json();
      
      expect(data.metadata.type).toBe('invalid');
      expect(data.metadata.id).toBe('test-123');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty string parameters', async () => {
      const request = new NextRequest('http://localhost/api/sources?type=&id=');
      
      const response = await GET(request);
      const data = await response.json();
      
      expect(response.status).toBe(400);
      expect(data.errorType).toBe('VALIDATION_ERROR');
    });

    it('should handle special characters in parameters', async () => {
      const mockResult = [{ 
        id: 'test-id-with-special-chars', 
        filename: 'test file (1).pdf', 
        title: 'Test & Title' 
      }];
      (db.limit as Mock).mockResolvedValue(mockResult);
      
      const request = new NextRequest('http://localhost/api/sources?type=lexicon&id=test-id-with-special-chars');
      
      const response = await GET(request);
      
      expect(response.status).toBe(200);
    });

    it('should handle very long parameter values', async () => {
      const longId = 'a'.repeat(1000);
      (db.limit as Mock).mockResolvedValue([]);
      
      const request = new NextRequest(`http://localhost/api/sources?type=lexicon&id=${longId}`);
      
      const response = await GET(request);
      const data = await response.json();
      
      expect(response.status).toBe(404);
      expect(data.metadata.id).toBe(longId);
    });
  });

  describe('Type Safety', () => {
    it('should only accept predefined source types', async () => {
      const validTypes = ['lexicon', 'testimony'];
      const invalidTypes = ['audio', 'video', 'document', 'other'];
      
      for (const type of validTypes) {
        (db.limit as Mock).mockResolvedValue([{ id: 'test', filename: 'test', title: 'test' }]);
        const request = new NextRequest(`http://localhost/api/sources?type=${type}&id=test`);
        const response = await GET(request);
        expect(response.status).toBe(200);
      }
      
      for (const type of invalidTypes) {
        const request = new NextRequest(`http://localhost/api/sources?type=${type}&id=test`);
        const response = await GET(request);
        expect(response.status).toBe(400);
      }
    });
  });
});