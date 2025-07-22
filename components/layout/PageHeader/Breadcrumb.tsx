// components/page-header/BreadcrumbNavigation.tsx

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

interface BreadcrumbNavigationProps {
  slug: string;
}

export function BreadcrumbNavigation({slug}: BreadcrumbNavigationProps) {
  const parts = slug.split('/').filter(part => part);

  if (parts[0] === 'sources') {
    const sourceTitle = parts[0].charAt(0).toUpperCase() + parts[0].slice(1);
    let pageTitle = '';
    if (parts.length > 1) {
      pageTitle = parts[1].charAt(0).toUpperCase() + parts[1].slice(1);
    }

    return (
      <Breadcrumb className="hidden md:block">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/sources">{sourceTitle}</BreadcrumbLink>
          </BreadcrumbItem>
          {pageTitle && <BreadcrumbSeparator />}
          {pageTitle && <BreadcrumbItem>
            <BreadcrumbPage>{pageTitle}</BreadcrumbPage>
          </BreadcrumbItem>}
        </BreadcrumbList>
      </Breadcrumb>
    );
  }

  // Default breadcrumb for other pages
  const pageTitle = parts.length > 1 ? parts[parts.length - 1] : parts[0];
  const pageTitleCapitalized = pageTitle.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  const sectionTitle =
    parts.length > 1 ? parts[parts.length - 2].replace(/-/g, ' ') : '';

  const sectionTitleCapitalized =
    sectionTitle.charAt(0).toUpperCase() + sectionTitle.slice(1);

  return (
    <Breadcrumb className="hidden md:block">
      <BreadcrumbList>
        <BreadcrumbItem>
          {sectionTitleCapitalized}
        </BreadcrumbItem>
        {pageTitle && <BreadcrumbSeparator />}
        {pageTitle && <BreadcrumbItem>
          <BreadcrumbPage>{pageTitleCapitalized}</BreadcrumbPage>
        </BreadcrumbItem>}
      </BreadcrumbList>
    </Breadcrumb>
  );
}