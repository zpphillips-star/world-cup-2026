import BottomNav from '@/components/BottomNav'

export default function TabsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
      <main className="flex-1" style={{ paddingBottom: 'calc(5rem + env(safe-area-inset-bottom))' }}>{children}</main>
      <BottomNav />
    </div>
  )
}
