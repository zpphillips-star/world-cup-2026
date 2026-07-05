'use client'

import { FlagImg } from '@/components/FlagImg'
import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import type { BracketSlot, Match, Team } from '@/lib/types'
import type { ScoreUpdate } from '@/app/api/live-scores/route'
import { applyLiveScores } from '@/lib/liveScores'
import { getBracket, resolveKnockoutTeams } from '@/lib/mockProvider'
import MatchCardSheet from '@/components/MatchCard'
import { useEffectiveStandings } from '@/lib/useEffectiveStandings'
import { mergeStandings } from '@/lib/standingsUtils'
import type { Standing } from '@/lib/types'

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

function isTeam(x: unknown): x is Team {
  return typeof x === 'object' && x !== null
}

/** Convert a bracket slot's home/away into a Team, synthesising TBD ones. */
function toTeam(val: Team | string): Team {
  if (isTeam(val)) return val
  return { id: 'tbd', name: val, flag: '' }
}

/** Convert a BracketSlot into a Match for the MatchCard sheet. */
function slotToMatch(slot: BracketSlot, allMatches: Match[]): Match {
  // Find the underlying knockout Match (same id) to grab venue / kickoff / round
  const base = allMatches.find(m => m.id === slot.id)
  const homeTeam = toTeam(slot.home)
  const awayTeam = toTeam(slot.away)
  return {
    id: slot.id,
    homeTeam,
    awayTeam,
    kickoff: slot.kickoff ?? base?.kickoff ?? new Date().toISOString(),
    venue: slot.venue ?? base?.venue ?? { id: 'tbd', name: 'TBD', city: 'TBD', country: 'TBD', timezone: 'UTC' },
    round: base?.round ?? 'Knockout',
    status: slot.status === 'tbd' ? 'upcoming' : slot.status,
    homeScore: slot.homeScore,
    awayScore: slot.awayScore,
    penaltyWinner: slot.penaltyWinner,
    homePenaltyScore: slot.homePenaltyScore,
    awayPenaltyScore: slot.awayPenaltyScore,
  }
}

function SlotCard({ slot, isFinal = false, matchLabel, onClick }: {
  slot: BracketSlot
  isFinal?: boolean
  matchLabel?: string
  onClick?: () => void
}) {
  const isTbd = slot.status === 'tbd'
  const isLive = slot.status === 'live'
  const hasScore = slot.status === 'ft' || isLive

  const homeTeam = isTeam(slot.home) ? slot.home : null
  const awayTeam = isTeam(slot.away) ? slot.away : null
  const homeLabel = homeTeam ? homeTeam.name : (slot.home as string)
  const awayLabel = awayTeam ? awayTeam.name : (slot.away as string)

  return (
    <button
      onClick={onClick}
      style={{ width: CARD_W, minWidth: CARD_W }}
      className={`rounded-lg border text-[11px] overflow-hidden text-left w-full
        active:scale-95 transition-transform focus:outline-none
        ${isLive
          ? 'border-red-500/70 bg-[#13131a] shadow-lg shadow-red-900/30'
          : isFinal
            ? 'border-yellow-500/60 bg-gradient-to-br from-yellow-950/30 to-[#0d0d15] shadow-lg shadow-yellow-900/20'
            : isTbd
              ? 'border-dashed border-zinc-700/40 bg-[#0d0d15]'
              : 'border-zinc-700 bg-[#13131a]'
        }`}
    >
      {matchLabel && (
        <div className={`px-2 py-0.5 text-center text-[9px] font-bold uppercase tracking-widest border-b flex items-center justify-center gap-1.5
          ${isLive
            ? 'bg-red-500/15 text-red-400 border-red-500/30'
            : isFinal
              ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
              : 'bg-zinc-800/60 text-zinc-500 border-zinc-700/60'
          }`}>
          {isLive && (
            <span className="flex items-center gap-1">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
              <span className="text-red-400 font-bold">LIVE</span>
              <span className="text-zinc-500 font-normal">·</span>
            </span>
          )}
          {matchLabel}
        </div>
      )}
      <div className={`flex items-center gap-1.5 px-2 py-1.5 ${isTbd ? 'text-zinc-600' : 'text-zinc-200'}`}>
        {homeTeam
          ? <FlagImg teamId={homeTeam.id} fallback={homeTeam.flag} className="h-4" />
          : null
        }
        <span className="flex-1 truncate text-[11px]">{homeLabel}</span>
        {hasScore && (
          <span className={`font-bold tabular-nums ml-1 ${isLive ? 'text-red-300' : 'text-white'}`}>
            {slot.homeScore ?? 0}
            {slot.penaltyWinner && slot.homePenaltyScore != null && (
              <span className="text-zinc-400 font-normal text-[10px]"> ({slot.homePenaltyScore})</span>
            )}
          </span>
        )}
      </div>
      <div className="border-t border-zinc-800/80" />
      <div className={`flex items-center gap-1.5 px-2 py-1.5 ${isTbd ? 'text-zinc-600' : 'text-zinc-200'}`}>
        {awayTeam
          ? <FlagImg teamId={awayTeam.id} fallback={awayTeam.flag} className="h-4" />
          : null
        }
        <span className="flex-1 truncate text-[11px]">{awayLabel}</span>
        {hasScore && (
          <span className={`font-bold tabular-nums ml-1 ${isLive ? 'text-red-300' : 'text-white'}`}>
            {slot.awayScore ?? 0}
            {slot.penaltyWinner && slot.awayPenaltyScore != null && (
              <span className="text-zinc-400 font-normal text-[10px]"> ({slot.awayPenaltyScore})</span>
            )}
          </span>
        )}
      </div>
      {slot.status === 'ft' && slot.penaltyWinner && (
        <div className="px-2 pb-1 flex items-center justify-center relative">
          {slot.penaltyWinner === 'home' && (
            <span className="absolute left-1/2 -translate-x-[calc(50%+18px)] text-[9px] text-zinc-500">▲</span>
          )}
          <span className="text-[9px] text-zinc-500 font-medium">Penalties</span>
          {slot.penaltyWinner === 'away' && (
            <span className="absolute left-1/2 -translate-x-[calc(50%-18px)] text-[9px] text-zinc-500">▼</span>
          )}
        </div>
      )}
    </button>
  )
}

