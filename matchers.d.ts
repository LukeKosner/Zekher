import { TestingLibraryMatchers } from "@testing-library/jest-dom/matchers";
import { Matchers, AsymmetricMatchers } from "bun:test";

declare module "bun:test" {
  interface Matchers<T>
    extends TestingLibraryMatchers<typeof expect.stringContaining, T> {
    // Extend with testing library matchers
  }
  interface AsymmetricMatchers extends TestingLibraryMatchers {
    // Extend with testing library asymmetric matchers  
  }
}
