import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";
import * as dotenv from "dotenv";
import * as path from "path";

// Only load dotenv on server side - do it synchronously
if (typeof window === "undefined") {
  try {
    dotenv.config({
      path: path.resolve(process.cwd(), ".env.local"),
      quiet: true
    });
  } catch (error) {
    // Fallback for environments where require might not work
    console.warn("Could not load .env.local file:", error);
  }
}

export const env = createEnv({
  server: {
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),
    DATABASE_URL: z.string().min(1),
    DATABASE_URL_READONLY: z.string().min(1).optional(),
    REDIS_URL: z.string().min(1)
  },
  client: {
    NEXT_PUBLIC_BASE_URL: z.string().url().default("https://zekher.com"),
    NEXT_PUBLIC_CONVEX_URL: z.string().url().optional()
  },
  experimental__runtimeEnv: {
    NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
    NEXT_PUBLIC_CONVEX_URL: process.env.NEXT_PUBLIC_CONVEX_URL
  }
});
