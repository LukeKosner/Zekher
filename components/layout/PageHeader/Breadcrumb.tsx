// components/page-header/BreadcrumbNavigation.tsx

import Link from "next/link";
import { Fragment } from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from "@/components/ui/breadcrumb";
import type { BreadcrumbNavigationProps } from "../types";

type Crumb = {
  label: string;
  href?: string;
};

const breadcrumbNameMap: Record<string, string> = {
  "/": "Home",
  "/about": "About",
  "/auth": "Sign In",
  "/mcp": "MCP",
  "/sources": "Sources",
  "/chat": "Chat",
  "/classroom": "Classroom",
};

export function BreadcrumbNavigation({ slug }: BreadcrumbNavigationProps) {
  const normalizedSlug = slug.startsWith("/") ? slug : `/${slug}`;

  if (normalizedSlug === "/not-found") {
    return null;
  }

  const breadcrumbs = buildBreadcrumbs(normalizedSlug);
  if (breadcrumbs.length === 0) return null;

  return (
    <Breadcrumb className="hidden md:block">
      <BreadcrumbList>
        {breadcrumbs.map((crumb, index) => {
          const isLast = index === breadcrumbs.length - 1;

          return (
            <Fragment key={`${crumb.label}-${index}`}>
              {index > 0 && <BreadcrumbSeparator />}
              <BreadcrumbItem>
                {isLast ? (
                  <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link href={crumb.href ?? "/"}>{crumb.label}</Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}

function buildBreadcrumbs(path: string): Crumb[] {
  if (path === "/") {
    return [{ label: "Home" }];
  }

  const staticName = breadcrumbNameMap[path];
  if (staticName) {
    return [{ label: staticName }];
  }

  if (path.startsWith("/classroom")) {
    return buildClassroomBreadcrumbs(path);
  }

  if (path === "/chat/history") {
    return [
      { label: "Chat", href: "/chat" },
      { label: "History" },
    ];
  }

  if (path.startsWith("/chat/shared/")) {
    return [
      { label: "Chat", href: "/chat" },
      { label: "Shared With You" },
    ];
  }

  const parts = path.split("/").filter(Boolean);
  if (parts.length > 1 && parts[0] === "sources") {
    return [
      { label: "Sources", href: "/sources" },
      { label: formatSegment(parts[1]) },
    ];
  }

  return [];
}

function buildClassroomBreadcrumbs(path: string): Crumb[] {
  const liveClassMatch = path.match(/^\/classroom\/teacher\/class\/([^/]+)$/);
  if (liveClassMatch) {
    return [
      { label: "Classroom", href: "/classroom/join" },
      { label: "Teacher", href: "/classroom/teacher" },
      { label: "Live Class" },
    ];
  }

  const historyMatch = path.match(
    /^\/classroom\/teacher\/class\/([^/]+)\/history$/
  );
  if (historyMatch) {
    return [
      { label: "Classroom", href: "/classroom/join" },
      { label: "Teacher", href: "/classroom/teacher" },
      { label: "History" },
    ];
  }

  const matchers: Array<{ test: RegExp; crumbs: Crumb[] }> = [
    {
      test: /^\/classroom$/,
      crumbs: [{ label: "Classroom" }],
    },
    {
      test: /^\/classroom\/join$/,
      crumbs: [
        { label: "Classroom", href: "/classroom/join" },
        { label: "Student" },
      ],
    },
    {
      test: /^\/classroom\/session\/[^/]+$/,
      crumbs: [
        { label: "Classroom", href: "/classroom/join" },
        { label: "Student", href: "/classroom/join" },
        { label: "Session" },
      ],
    },
    {
      test: /^\/classroom\/teacher$/,
      crumbs: [
        { label: "Classroom", href: "/classroom/join" },
        { label: "Teacher" },
      ],
    },
    {
      test: /^\/classroom\/teacher\/auth$/,
      crumbs: [
        { label: "Classroom", href: "/classroom/join" },
        { label: "Teacher", href: "/classroom/teacher" },
        { label: "Sign In" },
      ],
    },
  ];

  const matched = matchers.find((matcher) => matcher.test.test(path));
  if (matched) return matched.crumbs;

  return [{ label: "Classroom" }];
}

function formatSegment(segment: string): string {
  return segment
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
