// components/page-header/BreadcrumbNavigation.tsx
// Server Component for static breadcrumb structure

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
  const parts = slug.split('/');
  const pageTitle = parts[parts.length - 1].replace(/-/g, ' ');
  const pageTitleCapitalized =
    pageTitle.charAt(0).toUpperCase() + pageTitle.slice(1);
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
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbLink href="#">
            <BreadcrumbPage>{pageTitleCapitalized}</BreadcrumbPage>
          </BreadcrumbLink>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
}