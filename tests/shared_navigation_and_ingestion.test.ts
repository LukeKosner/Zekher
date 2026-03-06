import { afterEach, beforeEach, describe, expect, it } from "bun:test";

import { cn } from "../lib/shared/cn-utils";
import {
  getEnvValue,
  getMonitoringConfig,
  isProduction,
} from "../lib/shared/utils";
import {
  getLanguageCode,
  getTestimonyLanguage,
  getTestimonyMetadata,
} from "../lib/ingestion/processors/testimony-languages";
import {
  NAVIGATION_SECTIONS,
  ROUTES,
  generateBreadcrumb,
  getAllSections,
  getNavigationItemByPath,
  getNavigationItemsBySection,
} from "../lib/navigation/navigation";
import {
  DEFAULT_URL_CONFIG,
  ENV_CONFIG,
  MONITORING_CONFIG,
  getGCPCredentials,
} from "../lib/shared/config";

describe("shared utils", () => {
  const originalNodeEnv = process.env.NODE_ENV;
  const originalBaseUrl = process.env.NEXT_PUBLIC_BASE_URL;
  const originalGcpPrivateKey = process.env.GCP_PRIVATE_KEY;
  const originalGcpEmail = process.env.GCP_SERVICE_ACCOUNT_EMAIL;
  const originalGcpProjectId = process.env.GCP_PROJECT_ID;

  beforeEach(() => {
    delete process.env.NODE_ENV;
    delete process.env.NEXT_PUBLIC_BASE_URL;
    delete process.env.GCP_PRIVATE_KEY;
    delete process.env.GCP_SERVICE_ACCOUNT_EMAIL;
    delete process.env.GCP_PROJECT_ID;
  });

  afterEach(() => {
    if (originalNodeEnv === undefined) delete process.env.NODE_ENV;
    else process.env.NODE_ENV = originalNodeEnv;

    if (originalBaseUrl === undefined) delete process.env.NEXT_PUBLIC_BASE_URL;
    else process.env.NEXT_PUBLIC_BASE_URL = originalBaseUrl;

    if (originalGcpPrivateKey === undefined) delete process.env.GCP_PRIVATE_KEY;
    else process.env.GCP_PRIVATE_KEY = originalGcpPrivateKey;

    if (originalGcpEmail === undefined)
      delete process.env.GCP_SERVICE_ACCOUNT_EMAIL;
    else process.env.GCP_SERVICE_ACCOUNT_EMAIL = originalGcpEmail;

    if (originalGcpProjectId === undefined) delete process.env.GCP_PROJECT_ID;
    else process.env.GCP_PROJECT_ID = originalGcpProjectId;
  });

  it("returns env-specific values and production booleans", () => {
    expect(getEnvValue("prod", "dev", "production")).toBe("prod");
    expect(getEnvValue("prod", "dev", "development")).toBe("dev");

    expect(isProduction("production")).toBe(true);
    expect(isProduction("test")).toBe(false);
  });

  it("uses default environment when NODE_ENV is missing", () => {
    expect(getEnvValue("prod", "dev")).toBe("dev");
    expect(isProduction()).toBe(false);
  });

  it("builds monitoring config for prod and dev", () => {
    const prod = getMonitoringConfig("production");
    expect(prod.enableMetrics).toBe(true);
    expect(prod.enableErrorTracking).toBe(true);
    expect(prod.enableAlerts).toBe(true);
    expect(prod.logLevel).toBe("warn");
    expect(prod.sensitiveDataPatterns).toBe(MONITORING_CONFIG.SENSITIVE_PATTERNS);

    const dev = getMonitoringConfig("development");
    expect(dev.enableMetrics).toBe(false);
    expect(dev.enableAlerts).toBe(false);
    expect(dev.logLevel).toBe("debug");
  });

  it("exports stable shared config defaults and URL config", () => {
    expect(ENV_CONFIG.DEFAULT_ENV).toBe("development");
    expect(DEFAULT_URL_CONFIG.AUDIO_PATH).toBe("/audio");
    expect(DEFAULT_URL_CONFIG.LEXICON_PATH).toBe("/lexicon/pdf");
  });

  it("returns empty GCP credentials in local mode and structured credentials in env mode", () => {
    expect(getGCPCredentials()).toEqual({});

    process.env.GCP_PRIVATE_KEY = "private-key";
    process.env.GCP_SERVICE_ACCOUNT_EMAIL = "svc@project.iam.gserviceaccount.com";
    process.env.GCP_PROJECT_ID = "project-id";

    expect(getGCPCredentials()).toEqual({
      credentials: {
        client_email: "svc@project.iam.gserviceaccount.com",
        private_key: "private-key",
      },
      projectId: "project-id",
    });
  });
});

