// components/page-header/BreadcrumbNavigation.tsx

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from "@/components/ui/breadcrumb";
import type { BreadcrumbNavigationProps } from "../types";

const breadcrumbNameMap: { [key: string]: string } = {
  "/": "Home",
  "/about": "About",
  "/mcp": "MCP",
  "/sources": "Sources",
  "/chat": "Chat"
};

export function BreadcrumbNavigation({ slug }: BreadcrumbNavigationProps) {
  if (slug === "/not-found") {
    return null;
  }

  const parts = slug.split("/").filter((part) => part);

  if (slug === "/") {
    return (
      <Breadcrumb className="hidden md:block">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbPage>Home</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    );
  }

  if (parts.length === 1) {
    const path = `/${parts[0]}`;
    const name = breadcrumbNameMap[path];
    if (name) {
      return (
        <Breadcrumb className="hidden md:block">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbPage>{name}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      );
    }
  }

  if (parts.length > 1 && parts[0] === "sources") {
    const sourceName = parts[1].charAt(0).toUpperCase() + parts[1].slice(1);
    return (
      <Breadcrumb className="hidden md:block">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/sources">Sources</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{sourceName}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    );
  }

  return null;
}