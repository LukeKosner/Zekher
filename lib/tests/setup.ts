
/// <reference lib="dom" />
/// <reference types="bun-types" />

import { GlobalRegistrator } from "@happy-dom/global-registrator";
import { mock } from "bun:test";
import "@testing-library/jest-dom";

// Setup DOM environment with happy-dom
GlobalRegistrator.register();

// Mock environment utilities
mock.module("@/lib/utils/env", () => ({
  env: {
    NODE_ENV: "test",
    DATABASE_URL: "test://localhost",
    REDIS_URL: "test://localhost",
    NEXT_PUBLIC_BASE_URL: "http://localhost:3000"
  }
}));
