/**
 * Main lib module exports
 * Provides organized access to all lib functionality by domain
 * Note: Server-side only modules (ingestion) are not exported here to prevent client-side import issues
 */

// Domain-specific modules (client-safe)
export * from "./shared";

// All other modules must be imported directly to prevent client-side bundle issues
// Import these directly: import { ... } from "@/lib/navigation", "@/lib/database", "@/lib/monitoring", or "@/lib/search"

// Server-side only modules (ingestion) are not exported to prevent client-side bundle issues
// Import ingestion modules directly: import { ... } from "@/lib/ingestion"

// All utilities now organized into domain folders

// Test setup is not exported to prevent client-side bundle issues
// Import test setup directly in test files: import "@/lib/test-setup"
