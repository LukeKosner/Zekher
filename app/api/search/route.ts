import { NextRequest, NextResponse } from 'next/server';
import { searchLexicon } from '@/lib/tools/lexicon-search';
import { z } from 'zod';

// Request schema validation
const searchRequestSchema = z.object({
  terms: z.array(z.string()).min(1).max(6),
  limit: z.number().min(1).max(20).optional().default(6)
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { terms, limit } = searchRequestSchema.parse(body);

    // Execute lexicon search
    const searchResult = await searchLexicon(terms);

    // Handle error response from search
    if (searchResult.error) {
      return NextResponse.json({
        success: false,
        error: searchResult.error,
        entries: [],
        count: 0,
        timestamp: new Date().toISOString()
      }, { status: 400 });
    }

    // Apply limit if specified and different from default
    const entries = searchResult.entries?.slice(0, limit) || [];

    return NextResponse.json({
      success: true,
      query: {
        terms,
        limit
      },
      entries,
      count: entries.length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Lexicon search API error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        error: 'Invalid request parameters',
        details: error.errors
      }, { status: 400 });
    }

    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// GET endpoint for API documentation
export async function GET() {
  return NextResponse.json({
    name: 'Holocaust Lexicon Search API',
    description: 'Search through Holocaust lexicon entries',
    version: '1.0.0',
    endpoints: {
      'POST /api/search': {
        description: 'Search Holocaust lexicon content',
        parameters: {
          terms: {
            type: 'string[]',
            description: 'Array of search terms (1-6 terms)',
            required: true,
            example: ['Holocaust', 'concentration camp']
          },
          limit: {
            type: 'number',
            description: 'Maximum number of results (1-20)',
            default: 6,
            required: false
          }
        },
        example_request: {
          terms: ['Warsaw Ghetto'],
          limit: 3
        },
        example_response: {
          success: true,
          query: {
            terms: ['Warsaw Ghetto'],
            limit: 3
          },
          entries: [
            {
              title: 'Warsaw Ghetto',
              content: 'The Warsaw Ghetto was established...',
              citation: '[Warsaw Ghetto](https://zekher.ai/lexicon/warsaw-ghetto)',
              filename: 'warsaw-ghetto-id',
              pdfUrl: 'https://example.com/pdf'
            }
          ],
          count: 1,
          timestamp: '2025-01-15T10:30:00.000Z'
        }
      }
    },
    usage: {
      authentication: 'None required (public API)',
      rate_limits: 'Standard rate limiting applies',
      cors: 'CORS enabled for cross-origin requests'
    }
  });
}