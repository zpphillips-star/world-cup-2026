'use client'

import { useState } from 'react'
import type { BracketRound, BracketSlot } from '@/lib/types'

const ROUND_ORDER = ['Round of 32', 'Round of 16', 'Quarter-Finals', 'Semi-Finals', 'Final']
const ROUND_SHORT: Record<string, string> = {
  'Round of 32': 'R32',
  'Round of 16': 'R16',
  'Quarter-Finals': 'QF',
  'Semi-Finals': 'SF',
  'Final': 'Final',
}

const CARD_H = 60   // height of match card px
const CARD_W = 164  // width of match card px
const CONN_W = 28   // width of connector column

function isTeam(x: unknown): x is { id: string; name: string; flag: string } {
  return typeof x === 'object' && x !== null
}

function MatchCard({ slot, isFinal = false, matchLabel }: { slot: BracketSlot; isFinal?: boolean; matchLabel?: string }) {
  const isTbd = slot.status === 'tbd'
  const hasScore = slot.status === 'ft' || slot.status === 'live'

  const homeTeam = isTeam(slot.home) ? slot.home : null
  const awayTeam = isTeam(slot.away) ? slot.away : null
  const homeLabel = homeTeam ? homeTeam.name : (slot.home as string)
  const awayLabel = awayTeam ? awayTeam.name : (slot.away as string)

  return (
    <div
      style={{ width: CARD_W, minWidth: CARD_W }}
      className={`rounded-lg border text-[11px] overflow-hidden
        ${isFinal
          ? 'border-yellow-500/60 bg-gradient-to-br from-yellow-950/30 to-[#0d0d15] shadow-lg shadow-yellow-900/20'
          : isTbd
            ? 'border-dashed border-zinc-700/40 bg-[#0d0d15]'
            : 'border-zinc-700 bg-[#13131a]'
        }`}
    >
      {/* Match label header */}
      {matchLabel && (
        <div className={`px-2 py-0.5 text-center text-[9px] font-bold uppercase tracking-widest border-b
          ${isFinal
            ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
            : 'bg-zinc-800/60 text-zinc-500 border-zinc-700/60'
          }`}>
          {matchLabel}
        </div>
      )}
      <div className={`flex items-center gap-1.5 px-2 py-1.5 ${isTbd ? 'text-zinc-600' : 'text-zinc-200'}`}>
        {homeTeam && <span className="text-xs flex-shrink-0">{homeTeam.flag}</span>}
        <span className="flex-1 truncate text-[11px]">{homeLabel}</span>
        {hasScore && <span className="font-bold text-white tabular-nums ml-1">{slot.homeScore ?? 0}</span>}
      </div>
      <div className="border-t border-zinc-800/80" />
      <div className={`flex items-center gap-1.5 px-2 py-1.5 ${isTbd ? 'text-zinc-600' : 'text-zinc-200'}`}>
        {awayTeam && <span className="text-xs flex-shrink-0">{awayTeam.flag}</span>}
        <span className="flex-1 truncate text-[11px]">{awayLabel}</span>
        {hasScore && <span className="font-bold text-white tabular-nums ml-1">{slot.awayScore ?? 0}</span>}
      </div>
    </div>
  )
}

