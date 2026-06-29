import BottomNav from '@/components/BottomNav'

export default function TabsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col overflow-hidden" style={{ height: '100dvh', paddingTop: 'env(safe-area-inset-top)' }}>
      <main className="flex-1 overflow-hidden" style={{ paddingBottom: 'calc(5.5rem + env(safe-area-inset-bottom))' }}>{children}</main>
      <BottomNav />
    </div>
  )
}

