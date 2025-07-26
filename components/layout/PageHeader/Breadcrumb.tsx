// components/page-header/BreadcrumbNavigation.tsx

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { getNavigationItemByPath } from '@/lib/navigation';

interface BreadcrumbNavigationProps {
  slug: string;
}

export function BreadcrumbNavigation({slug}: BreadcrumbNavigationProps) {
  if (!slug) {
    return null;
  }

  const parts = slug.split('/').filter(part => part);
  let navigationItem = getNavigationItemByPath(slug);
  
  
  // Special case: if we're on /developers, show the MCP breadcrumb since it redirects there
  if (slug === '/developers') {
    navigationItem = getNavigationItemByPath('/developers/mcp');
  }

  // For root path
  if (slug === '/') {
    return (
      <Breadcrumb className="hidden md:block">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbPage>Project</BreadcrumbPage>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Home</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    );
  }

  // For known navigation items - skip this for dynamic routes
  const isDynamicDetailPage = parts.length >= 3 && parts[0] === 'sources' && (parts[1] === 'lexicon' || parts[1] === 'testimony');
  
  if (navigationItem && !isDynamicDetailPage) {
    return (
      <Breadcrumb className="hidden md:block">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbPage>{navigationItem.section}</BreadcrumbPage>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{navigationItem.breadcrumbLabel || navigationItem.label}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    );
  }

  // For sub-pages (like /sources/lexicon/123 or /developers/mcp)
  if (parts.length > 1) {
    // Try to find exact match for the full path first
    const fullPath = `/${parts.join('/')}`;
    const exactNavigationItem = getNavigationItemByPath(fullPath);
    
    // Skip exact match for dynamic routes like lexicon and testimony detail pages
    const isDynamicRoute = (parts.length >= 3 && parts[0] === 'sources' && (parts[1] === 'lexicon' || parts[1] === 'testimony'));
    
    
    if (exactNavigationItem && !isDynamicRoute) {
      return (
        <Breadcrumb className="hidden md:block">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbPage>{exactNavigationItem.section}</BreadcrumbPage>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{exactNavigationItem.breadcrumbLabel || exactNavigationItem.label}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      );
    }
    
    // Fallback to base path logic for deeper nested routes
    const basePath = `/${parts[0]}`;
    const baseNavigationItem = getNavigationItemByPath(basePath);
    
    if (baseNavigationItem) {
      // Special handling for lexicon and testimony pages
      let pageTitle = parts[parts.length - 1]
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

      // Check if this is a lexicon or testimony detail page
      const isSourcesRoute = parts.length >= 3 && parts[0] === 'sources';
      const isLexicon = parts[1] === 'lexicon';
      const isTestimony = parts[1] === 'testimony';
      
      if (isSourcesRoute) {
        if (isLexicon) {
          pageTitle = 'Lexicon Entry';
        } else if (isTestimony) {
          pageTitle = 'Survivor Testimony';
        }
      }

      return (
        <Breadcrumb className="hidden md:block">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbPage>{baseNavigationItem.section}</BreadcrumbPage>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href={basePath}>{baseNavigationItem.label}</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{pageTitle}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      );
    }
  }

  // Fallback for unknown paths
  const pageTitle = parts[0]
    ?.split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ') || '';

  return (
    <Breadcrumb className="hidden md:block">
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbPage>{pageTitle}</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
}