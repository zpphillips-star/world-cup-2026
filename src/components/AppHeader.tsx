import Image from 'next/image'

export default function AppHeader() {
  return (
    <div className="flex items-center justify-between px-5 pt-3 pb-2 flex-shrink-0">
      <Image
        src="/wc26-lockup-cyan.png"
        alt="WC26"
        width={90}
        height={36}
        className="object-contain"
        priority
      />
      <span className="text-2xl">🏆</span>
    </div>
  )
}
