import { isIP } from "node:net";

function getAllowedHostPatterns(): string[] {
  return (process.env.PROXY_ALLOWED_HOSTS ?? "")
    .split(",")
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);
}

function isHostAllowedByPattern(hostname: string, pattern: string): boolean {
  if (pattern.startsWith("*.")) {
    const suffix = pattern.slice(2);
    return hostname === suffix || hostname.endsWith(`.${suffix}`);
  }

  return hostname === pattern;
}

function isHostAllowed(hostname: string): boolean {
  const patterns = getAllowedHostPatterns();
  if (patterns.length === 0) return true;
  return patterns.some((pattern) => isHostAllowedByPattern(hostname, pattern));
}

function isPrivateIpv4(hostname: string): boolean {
  const parts = hostname.split(".").map((part) => Number.parseInt(part, 10));
  const [a, b] = parts;
  if (a === 10 || a === 127) return true;
  if (a === 169 && b === 254) return true;
  if (a === 172 && b >= 16 && b <= 31) return true;
  if (a === 192 && b === 168) return true;
  return false;
}

function isBlockedHostname(hostname: string): boolean {
  const lower = hostname.toLowerCase();
  const normalizedIpHost =
    lower.startsWith("[") && lower.endsWith("]") ? lower.slice(1, -1) : lower;
  if (
    lower === "localhost" ||
    lower.endsWith(".local") ||
    lower.endsWith(".internal")
  ) {
    return true;
  }

  const ipVersion = isIP(normalizedIpHost);
  if (ipVersion === 4) {
    return isPrivateIpv4(normalizedIpHost);
  }

  if (ipVersion === 6) {
    return (
      normalizedIpHost === "::1" ||
      normalizedIpHost.startsWith("fc") ||
      normalizedIpHost.startsWith("fd") ||
      normalizedIpHost.startsWith("fe80:")
    );
  }

  return false;
}

export function parseHttpsTargetUrl(
  rawTarget: string | null | undefined
): URL | null {
  if (!rawTarget) return null;

  try {
    const target = new URL(rawTarget);
    if (target.protocol !== "https:") return null;
    if (isBlockedHostname(target.hostname)) return null;
    if (!isHostAllowed(target.hostname.toLowerCase())) return null;
    return target;
  } catch {
    return null;
  }
}

export function parseHttpsTargetUrlFromRequest(
  request: Request,
  queryParam = "url"
): URL | null {
  const requestUrl = new URL(request.url);
  return parseHttpsTargetUrl(requestUrl.searchParams.get(queryParam));
}
