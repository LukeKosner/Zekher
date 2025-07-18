import {NextRequest, NextResponse} from 'next/server';
import {db} from '@/lib/db';
import {lexiconSources, testimonySources} from '@/lib/db/schema';
import {sql} from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const type = request.nextUrl.searchParams.get('type') as 'lexicon' | 'testimony';
    const page = parseInt(request.nextUrl.searchParams.get('page') || '1');
    const limit = parseInt(request.nextUrl.searchParams.get('limit') || '50');
    const offset = (page - 1) * limit;

    if (!type || !['lexicon', 'testimony'].includes(type)) {
      return NextResponse.json(
        {error: 'Invalid type parameter'},
        {status: 400},
      );
    }

    let sources;
    let totalCount;

    if (type === 'lexicon') {
      // Get lexicon sources with pagination
      const results = await db
        .select()
        .from(lexiconSources)
        .limit(limit)
        .offset(offset);
      const countResult = await db
        .select({count: sql`count(*)`})
        .from(lexiconSources);

      sources = results.map(source => ({
        id: source.id,
        filename: source.filename?.replace(/\.pdf$/i, '') || '',
        title: source.title || source.filename?.replace(/\.pdf$/i, '') || '',
        description: `Holocaust Lexicon entry: ${source.title || source.filename}`,
        tags: [],
        date: source.createdAt,
        featured: false,
      }));

      totalCount = Number(countResult[0]?.count) || 0;
    } else {
      // Get testimony sources with pagination
      const results = await db
        .select()
        .from(testimonySources)
        .limit(limit)
        .offset(offset);
      const countResult = await db
        .select({count: sql`count(*)`})
        .from(testimonySources);

      sources = results.map(source => ({
        id: source.id,
        filename: source.filename.replace(/\.txt$/i, ''),
        title: source.survivor_name || source.filename.replace(/\.txt$/i, ''),
        description:
          source.description || `Survivor testimony by ${source.survivor_name}`,
        tags: [],
        date: source.date || source.createdAt,
        featured: false,
      }));

      totalCount = Number(countResult[0]?.count) || 0;
    }

    return NextResponse.json({
      sources,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
        hasMore: page * limit < totalCount,
      },
    });
  } catch (error) {
    console.error('Error fetching source library:', error);
    return NextResponse.json({error: 'Internal server error'}, {status: 500});
  }
}
