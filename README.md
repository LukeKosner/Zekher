# Zekher (זכר) - Holocaust Education Platform

**Zekher** (Hebrew for "memory") is an AI-powered Holocaust education platform that provides responsible access to historical information and survivor testimonies. Built to combat Holocaust memory challenges from generative AI by providing factual information from authoritative sources.

## ⚠️ Private Beta Disclaimer

**This application is currently in private beta and is not recommended for production use.**

- **Experimental Technology**: This platform uses experimental AI technology that may produce inaccurate, incomplete, or inappropriate responses
- **Potential Hallucinations**: AI models may generate false information or "hallucinate" facts that are not historically accurate
- **Educational Use Only**: This tool is intended for educational exploration and should not be considered a definitive source of historical information
- **Verify Information**: Always cross-reference AI responses with authoritative historical sources and scholarly materials
- **Sensitive Content**: The platform deals with Holocaust history and may generate content that could be disturbing or inappropriate
- **No Warranty**: The platform is provided "as is" without any warranties regarding accuracy, completeness, or appropriateness of content

**For authoritative Holocaust education, please consult established institutions like the United States Holocaust Memorial Museum, Yad Vashem, and peer-reviewed academic sources.**

## 🎯 Mission

Combat Holocaust memory challenges from generative AI by providing AI models with factual information from authoritative sources rather than ignoring AI's educational potential.

## ✨ Features

- **AI Chat Interface** - Educational conversations about Holocaust history
- **Authoritative Sources** - Historical facts from Yad Vashem's Holocaust Lexicon
- **Survivor Testimonies** - Personal accounts collected by Dr. David P. Boder
- **Audio Integration** - Access to original survivor testimony recordings
- **MCP** - Integration endpoints for educational applications
- **Hybrid Search** - Combines semantic and text-based search for accurate results

## 🏗️ Technology Stack

### Core Framework

- **Next.js 15** (App Router) - React framework with server-side rendering
- **React 19** - UI library with latest features
- **TypeScript** - Type-safe JavaScript development
- **Bun** - Fast JavaScript runtime and package manager

### Database & Search

- **PostgreSQL** - Primary database with vector extensions
- **Drizzle ORM** - Type-safe database toolkit
- **Vector Embeddings** - 1536-dimensional embeddings for semantic search
- **Hybrid Search** - Combines semantic and text-based search

### AI & Language Models

- **AI SDK** - Vercel's AI toolkit for streaming responses
- **Google Gemini 2.5 Pro** - Primary language model

### UI & Styling

- **Tailwind CSS 4** - Utility-first CSS framework
- **Radix UI** - Accessible component primitives
- **Motion** - Animation library
- **Lucide React** - Icon library

## 🚀 Getting Started

### Prerequisites

- [Bun](https://bun.sh/) - JavaScript runtime and package manager
- [PostgreSQL](https://postgresql.org/) - Database with vector extensions
- Environment variables (see `.env.local.example`)

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd zekher
```

2. Install dependencies:

```bash
bun install
```

3. Set up environment variables:

```bash
cp .env.local.example .env.local
# Edit .env.local with your configuration
```

4. Set up the database:

```bash
bun db:generate
bun db:migrate
```

5. Ingest data sources:

```bash
bun ingest
```

6. Start the development server:

```bash
bun dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the application.

## 📁 Project Structure

```
├── app/                    # Next.js App Router
│   ├── api/               # API routes (chat endpoint)
│   ├── about/             # About page
│   ├── build/             # Build page
│   ├── chat/              # Chat interface
│   ├── components/        # Page-specific components
│   ├── handler/           # MCP handler routes
│   ├── mcp/               # MCP configuration page
│   └── sources/           # Data sources page
├── components/            # Reusable React components
│   ├── layout/            # Layout components
│   └── ui/                # UI component library
├── docs/                  # Documentation
├── hooks/                 # Custom React hooks
├── lib/                   # Core business logic
│   ├── database/          # Database layer & schema
│   ├── ingestion/         # Data processing pipeline
│   ├── monitoring/        # Error tracking & analytics
│   ├── navigation/        # Navigation utilities
│   ├── search/            # Search infrastructure
│   ├── shared/            # Shared utilities
│   ├── tools/             # AI tool implementations
│   └── utils/             # General utilities
└── public/                # Static assets & images
```

## 🛠️ Development Commands

### Development

```bash
bun dev              # Start development server
bun build            # Build for production
bun start            # Start production server
bun lint             # Run ESLint
bun type-check       # TypeScript type checking
```

### Database

```bash
bun db:generate      # Generate Drizzle migrations
bun db:migrate       # Run database migrations
bun db:studio        # Open Drizzle Studio
bun db:push          # Push schema changes
bun db:reset         # Reset database
```

### Data Ingestion

```bash
bun ingest           # Ingest all data sources
bun ingest:lexicon   # Ingest lexicon data only
bun ingest:testimony # Ingest testimony data only
bun ingest:clear     # Clear all ingested data
```

## 🎯 Target Users

- **Students & Educators** - Seeking accurate Holocaust information
- **Developers** - Building educational applications
- **Researchers** - Accessing survivor testimonies and historical data

## 📊 Monitoring

- **Sentry** - Error tracking and performance monitoring
- **Vercel Analytics** - Usage analytics

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes and add tests
4. Ensure 100% test coverage: `bun test:coverage`
5. Commit your changes: `git commit -m 'Add amazing feature'`
6. Push to the branch: `git push origin feature/amazing-feature`
7. Open a Pull Request

## 📄 License

## This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

**Zekher** - Preserving memory through technology, ensuring Holocaust education remains accessible and accurate in the digital age.
