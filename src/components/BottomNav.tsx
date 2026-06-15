'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Image from 'next/image'

const leftTabs = [
  {
    href: '/schedule',
    label: 'Schedule',
    icon: (active: boolean) => (
      <svg className={`w-6 h-6 ${active ? 'text-[#00d4ff]' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <line x1="3" y1="6" x2="21" y2="6" strokeWidth={2} strokeLinecap="round" />
        <line x1="3" y1="12" x2="21" y2="12" strokeWidth={2} strokeLinecap="round" />
        <line x1="3" y1="18" x2="21" y2="18" strokeWidth={2} strokeLinecap="round" />
      </svg>
    ),
  },
  {
    href: '/calendar',
    label: 'Calendar',
    icon: (active: boolean) => (
      <svg className={`w-6 h-6 ${active ? 'text-[#00d4ff]' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" strokeWidth={2} />
        <line x1="16" y1="2" x2="16" y2="6" strokeWidth={2} strokeLinecap="round" />
        <line x1="8" y1="2" x2="8" y2="6" strokeWidth={2} strokeLinecap="round" />
        <line x1="3" y1="10" x2="21" y2="10" strokeWidth={2} />
      </svg>
    ),
  },
]

const rightTabs = [
  {
    href: '/groups',
    label: 'Groups',
    icon: (active: boolean) => (
      <svg className={`w-6 h-6 ${active ? 'text-[#00d4ff]' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <rect x="3" y="3" width="7" height="7" rx="1" strokeWidth={2} />
        <rect x="14" y="3" width="7" height="7" rx="1" strokeWidth={2} />
        <rect x="14" y="14" width="7" height="7" rx="1" strokeWidth={2} />
        <rect x="3" y="14" width="7" height="7" rx="1" strokeWidth={2} />
      </svg>
    ),
  },
  {
    href: '/bracket',
    label: 'Bracket',
    icon: (active: boolean) => (
      <svg className={`w-6 h-6 ${active ? 'text-[#00d4ff]' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
        <line x1="2" y1="5" x2="6" y2="5" strokeWidth={2} />
        <line x1="2" y1="19" x2="6" y2="19" strokeWidth={2} />
        <line x1="6" y1="5" x2="6" y2="9" strokeWidth={2} />
        <line x1="6" y1="15" x2="6" y2="19" strokeWidth={2} />
        <line x1="6" y1="9" x2="10" y2="12" strokeWidth={2} />
        <line x1="6" y1="15" x2="10" y2="12" strokeWidth={2} />
        <line x1="22" y1="5" x2="18" y2="5" strokeWidth={2} />
        <line x1="22" y1="19" x2="18" y2="19" strokeWidth={2} />
        <line x1="18" y1="5" x2="18" y2="9" strokeWidth={2} />
        <line x1="18" y1="15" x2="18" y2="19" strokeWidth={2} />
        <line x1="18" y1="9" x2="14" y2="12" strokeWidth={2} />
        <line x1="18" y1="15" x2="14" y2="12" strokeWidth={2} />
        <circle cx="12" cy="12" r="1.5" fill="currentColor" strokeWidth={0} />
      </svg>
    ),
  },
]

export default function BottomNav() {
  const pathname = usePathname()
  const todayActive = pathname.startsWith('/today')

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 bg-[#13131a]/95 backdrop-blur-md border-t border-gray-800 z-50"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="flex items-end h-16">
        {/* Left tabs */}
        {leftTabs.map(tab => {
          const active = pathname.startsWith(tab.href)
          return (
            <Link key={tab.href} href={tab.href} className="flex-1 flex flex-col items-center justify-center py-3 gap-1 h-full">
              {tab.icon(active)}
              <span className={`text-xs ${active ? 'text-[#00d4ff]' : 'text-gray-400'}`}>{tab.label}</span>
            </Link>
          )
        })}

        {/* Center Today button — raised, prominent */}
        <div className="flex-1 flex flex-col items-center justify-end pb-2 relative">
          <Link href="/today" className="flex flex-col items-center gap-1 -mt-5">
            {/* Raised icon button */}
            <div
              className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-transform active:scale-95 ${
                todayActive ? 'ring-2 ring-[#00d4ff] ring-offset-2 ring-offset-[#13131a]' : ''
              }`}
              style={{
                boxShadow: todayActive
                  ? '0 0 20px rgba(0,212,255,0.35), 0 4px 16px rgba(0,0,0,0.5)'
                  : '0 4px 16px rgba(0,0,0,0.5)',
              }}
            >
              <Image
                src="/icons/apple-touch-icon-v2.png"
                width={44}
                height={44}
                alt="Today"
                className="rounded-2xl"
              />
            </div>
            <span className={`text-xs font-semibold ${todayActive ? 'text-[#00d4ff]' : 'text-gray-400'}`}>
              Today
            </span>
          </Link>
        </div>

        {/* Right tabs */}
        {rightTabs.map(tab => {
          const active = pathname.startsWith(tab.href)
          return (
            <Link key={tab.href} href={tab.href} className="flex-1 flex flex-col items-center justify-center py-3 gap-1 h-full">
              {tab.icon(active)}
              <span className={`text-xs ${active ? 'text-[#00d4ff]' : 'text-gray-400'}`}>{tab.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
