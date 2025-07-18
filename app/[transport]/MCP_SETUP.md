# Zekher MCP Server Setup

This document describes how to set up and use the Model Context Protocol (MCP) server for the Zekher application.

## Overview

The Zekher MCP server provides AI models with access to lexicon search functionality through the Model Context Protocol. This enables external AI clients to search and retrieve lexical entries from the Zekher database.

## Features

- **Lexicon Search**: Search through lexical entries using natural language terms
- **No Authentication**: Basic setup without authentication requirements
- **Real-time Communication**: Uses Server-Sent Events (SSE) for real-time communication
- **Type Safety**: Full TypeScript support with Zod schema validation

## Installation

The required dependencies are already installed:
- `mcp-handler`: MCP handler for Next.js applications
- `@modelcontextprotocol/sdk`: Official MCP SDK

## Available Tools

### `search_lexicon`

Search for lexical entries in the database.

**Parameters:**
- `terms`: Array of search terms (string[], min: 1, max: 6)

**Returns:**
- Formatted text with matching lexical entries
- Relevance scores and citations
- Next steps suggestions

**Example Usage:**
```json
{
  "terms": ["torah", "mitzvah", "shabbat"]
}
```

## Client Configuration

### Claude Desktop

Add to your Claude Desktop configuration (`~/Library/Application Support/Claude/claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "zekher-lexicon": {
      "command": "npx",
      "args": [
        "-y",
        "mcp-remote",
        "http://localhost:3000/api/mcp"
      ]
    }
  }
}
```

### Cursor

Add to your Cursor MCP configuration (`~/.cursor/mcp.json`):

```json
{
  "mcpServers": {
    "zekher-lexicon": {
      "command": "npx",
      "args": [
        "-y", 
        "mcp-remote",
        "http://localhost:3000/api/mcp"
      ]
    }
  }
}
```

### Windsurf

Add to your Windsurf MCP configuration (`~/.codeium/windsurf/mcp_config.json`):

```json
{
  "mcpServers": {
    "zekher-lexicon": {
      "command": "npx",
      "args": [
        "-y",
        "mcp-remote", 
        "http://localhost:3000/api/mcp"
      ]
    }
  }
}
```

### Direct SSE Connection

For clients that support direct SSE connections:

```json
{
  "mcpServers": {
    "zekher-lexicon": {
      "url": "http://localhost:3000/api/mcp"
    }
  }
}
```

## Development

### Running the Server

Start the development server:

```bash
bun dev
```

The MCP server will be available at `http://localhost:3000/api/mcp`.

### Testing the Connection

You can test the MCP connection using the `mcp-remote` tool:

```bash
npx mcp-remote http://localhost:3000/api/mcp
```

### Debugging

Enable verbose logging by setting `NODE_ENV=development`. The MCP handler will log detailed information about requests and responses.

## Configuration Options

The MCP handler is configured with:

- **Server Name**: "Zekher Lexicon MCP Server"
- **Version**: "1.0.0"
- **Base Path**: "/api"
- **Max Duration**: 60 seconds
- **Verbose Logs**: Enabled in development mode

## Security

Currently, the MCP server is configured without authentication for simplicity. For production use, consider:

1. Adding authentication using the `withMcpAuth` wrapper
2. Implementing rate limiting
3. Adding input validation and sanitization
4. Restricting access to trusted clients

## Architecture

The MCP server integrates with the existing Zekher architecture:

1. **MCP Handler** (`app/api/[transport]/route.ts`): Handles MCP protocol communication
2. **Lexicon Tool** (`lib/tools/lexicon.ts`): Provides lexicon search functionality
3. **Database Layer** (`lib/db/schema.ts`): Manages lexicon data storage
4. **Search Engine** (`lib/search/hybridSearch.ts`): Performs semantic and text search

## File Structure

```
app/api/[transport]/
├── route.ts              # MCP handler implementation
lib/tools/
├── lexicon.ts             # Lexicon search functionality
MCP_SETUP.md              # This documentation file
```

## Troubleshooting

### Common Issues

1. **Connection refused**: Ensure the development server is running
2. **Tool not found**: Check that the MCP handler is properly registered
3. **Search errors**: Verify database connection and lexicon data

### Logs

Check the server logs for detailed error information:

```bash
tail -f logs/combined.log
```

## Next Steps

To enhance the MCP server:

1. Add authentication and authorization
2. Implement additional tools (testimony search, etc.)
3. Add caching for improved performance
4. Implement rate limiting and quota management
5. Add monitoring and analytics