export default function BracketClient({ initialMatches, statsMap = {}, standingsMap = {} }: {
  initialMatches: Match[]
  statsMap?: Record<string, import('@/lib/types').TeamStats | null>
  standingsMap?: Record<string, import('@/lib/types').Standing[]>
}) {
  const [activeRounds, setActiveRounds] = useState<Set<string>>(new Set(['Round of 32']))
  const [liveScores, setLiveScores] = useState<Record<string, ScoreUpdate>>({})
  const [liveAliases, setLiveAliases] = useState<Record<string, string>>({})
  const [userTimezone, setUserTimezone] = useState('UTC')
  const [liveStandingsMap, setLiveStandingsMap] = useState<Record<string, Standing[]>>(standingsMap)
  const liveScoresRef = useRef(liveScores)
  useEffect(() => { liveScoresRef.current = liveScores }, [liveScores])
  useEffect(() => { setUserTimezone(Intl.DateTimeFormat().resolvedOptions().timeZone) }, [])
  const scoresIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Which bracket slot the user tapped — drives the sheet
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null)

  const fetchScores = useCallback(async () => {
    try {
      const res = await fetch('/api/live-scores')
      if (!res.ok) return
      const data = await res.json()
      setLiveScores(data.scores ?? {})
      setLiveAliases(data.aliases ?? {})
    } catch { /* fail silently */ }
  }, [])

  const fetchStandings = useCallback(async () => {
    try {
      const res = await fetch('/api/standings')
      if (!res.ok) return
      const data = await res.json()
      setLiveStandingsMap(mergeStandings(standingsMap, data.standings ?? {}))
    } catch { /* fail silently */ }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [standingsMap])

  useEffect(() => {
    fetchScores()
    fetchStandings()
    scoresIntervalRef.current = setInterval(fetchScores, 30_000)
    const standingsInterval = setInterval(fetchStandings, 60_000)
    // Adaptive polling: 2s when live, 30s otherwise
    const adaptivePoller = setInterval(() => {
      const hasLive = Object.values(liveScoresRef.current).some(s => s.status === 'live')
      const rate = hasLive ? 2_000 : 30_000
      if (scoresIntervalRef.current) clearInterval(scoresIntervalRef.current)
      scoresIntervalRef.current = setInterval(fetchScores, rate)
    }, 5_000)
    return () => {
      if (scoresIntervalRef.current) clearInterval(scoresIntervalRef.current)
      clearInterval(standingsInterval)
      clearInterval(adaptivePoller)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchStandings])

  // Apply live scores to group-stage matches and recompute the bracket
  const bracket = useMemo(() => {
    // Step 1: apply group-stage scores so standings can be computed
    const withGroupScores = applyLiveScores(initialMatches, liveScores, liveAliases)
    // Step 2: resolve TBD knockout teams using completed group standings
    const resolved = resolveKnockoutTeams(withGroupScores)
    // Step 3: re-apply so R32 slot statuses/scores reflect live data
    const withKnockoutScores = applyLiveScores(resolved, liveScores, liveAliases)
    // Step 4: resolve knockout-winner slots (W R32-X → winner) now R32 matches are ft
    const withWinners = resolveKnockoutTeams(withKnockoutScores)
    // Step 5: re-apply scores now that R16+ teams are fully resolved (e.g. paraguay|france)
    return getBracket(applyLiveScores(withWinners, liveScores, liveAliases))
  }, [initialMatches, liveScores, liveAliases])

  const liveMatchesFull = useMemo(() => {
    const withGroupScores = applyLiveScores(initialMatches, liveScores, liveAliases)
    const resolved = resolveKnockoutTeams(withGroupScores)
    const withKnockoutScores = applyLiveScores(resolved, liveScores, liveAliases)
    const withWinners = resolveKnockoutTeams(withKnockoutScores)
    return applyLiveScores(withWinners, liveScores, liveAliases)
  }, [initialMatches, liveScores, liveAliases])
  const { effectiveStandingsMap } = useEffectiveStandings(liveMatchesFull, standingsMap, liveStandingsMap)

  // Flat ordered list of all knockout Match objects (for swipe navigation in the sheet)
  const knockoutMatchList = useMemo<Match[]>(() => {
    const allRounds = [...ROUND_ORDER, 'Third Place']
    return allRounds
      .flatMap(roundName => bracket.find(r => r.name === roundName)?.matches ?? [])
      .map(slot => slotToMatch(slot, initialMatches))
      .sort((a, b) => new Date(a.kickoff).getTime() - new Date(b.kickoff).getTime())
  }, [bracket, initialMatches])

  // The Match that should open in the sheet right now
  const selectedMatch = useMemo<Match | null>(() => {
    if (!selectedSlotId) return null
    // Re-derive from current bracket so live scores are reflected
    const allSlots = bracket.flatMap(r => r.matches)
    const slot = allSlots.find(s => s.id === selectedSlotId)
    if (!slot) return null
    return slotToMatch(slot, initialMatches)
  }, [selectedSlotId, bracket, initialMatches])

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

  const BASE_UNIT = Math.max(CARD_H + 24, 88)
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
            const hasLive = exists.matches.some(s => s.status === 'live')
            return (
              <button
                key={name}
                onClick={() => toggleRound(name)}
                className={`flex-1 aspect-[4/3] rounded-xl text-sm font-bold transition-all active:scale-95 shadow-lg shadow-black/40 flex flex-col items-center justify-center gap-0.5 relative
                  ${on
                    ? name === 'Final'
                      ? 'bg-yellow-400 text-zinc-900'
                      : 'bg-[#00d4ff] text-[#0a0a0f]'
                    : 'bg-[#1a1a24] text-zinc-300 hover:text-white'
                  }`}
              >
                {ROUND_SHORT[name] || name}
                {hasLive && (
                  <span className="flex items-center gap-0.5">
                    <span className={`inline-block w-1.5 h-1.5 rounded-full animate-pulse ${on ? 'bg-red-700' : 'bg-red-500'}`} />
                    <span className={`text-[8px] font-bold uppercase ${on ? 'text-red-800' : 'text-red-400'}`}>Live</span>
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {displayedRounds.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 gap-3 text-zinc-500">
          <span className="text-3xl">🥅</span>
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
                      // Derive number from slot ID (e.g. 'r32-3' → '3') so labels always
                      // match the "W R32-3" / "W R16-2" placeholders in subsequent rounds.
                      const idNum = slot.id.replace(/^[^-]+-/, '')
                      const label = isFinalRound ? '\u2B50 Final \u2B50' : `${prefix} ${idNum}`
                      return (
                        <div
                          key={slot.id}
                          style={{ height: slotH, display: 'flex', alignItems: 'center' }}
                        >
                          <SlotCard
                            slot={slot}
                            isFinal={isFinalRound}
                            matchLabel={label}
                            onClick={() => setSelectedSlotId(slot.id)}
                          />
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
                            // Use explicit feedPairs from the NEXT round if present,
                            // otherwise fall back to sequential pairing.
                            const pairs = nextRound.feedPairs
                            const srcIndices: number[] = pairs
                              ? pairs[i]
                              : Array.from({ length: groupSize }, (_, j) => i * groupSize + j)
                            const yTop = srcIndices[0] * slotH + slotH / 2
                            const yBot = srcIndices[srcIndices.length - 1] * slotH + slotH / 2
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
            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-2">🥉 Third Place</p>
            <SlotCard
              slot={thirdPlace.matches[0]}
              onClick={() => setSelectedSlotId(thirdPlace.matches[0].id)}
            />
          </div>
        </div>
      )}

      {/* Match detail sheet — opens when a bracket slot is tapped */}
      {selectedMatch && (
        <MatchCardSheet
          key={selectedMatch.id}
          match={selectedMatch}
          userTimezone={userTimezone}
          defaultOpen
          noRow
          onCloseExternal={() => setSelectedSlotId(null)}
          allMatches={knockoutMatchList}
          allLiveData={liveScores}
          allLiveAliases={liveAliases}
          homeStats={statsMap[selectedMatch.homeTeam.id] ?? null}
          awayStats={statsMap[selectedMatch.awayTeam.id] ?? null}
          allStatsMap={statsMap}
          allStandingsMap={effectiveStandingsMap}
          contextMatches={liveMatchesFull}
        />
      )}
    </div>
  )
}
