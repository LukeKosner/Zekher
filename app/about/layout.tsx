import type { Metadata } from "next";
import { ABOUT_METADATA } from './constants';
import type { AboutLayoutProps } from './types';

export const metadata: Metadata = ABOUT_METADATA;

export default function AboutLayout({ children }: AboutLayoutProps) {
  return children;
}