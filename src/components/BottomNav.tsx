'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const tabs = [
  {
    href: '/schedule',
    label: 'Schedule',
    icon: (active: boolean) => (
      <svg className={`w-6 h-6 ${active ? 'text-[#00d4ff]' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" strokeWidth={2} />
        <line x1="16" y1="2" x2="16" y2="6" strokeWidth={2} />
        <line x1="8" y1="2" x2="8" y2="6" strokeWidth={2} />
        <line x1="3" y1="10" x2="21" y2="10" strokeWidth={2} />
      </svg>
    ),
  },
  {
    href: '/calendar',
    label: 'Calendar',
    icon: (active: boolean) => (
      <svg className={`w-6 h-6 ${active ? 'text-[#00d4ff]' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <rect x="3" y="3" width="7" height="7" strokeWidth={2} />
        <rect x="14" y="3" width="7" height="7" strokeWidth={2} />
        <rect x="14" y="14" width="7" height="7" strokeWidth={2} />
        <rect x="3" y="14" width="7" height="7" strokeWidth={2} />
      </svg>
    ),
  },
  {
    href: '/groups',
    label: 'Groups',
    icon: (active: boolean) => (
      <svg className={`w-6 h-6 ${active ? 'text-[#00d4ff]' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <line x1="8" y1="6" x2="21" y2="6" strokeWidth={2} />
        <line x1="8" y1="12" x2="21" y2="12" strokeWidth={2} />
        <line x1="8" y1="18" x2="21" y2="18" strokeWidth={2} />
        <line x1="3" y1="6" x2="3.01" y2="6" strokeWidth={2} />
        <line x1="3" y1="12" x2="3.01" y2="12" strokeWidth={2} />
        <line x1="3" y1="18" x2="3.01" y2="18" strokeWidth={2} />
      </svg>
    ),
  },
  {
    href: '/assistant',
    label: 'Assistant',
    icon: (active: boolean) => (
      <svg className={`w-6 h-6 ${active ? 'text-[#00d4ff]' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" strokeWidth={2} />
      </svg>
    ),
  },
]

export default function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-[#13131a] border-t border-gray-800 z-50" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
      <div className="flex">
        {tabs.map(tab => {
          const active = pathname.startsWith(tab.href)
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className="flex-1 flex flex-col items-center py-3 gap-1"
            >
              {tab.icon(active)}
              <span className={`text-xs ${active ? 'text-[#00d4ff]' : 'text-gray-400'}`}>
                {tab.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
