import Image from 'next/image'

interface PageHeaderProps {
  subtitle?: string
}

export default function PageHeader({ subtitle }: PageHeaderProps) {
  return (
    <div
      className="bg-cyan-400 flex flex-col items-center justify-center flex-shrink-0 pb-3"
      style={{ paddingTop: 'calc(env(safe-area-inset-top) + 10px)' }}
    >
      <Image
        src="/wc26-lockup-cyan-trophy.png"
        alt="WC26"
        width={72}
        height={72}
        className="object-contain drop-shadow-md"
        priority
      />
      {subtitle && (
        <p className="text-[11px] font-bold text-cyan-950 tracking-widest uppercase mt-1">{subtitle}</p>
      )}
    </div>
  )
}
