import {NextRequest, NextResponse} from 'next/server';
import {db} from '@/lib/db';
import {lexiconSources, testimonySources} from '@/lib/db/schema';
import {eq} from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const type = request.nextUrl.searchParams.get('type');
    const id = request.nextUrl.searchParams.get('id');

    if (!type || !id) {
      return NextResponse.json(
        {error: 'Missing type or id parameter'},
        {status: 400},
      );
    }

    let result;
    
    if (type === 'lexicon') {
      const lexiconResult = await db
        .select({
          id: lexiconSources.id,
          filename: lexiconSources.filename,
          title: lexiconSources.title,
        })
        .from(lexiconSources)
        .where(eq(lexiconSources.id, id))
        .limit(1);

      result = lexiconResult[0];
    } else if (type === 'testimony') {
      const testimonyResult = await db
        .select({
          id: testimonySources.id,
          filename: testimonySources.filename,
          survivor_name: testimonySources.survivor_name,
        })
        .from(testimonySources)
        .where(eq(testimonySources.id, id))
        .limit(1);

      result = testimonyResult[0];
    } else {
      return NextResponse.json(
        {error: 'Invalid type parameter'},
        {status: 400},
      );
    }

    if (!result) {
      return NextResponse.json(
        {error: 'Source not found'},
        {status: 404},
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching source:', error);
    return NextResponse.json(
      {error: 'Internal server error'},
      {status: 500},
    );
  }
}