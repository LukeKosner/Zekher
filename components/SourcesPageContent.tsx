'use client';

import {useSearchParams} from 'next/navigation';
import {useEffect, useState} from 'react';
import {AudioPlayerSuspense} from '@/components/audio/AudioPlayerSuspense';
import {ErrorBoundary} from '@/components/ErrorBoundary';
import Link from 'next/link';
import {getLexiconUrl, getAudioUrl, getTestimonyUrl} from '@/lib/utils/blob-urls';

interface Source {
  id: string;
  filename: string;
  title?: string;
  description?: string;
  tags?: string[];
  date?: string;
  featured?: boolean;
}

function SourceLibrary() {
  const [lexiconSources, setLexiconSources] = useState<Source[]>([]);
  const [testimonySources, setTestimonySources] = useState<Source[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'featured' | 'lexicon' | 'testimony'>('featured');
  const [loading, setLoading] = useState(true);
  const [lexiconPage, setLexiconPage] = useState(1);
  const [testimonyPage, setTestimonyPage] = useState(1);
  const [lexiconHasMore, setLexiconHasMore] = useState(true);
  const [testimonyHasMore, setTestimonyHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    const fetchSources = async () => {
      try {
        setLoading(true);
        const [lexiconRes, testimonyRes] = await Promise.all([
          fetch('/data/lexicon.json'),
          fetch('/data/testimony.json')
        ]);
        
        const lexiconData = await lexiconRes.json();
        const testimonyData = await testimonyRes.json();
        
        interface LexiconEntry {
          title: string;
          [key: string]: any;
        }
        
        interface TestimonyEntry {
          title: string;
          interviewee: string;
          [key: string]: any;
        }
        
        const lexiconSources = lexiconData.entries?.map((entry: LexiconEntry, index: number) => ({
          id: `lexicon-${index}`,
          filename: entry.title,
          title: entry.title,
          description: `Holocaust Lexicon entry: ${entry.title}`,
          tags: [],
          featured: false,
        })) || [];
        
        const testimonySources = testimonyData.entries?.map((entry: TestimonyEntry, index: number) => ({
          id: `testimony-${index}`,
          filename: entry.interviewee,
          title: entry.title,
          description: `Survivor testimony: ${entry.title}`,
          tags: [],
          featured: false,
        })) || [];
        
        setLexiconSources(lexiconSources);
        setTestimonySources(testimonySources);
        setLexiconHasMore(false);
        setTestimonyHasMore(false);
      } catch (error) {
        console.error('Failed to fetch sources:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSources();
  }, []);

  const loadMoreSources = async (type: 'lexicon' | 'testimony') => {
    if (loadingMore) return;
    
    const currentPage = type === 'lexicon' ? lexiconPage : testimonyPage;
    const nextPage = currentPage + 1;
    
    try {
      setLoadingMore(true);
      const response = await fetch(`/api/sources/library?type=${type}&page=${nextPage}`);
      const data = await response.json();
      
      if (type === 'lexicon') {
        setLexiconSources(prev => [...prev, ...data.sources]);
        setLexiconPage(nextPage);
        setLexiconHasMore(data.pagination?.hasMore || false);
      } else {
        setTestimonySources(prev => [...prev, ...data.sources]);
        setTestimonyPage(nextPage);
        setTestimonyHasMore(data.pagination?.hasMore || false);
      }
    } catch (error) {
      console.error('Failed to load more sources:', error);
    } finally {
      setLoadingMore(false);
    }
  };

  const filteredLexiconSources = lexiconSources.filter(source =>
    source.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    source.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    source.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filteredTestimonySources = testimonySources.filter(source =>
    source.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    source.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    source.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const featuredLexicon = lexiconSources.filter(source => source.featured);
  const featuredTestimony = testimonySources.filter(source => source.featured);

  const SourceCard = ({ source, type }: { source: Source; type: 'lexicon' | 'testimony' }) => (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <Link
        href={`/sources?pageType=${type}&file=${source.filename}`}
        className="block group"
      >
        <h3 className="text-xl font-semibold mb-2 group-hover:text-blue-600 transition-colors">
          {source.title || source.filename}
        </h3>
        {source.description && (
          <p className="text-gray-600 dark:text-gray-300 mb-3 line-clamp-3">
            {source.description}
          </p>
        )}
        {source.tags && source.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {source.tags.map(tag => (
              <span
                key={tag}
                className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
        {source.date && (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {new Date(source.date).toLocaleDateString()}
          </p>
        )}
      </Link>
    </div>
  );

  if (loading) {
    return (
      <div className="text-center p-8">
        <div
          className="animate-spin inline-block w-8 h-8 border-4 border-current border-t-transparent text-blue-600 rounded-full mb-4"
          role="status"
          aria-label="loading"
        >
          <span className="sr-only">Loading...</span>
        </div>
        <h2 className="text-xl font-semibold mb-2">Loading Source Library</h2>
        <p className="text-gray-600 dark:text-gray-400">
          Please wait while we load the sources...
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto p-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-4">Holocaust Education Source Library</h1>
        <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Explore our comprehensive collection of Holocaust education resources, including authoritative lexicon entries and survivor testimonies. These sources are hosted by Zekher for its users.
        </p>
      </div>

      {/* Search Bar */}
      <div className="mb-8">
        <div className="relative max-w-md mx-auto">
          <input
            type="text"
            placeholder="Search sources..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          />
          <svg
            className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-8">
        <div className="flex justify-center space-x-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg max-w-md mx-auto">
          <button
            onClick={() => setActiveTab('featured')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'featured'
                ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            Featured
          </button>
          <button
            onClick={() => setActiveTab('lexicon')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'lexicon'
                ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            Lexicon ({filteredLexiconSources.length})
          </button>
          <button
            onClick={() => setActiveTab('testimony')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'testimony'
                ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            Testimony ({filteredTestimonySources.length})
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="grid gap-6">
        {activeTab === 'featured' && (
          <div className="space-y-8">
            {featuredLexicon.length > 0 && (
              <section>
                <h2 className="text-2xl font-semibold mb-4">Featured Lexicon Entries</h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {featuredLexicon.map(source => (
                    <SourceCard key={source.id} source={source} type="lexicon" />
                  ))}
                </div>
              </section>
            )}

            {featuredTestimony.length > 0 && (
              <section>
                <h2 className="text-2xl font-semibold mb-4">Featured Testimonies</h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {featuredTestimony.map(source => (
                    <SourceCard key={source.id} source={source} type="testimony" />
                  ))}
                </div>
              </section>
            )}

            {featuredLexicon.length === 0 && featuredTestimony.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-600 dark:text-gray-400">No featured sources available.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'lexicon' && (
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredLexiconSources.length > 0 ? (
                filteredLexiconSources.map(source => (
                  <SourceCard key={source.id} source={source} type="lexicon" />
                ))
              ) : (
                <div className="col-span-full text-center py-12">
                  <p className="text-gray-600 dark:text-gray-400">
                    {searchQuery ? 'No lexicon entries match your search.' : 'No lexicon entries available.'}
                  </p>
                </div>
              )}
            </div>
            {!searchQuery && lexiconHasMore && (
              <div className="text-center">
                <button
                  onClick={() => loadMoreSources('lexicon')}
                  disabled={loadingMore}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loadingMore ? 'Loading...' : 'Load More'}
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'testimony' && (
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTestimonySources.length > 0 ? (
                filteredTestimonySources.map(source => (
                  <SourceCard key={source.id} source={source} type="testimony" />
                ))
              ) : (
                <div className="col-span-full text-center py-12">
                  <p className="text-gray-600 dark:text-gray-400">
                    {searchQuery ? 'No testimonies match your search.' : 'No testimonies available.'}
                  </p>
                </div>
              )}
            </div>
            {!searchQuery && testimonyHasMore && (
              <div className="text-center">
                <button
                  onClick={() => loadMoreSources('testimony')}
                  disabled={loadingMore}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loadingMore ? 'Loading...' : 'Load More'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function SourcesPageInner() {
  const searchParams = useSearchParams();
  const pageType = searchParams.get('pageType');
  const id = searchParams.get('id');
  const file = searchParams.get('file');
  const [textContent, setTextContent] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [actualFilename, setActualFilename] = useState<string | null>(null);

  // For audio segment
  const speakerName = searchParams.get('speakerName');
  const startTime = searchParams.get('startTime');
  const endTime = searchParams.get('endTime');
  const transcriptExcerpt = searchParams.get('transcriptExcerpt');
  const language = searchParams.get('language');
  const significance = searchParams.get('significance');

  // Function to check if a string looks like a database ID (nanoid format)
  const looksLikeDbId = (str: string) => {
    return str && str.length > 10 && /^[A-Za-z0-9_-]+$/.test(str);
  };

  // Effect to lookup filename from database if needed
  useEffect(() => {
    const identifier = file || id;
    if (!identifier || !pageType) return;

    // If the identifier looks like a database ID, fetch the actual filename
    if (looksLikeDbId(identifier)) {
      fetch(`/api/sources?type=${pageType}&id=${identifier}`)
        .then(res => res.json())
        .then(data => {
          if (data.filename) {
            setActualFilename(data.filename.replace(/\.(pdf|txt)$/i, ''));
          }
        })
        .catch(err => {
          console.error('Failed to lookup filename:', err);
          setActualFilename(identifier); // Fallback to original identifier
        });
    } else {
      setActualFilename(identifier);
    }
  }, [pageType, id, file]);

  useEffect(() => {
    if (pageType === 'testimony' && actualFilename) {
      setIsLoading(true);
      setError(null);

      // Fetch TXT file
      fetch(getTestimonyUrl(`txt/${actualFilename}.txt`))
        .then(res => {
          if (!res.ok) throw new Error('File not found');
          return res.text();
        })
        .then(content => {
          setTextContent(content);
          setIsLoading(false);
        })
        .catch(() => {
          setError('Testimony file not found.');
          setIsLoading(false);
        });
    }
  }, [pageType, actualFilename]);

  // PDF path for lexicon - use actualFilename once lookup is complete
  const pdfPath = actualFilename ? getLexiconUrl(`pdf/${actualFilename}.pdf`) : null;
  // MP3 path for audio
  const audioFile = speakerName
    ? getAudioUrl(`${speakerName.split(' ').pop()?.toLowerCase()}.mp3`)
    : null;

  return (
    <div className="flex flex-col items-center justify-center h-full p-4 md:p-6">
      <div className="w-full max-w-2xl mx-auto">
        {!actualFilename && (file || id) ? (
          <div className="text-center p-8">
            <div
              className="animate-spin inline-block w-6 h-6 border-2 border-current border-t-transparent text-blue-600 rounded-full"
              role="status"
              aria-label="loading"
            >
              <span className="sr-only">Loading...</span>
            </div>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Loading source...
            </p>
          </div>
        ) : pageType === 'lexicon' && actualFilename ? (
          <ErrorBoundary componentName="Lexicon PDF Viewer">
            <h2 className="text-2xl md:text-4xl text-center mb-6">
              Holocaust Lexicon Entry
            </h2>
            <object
              data={pdfPath!}
              type="application/pdf"
              width="100%"
              height="800px"
            >
              <p>
                PDF could not be loaded.{' '}
                <a
                  href={pdfPath!}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 underline"
                >
                  Download PDF
                </a>
              </p>
            </object>
          </ErrorBoundary>
        ) : pageType === 'testimony' && actualFilename ? (
          <ErrorBoundary componentName="Testimony Text Viewer">
            <h2 className="text-2xl md:text-4xl text-center mb-6">
              Survivor Testimony
            </h2>
            {error ? (
              <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-red-600 dark:text-red-400">{error}</p>
              </div>
            ) : isLoading ? (
              <div className="text-center p-8">
                <div
                  className="animate-spin inline-block w-6 h-6 border-2 border-current border-t-transparent text-blue-600 rounded-full"
                  role="status"
                  aria-label="loading"
                >
                  <span className="sr-only">Loading...</span>
                </div>
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                  Loading testimony...
                </p>
              </div>
            ) : textContent ? (
              <pre className="whitespace-pre-wrap bg-gray-50 dark:bg-gray-900 rounded-lg p-4 text-sm overflow-x-auto max-h-[700px] border">
                {textContent}
              </pre>
            ) : (
              <div className="text-center p-4 text-gray-600 dark:text-gray-400">
                No content available for this testimony.
              </div>
            )}
          </ErrorBoundary>
        ) : pageType === 'audio' &&
          speakerName &&
          startTime &&
          endTime &&
          transcriptExcerpt &&
          significance ? (
          <ErrorBoundary componentName="Audio Player">
            <h2 className="text-2xl md:text-4xl text-center mb-6">
              Testimony Audio Segment
            </h2>
            <AudioPlayerSuspense
              segment={{
                testimonyId: actualFilename || '',
                speakerName,
                startTime: Number(startTime),
                endTime: Number(endTime),
                transcriptExcerpt,
                language: language || undefined,
                significance,
                audioFile: audioFile || '',
              }}
            />
          </ErrorBoundary>
        ) : (
          <SourceLibrary />
        )}
      </div>
    </div>
  );
}

export function SourcesPageContent() {
  return (
    <ErrorBoundary componentName="Sources Page">
      <SourcesPageInner />
    </ErrorBoundary>
  );
}
