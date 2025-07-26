import type { Metadata } from "next";
import { DEVELOPERS_METADATA } from './constants';
import type { DevelopersLayoutProps } from './types';

export const metadata: Metadata = DEVELOPERS_METADATA;

export default function DevelopersLayout({ children }: DevelopersLayoutProps) {
  return children;
}