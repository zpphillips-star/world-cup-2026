'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

interface BackdropProps {
  /** Called after the fade-out animation completes */
  onDismiss?: () => void
  /** Tailwind z-index class, e.g. "z-40" or "z-[55]" */
  zIndex: string
  /** Tailwind background class, e.g. "bg-black/60" */
  bg?: string
  /** Whether to apply backdrop-blur-sm */
  blur?: boolean
}

/**
 * Full-screen dim overlay that fades in on mount and fades out before
 * calling onDismiss. Drop this in place of the plain backdrop <div>
 * in every sheet / modal.
 *
 * z-index layering:  base content  <  overlay  <  sheet
 * pointer-events are on (tapping the backdrop dismisses the sheet).
 */
export function Backdrop({
  onDismiss,
  zIndex,
  bg = 'bg-black/60',
  blur = true,
}: BackdropProps) {
  // Start at opacity-0, transition to 1 after first paint
  const [opacity, setOpacity] = useState(0)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const dismissedRef = useRef(false)

  // Fade in on mount
  useEffect(() => {
    const raf = requestAnimationFrame(() => setOpacity(1))
    return () => {
      cancelAnimationFrame(raf)
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

  const handleClick = useCallback(() => {
    if (dismissedRef.current) return
    dismissedRef.current = true
    // Fade out over 260ms, then call the actual dismiss handler
    setOpacity(0)
    timerRef.current = setTimeout(() => onDismiss?.(), 260)
  }, [onDismiss])

  return (
    <div
      className={`fixed inset-0 ${bg} ${zIndex} ${blur ? 'backdrop-blur-sm' : ''} transition-opacity duration-[260ms]`}
      style={{ opacity }}
      onClick={handleClick}
    />
  )
}
