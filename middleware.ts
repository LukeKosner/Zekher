import { NextRequest, NextResponse } from 'next/server';
import { edgeLogger } from '@/lib/utils/edge-logger';

export function middleware(request: NextRequest) {
  const startTime = Date.now();
  const requestId = crypto.randomUUID();
  
  // Add request ID to headers for tracing
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-request-id', requestId);
  
  // Log incoming request
  edgeLogger.info(`Incoming request: ${request.method} ${request.nextUrl.pathname}`, {
    requestId,
    method: request.method,
    path: request.nextUrl.pathname,
    userAgent: request.headers.get('user-agent') || 'unknown',
    component: 'middleware',
  });
  
  // Continue with the request
  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
  
  // Add request ID to response headers
  response.headers.set('x-request-id', requestId);
  
  // Log response (this will be called after the request is processed)
  const duration = Date.now() - startTime;
  edgeLogger.apiRequest(
    request.method,
    request.nextUrl.pathname,
    response.status,
    duration,
    {
      requestId,
      component: 'middleware',
    }
  );
  
  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
};