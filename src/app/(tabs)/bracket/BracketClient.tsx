'use client'

import { FlagImg } from '@/components/FlagImg'
import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import type { BracketSlot, Match } from '@/lib/types'
import type { ScoreUpdate } from '@/app/api/live-scores/route'
import { applyLiveScores } from '@/lib/liveScores'
import { getBracket } from '@/lib/mockProvider'

const ROUND_ORDER = ['Round of 32', 'Round of 16', 'Quarter-Finals', 'Semi-Finals', 'Final']
const ROUND_SHORT: Record<string, string> = {
  'Round of 32': 'R32',
  'Round of 16': 'R16',
  'Quarter-Finals': 'QF',
  'Semi-Finals': 'SF',
  'Final': 'Final',
}

const CARD_H = 60
const CARD_W = 164
const CONN_W = 28

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
        {homeTeam && <FlagImg teamId={homeTeam.id} fallback={homeTeam.flag} className="h-4" />}
        <span className="flex-1 truncate text-[11px]">{homeLabel}</span>
        {hasScore && <span className="font-bold text-white tabular-nums ml-1">{slot.homeScore ?? 0}</span>}
      </div>
      <div className="border-t border-zinc-800/80" />
      <div className={`flex items-center gap-1.5 px-2 py-1.5 ${isTbd ? 'text-zinc-600' : 'text-zinc-200'}`}>
        {awayTeam && <FlagImg teamId={awayTeam.id} fallback={awayTeam.flag} className="h-4" />}
        <span className="flex-1 truncate text-[11px]">{awayLabel}</span>
        {hasScore && <span className="font-bold text-white tabular-nums ml-1">{slot.awayScore ?? 0}</span>}
      </div>
    </div>
  )
}

