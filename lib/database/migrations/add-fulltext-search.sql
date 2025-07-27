-- Add full-text search capabilities for hybrid search

-- Create RRF (Reciprocal Rank Fusion) scoring function
CREATE OR REPLACE FUNCTION rrf_score(rank bigint, rrf_k int DEFAULT 50)
RETURNS numeric
LANGUAGE SQL
IMMUTABLE PARALLEL SAFE
AS $$
    SELECT COALESCE(1.0 / ($1 + $2), 0.0);
$$;

-- Create full-text search indexes for lexicon content
CREATE INDEX IF NOT EXISTS lexicon_sources_content_gin_idx ON "lexiconSources" 
    USING GIN (to_tsvector('english', content));

CREATE INDEX IF NOT EXISTS lexicon_embeddings_content_gin_idx ON "lexiconEmbeddings" 
    USING GIN (to_tsvector('english', content));

-- Create full-text search indexes for testimony content  
CREATE INDEX IF NOT EXISTS testimony_sources_content_gin_idx ON "testimonySources" 
    USING GIN (to_tsvector('english', content));

CREATE INDEX IF NOT EXISTS testimony_embeddings_content_gin_idx ON "testimonyEmbeddings" 
    USING GIN (to_tsvector('english', content));

-- Add indexes for title search as well
CREATE INDEX IF NOT EXISTS lexicon_sources_title_gin_idx ON "lexiconSources" 
    USING GIN (to_tsvector('english', title));
