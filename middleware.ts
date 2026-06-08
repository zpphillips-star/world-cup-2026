import { NextRequest, NextResponse } from 'next/server'

const OLD_DOMAINS = ['wcscorelive.com', 'www.wcscorelive.com']

export function middleware(request: NextRequest) {
  const host = request.headers.get('host') || ''

  if (OLD_DOMAINS.some((d) => host.includes(d))) {
    const targetUrl =
      'https://www.wcscores.com' +
      request.nextUrl.pathname +
      request.nextUrl.search

    // JS + meta refresh — works in iOS PWA standalone mode where
    // server-side 308 cross-origin redirects silently fail
    return new NextResponse(
      `<!DOCTYPE html><html><head>
<meta http-equiv="refresh" content="0;url=${targetUrl}">
<script>window.location.replace('${targetUrl}')</script>
</head><body>Redirecting to wcscores.com…</body></html>`,
      { status: 200, headers: { 'Content-Type': 'text/html' } }
    )
  }

  return NextResponse.next()
}

export const config = {
  matcher: '/:path*',
}