export default function BracketClient({ initialMatches }: { initialMatches: Match[] }) {
  const [activeRounds, setActiveRounds] = useState<Set<string>>(new Set(['Round of 32']))
  const [liveScores, setLiveScores] = useState<Record<string, ScoreUpdate>>({})
  const [liveAliases, setLiveAliases] = useState<Record<string, string>>({})
  const liveScoresRef = useRef(liveScores)
  useEffect(() => { liveScoresRef.current = liveScores }, [liveScores])
  const scoresIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const fetchScores = useCallback(async () => {
    try {
      const res = await fetch('/api/live-scores')
      if (!res.ok) return
      const data = await res.json()
      setLiveScores(data.scores ?? {})
      setLiveAliases(data.aliases ?? {})
    } catch { /* fail silently */ }
  }, [])

  useEffect(() => {
    fetchScores()
    scoresIntervalRef.current = setInterval(fetchScores, 30_000)
    // Adaptive polling: 2s when live, 30s otherwise
    const adaptivePoller = setInterval(() => {
      const hasLive = Object.values(liveScoresRef.current).some(s => s.status === 'live')
      const rate = hasLive ? 2_000 : 30_000
      if (scoresIntervalRef.current) clearInterval(scoresIntervalRef.current)
      scoresIntervalRef.current = setInterval(fetchScores, rate)
    }, 5_000)
    return () => {
      if (scoresIntervalRef.current) clearInterval(scoresIntervalRef.current)
      clearInterval(adaptivePoller)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Apply live scores to group-stage matches and recompute the bracket
  const bracket = useMemo(() => {
    const liveMatches = applyLiveScores(initialMatches, liveScores, liveAliases)
    return getBracket(liveMatches)
  }, [initialMatches, liveScores, liveAliases])

  const toggleRound = (name: string) => {
    setActiveRounds(prev => {
      const next = new Set(prev)
      if (next.has(name)) next.delete(name)
      else next.add(name)
      return next
    })
  }

  const mainRounds = bracket.filter(r => ROUND_ORDER.includes(r.name))
  const thirdPlace = bracket.find(r => r.name === 'Third Place')

  const displayedRounds = ROUND_ORDER
    .filter(name => activeRounds.has(name) && mainRounds.find(r => r.name === name))
    .map(name => mainRounds.find(r => r.name === name)!)

  const maxMatches = displayedRounds.length > 0
    ? Math.max(...displayedRounds.map(r => r.matches.length))
    : 0

  const BASE_UNIT = Math.max(CARD_H + 8, 72)
  const totalH = maxMatches * BASE_UNIT

  const ROUND_MATCH_LABEL: Record<string, string> = {
    'Round of 32': 'R32',
    'Round of 16': 'R16',
    'Quarter-Finals': 'QF',
    'Semi-Finals': 'SF',
    'Final': 'Final',
  }

  return (
    <div className="h-full overflow-y-auto bg-[#0a0a0f]" style={{ paddingBottom: 'calc(6rem + env(safe-area-inset-bottom))' }}>
      <div className="sticky top-0 z-10 bg-[#0a0a0f]/95 backdrop-blur-md border-b border-zinc-800 px-5 pt-5 pb-3">
        <h1 className="text-[22px] font-bold text-white tracking-tight">Knockout Bracket</h1>
        <p className="text-[12px] text-zinc-500 mt-0.5 mb-2.5">FIFA World Cup 2026 · Elimination Rounds</p>
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
              const slotH = totalH / count
              const isLast = colIdx === displayedRounds.length - 1

              return (
                <div key={round.name} className="flex items-start flex-shrink-0">
                  <div style={{ width: CARD_W }}>
                    <div className="h-7 flex items-center justify-center mb-0">
                      <span className={`text-[10px] font-bold uppercase tracking-widest
                        ${isFinalRound ? 'text-yellow-400' : 'text-zinc-400'}`}>
                        {round.name}
                      </span>
                    </div>
                    {round.matches.map((slot, matchIdx) => {
                      const prefix = ROUND_MATCH_LABEL[round.name] || ROUND_SHORT[round.name]
                      const label = isFinalRound ? '\u2B50 Final \u2B50' : `${prefix} ${matchIdx + 1}`
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

                  {!isLast && (() => {
                    const nextRound = displayedRounds[colIdx + 1]
                    const thisCount = round.matches.length
                    const nextCount = nextRound.matches.length
                    const nextSlotH = totalH / nextCount
                    const groupSize = thisCount / nextCount

                    return (
                      <svg
                        width={CONN_W}
                        height={totalH + 32}
                        style={{ flexShrink: 0, marginTop: 28 }}
                        overflow="visible"
                      >
                        {Array.from({ length: nextCount }, (_, i) => {
                          const color = 'rgba(82,82,91,0.6)'

                          if (groupSize >= 2 && Number.isInteger(groupSize)) {
                            const slots = Array.from({ length: groupSize }, (_, j) => i * groupSize + j)
                            const yTop = slots[0] * slotH + slotH / 2
                            const yBot = slots[slots.length - 1] * slotH + slotH / 2
                            const yMid = (yTop + yBot) / 2
                            const yOut = i * nextSlotH + nextSlotH / 2

                            return (
                              <g key={i} stroke={color} strokeWidth="1.5" fill="none" strokeLinecap="round">
                                <line x1={1} y1={yTop} x2={CONN_W / 2} y2={yTop} />
                                <line x1={1} y1={yBot} x2={CONN_W / 2} y2={yBot} />
                                <line x1={CONN_W / 2} y1={yTop} x2={CONN_W / 2} y2={yBot} />
                                <line x1={CONN_W / 2} y1={yMid} x2={CONN_W} y2={yOut} />
                              </g>
                            )
                          } else {
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

      {thirdPlace?.matches[0] && activeRounds.has('Final') && (
        <div className="px-4 pb-8">
          <div className="bg-[#13131a] rounded-xl border border-zinc-800 p-3 max-w-[220px]">
            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-2">\U0001F949 Third Place</p>
            <MatchCard slot={thirdPlace.matches[0]} />
          </div>
        </div>
      )}
    </div>
  )
}