describe("testimony language helpers", () => {
  it("looks up testimony language by last name", () => {
    expect(getTestimonyLanguage("David Bondy")).toBe("English");
    expect(getTestimonyLanguage("Chaim Lea")).toBe("German & Spanish");
    expect(getTestimonyLanguage("SingleName")).toBeUndefined();
  });

  it("maps language names to ISO codes with fallback", () => {
    expect(getLanguageCode("German")).toBe("de");
    expect(getLanguageCode("Yiddish")).toBe("yi");
    expect(getLanguageCode("English")).toBe("en");
    expect(getLanguageCode("Spanish")).toBe("es");
    expect(getLanguageCode("Polish")).toBe("pl");
    expect(getLanguageCode("German & Spanish")).toBe("de");
    expect(getLanguageCode("Polish & German")).toBe("de");
    expect(getLanguageCode("Unknown Language")).toBe("en");
  });

  it("returns testimony metadata for known and unknown names", () => {
    expect(getTestimonyMetadata("David Bondy")).toEqual({
      language: "English",
      languageCode: "en",
      lastName: "bondy",
    });

    expect(getTestimonyMetadata("")).toEqual({
      language: undefined,
      languageCode: undefined,
      lastName: "",
    });
  });
});

describe("cn utility", () => {
  it("combines and merges tailwind classes", () => {
    expect(cn("p-2", "p-4", "text-sm", undefined, false && "hidden")).toBe(
      "p-4 text-sm"
    );
  });
});

describe("navigation helpers", () => {
  it("finds navigation entries for direct and redirect paths", () => {
    const chat = getNavigationItemByPath(ROUTES.CHAT);
    expect(chat?.label).toBe("Chat");
    expect(chat?.section).toBe(NAVIGATION_SECTIONS.EVERYONE);

    const developers = getNavigationItemByPath(ROUTES.DEVELOPERS);
    expect(developers?.href).toBe(ROUTES.DEVELOPERS_MCP);
  });

  it("resolves parent navigation entry for sub-pages", () => {
    const subPath = getNavigationItemByPath("/classroom/teacher/details");
    expect(subPath?.href).toBe(ROUTES.CLASSROOM_TEACHER);

    const unknownPath = getNavigationItemByPath("/does/not/exist");
    expect(unknownPath).toBeUndefined();
  });

  it("generates breadcrumb values for known, unknown, and empty paths", () => {
    expect(generateBreadcrumb(ROUTES.SOURCES)).toEqual({
      section: NAVIGATION_SECTIONS.EVERYONE,
      label: "Sources",
    });

    expect(generateBreadcrumb("/new-learning-module")).toEqual({
      section: NAVIGATION_SECTIONS.UNKNOWN,
      label: "New Learning Module",
    });

    expect(generateBreadcrumb("")).toBeNull();
  });

  it("returns section-scoped navigation items and section list", () => {
    const education = getNavigationItemsBySection(NAVIGATION_SECTIONS.EDUCATION);
    expect(education.map((item) => item.href)).toEqual([
      ROUTES.CLASSROOM_STUDENT,
      ROUTES.CLASSROOM_TEACHER,
    ]);

    expect(getAllSections()).toEqual([
      NAVIGATION_SECTIONS.PROJECT,
      NAVIGATION_SECTIONS.EVERYONE,
      NAVIGATION_SECTIONS.EDUCATION,
      NAVIGATION_SECTIONS.DEVELOPERS,
    ]);
  });
});
