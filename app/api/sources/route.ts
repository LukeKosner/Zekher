/**
 * Sources API Route
 * 
 * Handles fetching individual source records from the database.
 * Supports both lexicon and testimony sources with comprehensive error handling.
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { lexiconSources, testimonySources } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { errorMessages } from '@/lib/prompts';
import { SourcesApiErrorResponse } from '@/lib/types';

// Supported source types
const VALID_SOURCE_TYPES = ['lexicon', 'testimony'] as const;
type SourceType = typeof VALID_SOURCE_TYPES[number];

/**
 * Validates source type parameter
 */
function isValidSourceType(type: string): type is SourceType {
  return VALID_SOURCE_TYPES.includes(type as SourceType);
}

/**
 * Creates structured error response
 */
function createErrorResponse(
  error: string,
  errorType: SourcesApiErrorResponse['errorType'],
  status: number,
  metadata: Partial<SourcesApiErrorResponse['metadata']> = {}
): NextResponse {
  const response: SourcesApiErrorResponse = {
    error,
    errorType,
    metadata: {
      timestamp: new Date().toISOString(),
      ...metadata
    }
  };
  
  return NextResponse.json(response, { status });
}

/**
 * Fetches lexicon source by ID
 */
async function fetchLexiconSource(id: string) {
  const result = await db
    .select({
      id: lexiconSources.id,
      filename: lexiconSources.filename,
      title: lexiconSources.title,
    })
    .from(lexiconSources)
    .where(eq(lexiconSources.id, id))
    .limit(1);

  return result[0] || null;
}

/**
 * Fetches testimony source by ID
 */
async function fetchTestimonySource(id: string) {
  const result = await db
    .select({
      id: testimonySources.id,
      filename: testimonySources.filename,
      survivor_name: testimonySources.survivor_name,
    })
    .from(testimonySources)
    .where(eq(testimonySources.id, id))
    .limit(1);

  return result[0] || null;
}

export async function GET(request: NextRequest) {
  try {
    const type = request.nextUrl.searchParams.get('type');
    const id = request.nextUrl.searchParams.get('id');

    // Validate required parameters
    if (!type || !id) {
      return createErrorResponse(
        errorMessages.sources.missingParams,
        'VALIDATION_ERROR',
        400,
        { type: type || undefined, id: id || undefined }
      );
    }

    // Validate source type
    if (!isValidSourceType(type)) {
      return createErrorResponse(
        errorMessages.sources.invalidType,
        'VALIDATION_ERROR',
        400,
        { type, id }
      );
    }

    // Fetch source based on type
    let result;
    if (type === 'lexicon') {
      result = await fetchLexiconSource(id);
    } else {
      result = await fetchTestimonySource(id);
    }

    // Check if source was found
    if (!result) {
      return createErrorResponse(
        errorMessages.sources.notFound,
        'NOT_FOUND',
        404,
        { type, id }
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching source:', error);
    
    // Handle different error types
    const errorMessage = error instanceof Error ? error.message : errorMessages.sources.systemError;
    
    return createErrorResponse(
      errorMessage,
      'SYSTEM_ERROR',
      500,
      { 
        type: request.nextUrl.searchParams.get('type') || undefined,
        id: request.nextUrl.searchParams.get('id') || undefined
      }
    );
  }
}