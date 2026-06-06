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
    apple: [
      { url: '/apple-touch-icon-v3.png', sizes: '180x180' },
    ],
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
              if ('serviceWorker' in navigator) { window.addEventListener('load', function() { navigator.serviceWorker.register('/sw.js').catch(function(e) { console.log('SW error:', e); }); }); }
            `,
          }}
        />
        {children}
        <InstallPrompt />
      </body>
    </html>
  )
}