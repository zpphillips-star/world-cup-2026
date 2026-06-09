import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import InstallPrompt from '@/components/InstallPrompt'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  title: 'World Cup 2026',
  description: '2026 FIFA World Cup Companion App',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'World Cup',
    startupImage: '/icons/splash.png',
  },
  icons: {
    icon: [
      { url: '/icons/icon-32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icons/icon-16.png', sizes: '16x16', type: 'image/png' },
      { url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
    ],
    apple: [
      { url: '/icons/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    shortcut: '/icons/icon-32.png',
  },
}

export const viewport: Viewport = {
  themeColor: '#0a0a0f',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  viewportFit: 'cover',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="bg-[#0a0a0f] text-white min-h-screen">
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.__installPromptEvent = null;
              window.addEventListener('beforeinstallprompt', function(e) { e.preventDefault(); window.__installPromptEvent = e; });
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').catch(function(e) { console.log('SW error:', e); });
                  // Force any waiting SW to activate immediately
                  navigator.serviceWorker.getRegistration('/sw.js').then(function(reg) {
                    if (reg && reg.waiting) {
                      reg.waiting.postMessage({type:'SKIP_WAITING'});
                    }
                    if (reg) reg.update();
                  });
                });
                // When a new SW takes over, reload once so the page uses fresh assets
                navigator.serviceWorker.addEventListener('controllerchange', function() {
                  if (!sessionStorage.getItem('sw_reloaded')) {
                    sessionStorage.setItem('sw_reloaded', '1');
                    window.location.reload();
                  }
                });
              }
            `,
          }}
        />
        {children}
        <InstallPrompt />
      </body>
    </html>
  )
}