export default function BracketClient({ bracket }: { bracket: BracketRound[] }) {
  const [activeRounds, setActiveRounds] = useState<Set<string>>(new Set(['Round of 32']))

  const toggleRound = (name: string) => {
    setActiveRounds(prev => {
      const next = new Set(prev)
      if (next.has(name)) next.delete(name)
      else next.add(name)
      return next
    })
  }

  // Only the named rounds (not Third Place)
  const mainRounds = bracket.filter(r => ROUND_ORDER.includes(r.name))
  const thirdPlace = bracket.find(r => r.name === 'Third Place')

  // Ordered rounds that are currently active
  const displayedRounds = ROUND_ORDER
    .filter(name => activeRounds.has(name) && mainRounds.find(r => r.name === name))
    .map(name => mainRounds.find(r => r.name === name)!)

  // Max matches across displayed rounds = determines height
  const maxMatches = displayedRounds.length > 0
    ? Math.max(...displayedRounds.map(r => r.matches.length))
    : 0

  // Base unit height = total canvas height / maxMatches
  const BASE_UNIT = Math.max(CARD_H + 8, 72)
  const totalH = maxMatches * BASE_UNIT

  // Short label for each round used as match prefix
  const ROUND_MATCH_LABEL: Record<string, string> = {
    'Round of 32': 'R32',
    'Round of 16': 'R16',
    'Quarter-Finals': 'QF',
    'Semi-Finals': 'SF',
    'Final': 'Final',
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      {/* Sticky header with round toggles */}
      <div className="sticky top-0 z-10 bg-[#0a0a0f]/95 backdrop-blur-md border-b border-zinc-800 px-4 pt-3 pb-3">
        <h1 className="text-lg font-bold text-white mb-2.5">Knockout Bracket</h1>
        <div className="flex gap-2">
          {ROUND_ORDER.map(name => {
            const exists = mainRounds.find(r => r.name === name)
            if (!exists) return null
            const on = activeRounds.has(name)
            return (
              <button
                key={name}
                onClick={() => toggleRound(name)}
                className={`flex-1 aspect-[4/3] rounded-xl text-sm font-bold transition-all active:scale-95 shadow-lg shadow-black/40 flex items-center justify-center
                  ${on
                    ? name === 'Final'
                      ? 'bg-yellow-400 text-zinc-900'
                      : 'bg-[#00d4ff] text-[#0a0a0f]'
                    : 'bg-[#1a1a24] text-zinc-300 hover:text-white'
                  }`}
              >
                {ROUND_SHORT[name] || name}
              </button>
            )
          })}
        </div>
      </div>

      {displayedRounds.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 gap-3 text-zinc-500">
          <span className="text-3xl">🏆</span>
          <span className="text-sm">Tap a round above to view the bracket</span>
        </div>
      ) : (
        <div className="overflow-x-auto px-4 py-4">
          <div
            className="flex items-start"
            style={{ minWidth: displayedRounds.length * (CARD_W + CONN_W), height: totalH + 32 }}
          >
            {displayedRounds.map((round, colIdx) => {
              const isFinalRound = round.name === 'Final'
              const count = round.matches.length
              // Each slot gets equal share of totalH
              const slotH = totalH / count
              const isLast = colIdx === displayedRounds.length - 1

              return (
                <div key={round.name} className="flex items-start flex-shrink-0">
                  {/* Round column */}
                  <div style={{ width: CARD_W }}>
                    {/* Column label */}
                    <div className="h-7 flex items-center justify-center mb-0">
                      <span className={`text-[10px] font-bold uppercase tracking-widest
                        ${isFinalRound ? 'text-yellow-400' : 'text-[#00d4ff]/80'}`}>
                        {round.name}
                      </span>
                    </div>
                    {/* Match cards */}
                    {round.matches.map((slot, matchIdx) => {
                      const prefix = ROUND_MATCH_LABEL[round.name] || ROUND_SHORT[round.name]
                      const label = isFinalRound ? '⭐ Final ⭐' : `${prefix} ${matchIdx + 1}`
                      return (
                        <div
                          key={slot.id}
                          style={{ height: slotH, display: 'flex', alignItems: 'center' }}
                        >
                          <MatchCard slot={slot} isFinal={isFinalRound} matchLabel={label} />
                        </div>
                      )
                    })}
                  </div>

                  {/* Connector SVG (between this col and next) */}
                  {!isLast && (() => {
                    const nextRound = displayedRounds[colIdx + 1]
                    const thisCount = round.matches.length
                    const nextCount = nextRound.matches.length
                    const nextSlotH = totalH / nextCount
                    const groupSize = thisCount / nextCount  // how many current slots → 1 next slot

                    return (
                      <svg
                        width={CONN_W}
                        height={totalH + 32}
                        style={{ flexShrink: 0, marginTop: 28 }}
                        overflow="visible"
                      >
                        {Array.from({ length: nextCount }, (_, i) => {
                          const color = 'rgba(82,82,91,0.6)'  // zinc-600/60

                          if (groupSize >= 2 && Number.isInteger(groupSize)) {
                            // Bracket-style: two arms from current slots converge to midpoint, then horizontal to next
                            const slots = Array.from({ length: groupSize }, (_, j) => i * groupSize + j)
                            const yTop = slots[0] * slotH + slotH / 2
                            const yBot = slots[slots.length - 1] * slotH + slotH / 2
                            const yMid = (yTop + yBot) / 2
                            const yOut = i * nextSlotH + nextSlotH / 2

                            return (
                              <g key={i} stroke={color} strokeWidth="1.5" fill="none" strokeLinecap="round">
                                {/* Vertical bracket arms */}
                                <line x1={1} y1={yTop} x2={CONN_W / 2} y2={yTop} />
                                <line x1={1} y1={yBot} x2={CONN_W / 2} y2={yBot} />
                                <line x1={CONN_W / 2} y1={yTop} x2={CONN_W / 2} y2={yBot} />
                                {/* Horizontal output line */}
                                <line x1={CONN_W / 2} y1={yMid} x2={CONN_W} y2={yOut} />
                              </g>
                            )
                          } else {
                            // 1:1 — straight horizontal
                            const y = i * slotH + slotH / 2
                            return (
                              <line key={i} x1={0} y1={y} x2={CONN_W} y2={y} stroke={color} strokeWidth="1.5" strokeLinecap="round" />
                            )
                          }
                        })}
                      </svg>
                    )
                  })()}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Third Place (always show when visible) */}
      {thirdPlace?.matches[0] && activeRounds.has('Final') && (
        <div className="px-4 pb-8">
          <div className="bg-[#13131a] rounded-xl border border-zinc-800 p-3 max-w-[220px]">
            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-2">🥉 Third Place</p>
            <MatchCard slot={thirdPlace.matches[0]} />
          </div>
        </div>
      )}
    </div>
  )
}
