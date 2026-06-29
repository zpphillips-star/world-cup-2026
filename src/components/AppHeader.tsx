'use client'
import { ReactNode } from 'react'

export function AppHeader({ title, subtitle, children }: { title: string; subtitle?: string; children?: ReactNode }) {
  return (
    <div className="sticky top-0 z-10 bg-[#0a0a0f]/95 backdrop-blur-md border-b border-zinc-800 px-5 pt-5 pb-3">
      <h1 className="text-[22px] font-bold text-white tracking-tight">{title}</h1>
      {subtitle && <p className="text-[12px] text-zinc-500 mt-0.5">{subtitle}</p>}
      {children}
    </div>
  )
}