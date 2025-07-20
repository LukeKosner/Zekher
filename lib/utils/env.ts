import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

// Only load dotenv on server side
if (typeof window === "undefined") {
  const { config } = require("dotenv");
  const { resolve } = require("path");
  config({ path: resolve(process.cwd(), ".env.local") });
}

export const env = createEnv({
  server: {
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),
    DATABASE_URL: z.string().min(1),
    REDIS_URL: z.string().min(1),
  },
  client: {
    NEXT_PUBLIC_BASE_URL: z.string().url().default("http://localhost:3000")
  },
  experimental__runtimeEnv: {
    NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL
  }
});
