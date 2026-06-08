import { NextRequest, NextResponse } from 'next/server'

// Both wcscorelive.com and wcscores.com serve the full app.
// No redirects — iOS PWA users on the old domain keep working as-is.
export function middleware(request: NextRequest) {
  return NextResponse.next()
}

export const config = {
  matcher: '/:path*',
}

export const config = {
  matcher: '/:path*',
}
