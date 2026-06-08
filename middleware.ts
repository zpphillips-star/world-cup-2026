import { NextRequest, NextResponse } from 'next/server'

const OLD_DOMAINS = ['wcscorelive.com', 'www.wcscorelive.com']

const REINSTALL_PAGE = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>App Moved</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: #0f172a;
      color: #f1f5f9;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
    }
    .card {
      background: #1e293b;
      border-radius: 20px;
      padding: 36px 28px;
      max-width: 380px;
      width: 100%;
      text-align: center;
      box-shadow: 0 25px 50px rgba(0,0,0,0.5);
    }
    .icon { font-size: 56px; margin-bottom: 20px; }
    h1 { font-size: 22px; font-weight: 700; margin-bottom: 12px; color: #38bdf8; }
    p { font-size: 15px; line-height: 1.6; color: #94a3b8; margin-bottom: 28px; }
    .btn {
      display: block;
      background: #0ea5e9;
      color: white;
      text-decoration: none;
      padding: 16px 24px;
      border-radius: 14px;
      font-size: 17px;
      font-weight: 600;
      margin-bottom: 16px;
      border: none;
      cursor: pointer;
      width: 100%;
    }
    .btn:active { opacity: 0.85; }
    .steps {
      text-align: left;
      background: #0f172a;
      border-radius: 12px;
      padding: 16px 20px;
      margin-top: 24px;
    }
    .steps h2 { font-size: 13px; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 12px; }
    .step { display: flex; gap: 12px; margin-bottom: 10px; font-size: 14px; color: #cbd5e1; align-items: flex-start; }
    .step-num { background: #1e293b; border-radius: 50%; width: 22px; height: 22px; min-width: 22px; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; color: #38bdf8; }
  </style>
</head>
<body>
  <div class="card">
    <div class="icon">⚽</div>
    <h1>App Has Moved</h1>
    <p>WC Scores is now at <strong style="color:#f1f5f9">wcscores.com</strong>. Tap below to open it, then reinstall for the best experience.</p>
    <a class="btn" href="https://www.wcscores.com">Open wcscores.com →</a>
    <div class="steps">
      <h2>Reinstall in 3 steps</h2>
      <div class="step"><span class="step-num">1</span><span>Tap the button above — it opens in Safari</span></div>
      <div class="step"><span class="step-num">2</span><span>Tap <strong>Share</strong> → <strong>Add to Home Screen</strong></span></div>
      <div class="step"><span class="step-num">3</span><span>Delete this old icon from your home screen</span></div>
    </div>
  </div>
  <script>
    // In regular browser (not PWA standalone), just redirect directly
    if (window.navigator.standalone === false || window.matchMedia('(display-mode: browser)').matches) {
      window.location.replace('https://www.wcscores.com' + window.location.pathname + window.location.search);
    }
  </script>
</body>
</html>`

export function middleware(request: NextRequest) {
  const host = request.headers.get('host') || ''

  if (OLD_DOMAINS.some((d) => host.includes(d))) {
    // In regular browser mode: server-side redirect is fine
    // In iOS PWA standalone mode: cross-origin redirects open Safari and leave the PWA blank.
    // We detect PWA mode client-side in the HTML and show a reinstall guide instead.
    return new NextResponse(REINSTALL_PAGE, {
      status: 200,
      headers: {
        'Content-Type': 'text/html',
        'Cache-Control': 'no-store',
      },
    })
  }

  return NextResponse.next()
}

export const config = {
  matcher: '/:path*',
}
