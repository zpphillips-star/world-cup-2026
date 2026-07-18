'use client'
import { useState, useEffect } from 'react'
import { track } from '@vercel/analytics'

const BANNER_KEY = 'wc_promo_banner_dismissed'

export default function PromoBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!localStorage.getItem(BANNER_KEY)) {
      setVisible(true)
    }
  }, [])

  if (!visible) return null

  function handleDismiss(e: React.MouseEvent) {
    e.stopPropagation()
    localStorage.setItem(BANNER_KEY, '1')
    setVisible(false)
  }

  function handleClick() {
    track('promo_banner_click', { destination: 'scorpanion.com' })
    window.open('https://www.scorpanion.com', '_blank', 'noopener,noreferrer')
  }

  return (
    <div
      onClick={handleClick}
      className="relative w-full cursor-pointer bg-gradient-to-r from-amber-500 to-yellow-400 text-black"
      role="banner"
    >
      <div className="max-w-2xl mx-auto px-4 py-2.5 pr-10 flex items-center justify-center gap-2">
        <span className="text-[13px] font-semibold leading-snug text-center">
          You made WCScores a hit — thank you!{' '}
          <span className="underline underline-offset-2">
            Now follow every team you love at Scorpanion.com
          </span>{' '}
          →
        </span>
      </div>
      <button
        onClick={handleDismiss}
        aria-label="Dismiss banner"
        className="absolute right-3 top-1/2 -translate-y-1/2 text-black/60 hover:text-black text-lg leading-none font-bold transition-colors"
      >
        ✕
      </button>
    </div>
  )
}
