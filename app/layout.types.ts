/**
 * App-level layout types
 */

// Layout configuration interfaces
export interface LayoutFontConfig {
  variable: string;
  subsets: readonly string[];
}

export interface LayoutIcon {
  url: string;
  sizes: string;
  type: string;
}

export interface LayoutOpenGraphImage {
  url: string;
  width: number;
  height: number;
  alt: string;
}

export interface LayoutIcons {
  favicon32: LayoutIcon;
  favicon16: LayoutIcon;
  appleTouchIcon: LayoutIcon;
  openGraphImage: LayoutOpenGraphImage;
}

export interface LayoutDnsPreFetch {
  googleFonts: string;
  googleFontsStatic: string;
}

export interface LayoutConstants {
  siteName: string;
  description: string;
  siteUrl: string;
  themeColor: string;
  fontConfig: LayoutFontConfig;
  icons: LayoutIcons;
  manifest: string;
  dnsPreFetch: LayoutDnsPreFetch;
}

export interface LayoutProps {
  children: React.ReactNode;
}