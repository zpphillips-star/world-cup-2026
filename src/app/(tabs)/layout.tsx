import BottomNav from '@/components/BottomNav'

export default function TabsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col overflow-hidden" style={{ height: '100dvh', paddingTop: 'env(safe-area-inset-top)' }}>
      {/* Top ad banner — always visible, never scrolls away */}
      <a
        href="https://www.amazon.com/s?k=2026+FIFA+World+Cup+soccer+jersey"
        target="_blank"
        rel="noopener noreferrer"
        className="flex-shrink-0 flex items-center justify-center gap-2 px-4 py-2.5 bg-[#0d0d16] border-b border-white/8 active:opacity-75 transition-opacity"
      >
        <span className="text-base">⚽</span>
        <span className="text-[12px] font-medium text-zinc-200">Buy 2026 World Cup gear on Amazon</span>
        <span className="text-[9px] text-zinc-600 uppercase tracking-widest ml-2">Ad</span>
      </a>
      <main className="flex-1 overflow-hidden" style={{ paddingBottom: 'calc(5.5rem + env(safe-area-inset-bottom))' }}>{children}</main>
      <BottomNav />
    </div>
  )
}
