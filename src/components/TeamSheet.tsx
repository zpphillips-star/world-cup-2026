'use client'

import { useEffect, useState, useRef } from 'react'
import { mockProvider, resolveKnockoutTeamsFromStandings } from '@/lib/mockProvider'
import { FlagImg } from '@/components/FlagImg'
import type { Team, Standing, Match } from '@/lib/types'
import { Backdrop } from '@/components/Backdrop'
import { jerseyKits } from '@/data/jerseyKits'

interface Props {
  team: Team
  onClose: () => void
  /** Live standings for this team's group — if provided, overrides mockProvider */
  standings?: Standing[]
  /** Live group matches with scores applied — if provided, overrides mockProvider */
  groupMatches?: Match[]
  /**
   * Stacking layer: 2 = L2 sheet (e.g. opened from GroupSheet), 3 = L3 sheet
   * (e.g. opened from inside MatchCard). Higher layer = higher z-indexes so the
   * sheet sits above everything below it with its own dim overlay.
   * @default 2
   */
  layer?: 2 | 3
}

function formatKickoff(iso: string, tz: string) {
  try {
    const d = new Date(iso)
    const time = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', timeZone: tz })
    const abbr = new Intl.DateTimeFormat('en-US', { timeZone: tz, timeZoneName: 'short' })
      .formatToParts(d).find(p => p.type === 'timeZoneName')?.value ?? ''
    const date = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: tz })
    return `${date} · ${time} ${abbr}`
  } catch { return '—' }
}

export function TeamSheet({ team, onClose, standings: standingsProp, groupMatches: groupMatchesProp, layer = 2 }: Props) {
  // z-index values depend on which layer this sheet occupies
  // L2 (e.g. from GroupSheet): backdrop z-50 | panel z-60 | strip z-70
  // L3 (e.g. from MatchCard):  backdrop z-75 | panel z-80 | strip z-85
  const backdropZ = layer === 3 ? 'z-[75]' : 'z-[50]'
  const panelZ    = layer === 3 ? 'z-[80]' : 'z-[60]'
  const stripZ    = layer === 3 ? 'z-[85]' : 'z-[70]'
  // Use live data when provided, fall back to static mock data
  const allMockMatches = mockProvider.getMatches()
  const teamMatches = (groupMatchesProp ?? allMockMatches).filter(m =>
    m.group && (m.homeTeam.id === team.id || m.awayTeam.id === team.id)
  )
  const standings = standingsProp ?? (team.group ? mockProvider.getStandings()[team.group] ?? [] : [])
  const myStanding = standings.find(s => s.team.id === team.id)
  const groupPos = standings.findIndex(s => s.team.id === team.id) + 1
  const stats = mockProvider.getTeamStats(team.id)

  // Resolve knockout TBD slots using current standings, then filter to matches this team is in.
  // When live standings are provided (standingsProp), merge them into the base standings so that
  // resolved positions (e.g. "1st Group B" → Switzerland) use actual results, not mock 0-pt data
  // where all teams tie and insertion order decides.
  const baseStandings = mockProvider.getStandings()
  const allStandings = team.group && standingsProp
    ? { ...baseStandings, [team.group]: standingsProp }
    : baseStandings
  const resolvedKnockout = resolveKnockoutTeamsFromStandings(allStandings)
  const myKnockoutMatches = resolvedKnockout.filter(m =>
    m.homeTeam.id === team.id || m.awayTeam.id === team.id
  )

  // Determine if this team's group stage is finished — needed to decide whether
  // to show elimination / pending status messages.
  // Primary check: all 6 group matches are 'ft' in the provided match data.
  // Fallback: live standings show this team played 3 matches (= group stage complete) — handles
  // tabs like Today/Calendar where liveMatches only contains today's games, not historical ones.
  const srcMatches = groupMatchesProp ?? allMockMatches
  const allGroupMatches = team.group ? srcMatches.filter(m => m.group === team.group) : []
  const isGroupComplete =
    (allGroupMatches.length === 6 && allGroupMatches.every(m => m.status === 'ft')) ||
    (myStanding?.played === 3)

  const [closing, setClosing] = useState(false)
  const closingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleClose = () => {
    if (closing) return
    setClosing(true)
    closingTimerRef.current = setTimeout(onClose, 260)
  }

  // Close on Escape
  useEffect(() => {
    const fn = (e: KeyboardEvent) => { if (e.key === 'Escape') handleClose() }
    window.addEventListener('keydown', fn)
    return () => {
      window.removeEventListener('keydown', fn)
      if (closingTimerRef.current) clearTimeout(closingTimerRef.current)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <>
      {/* Backdrop */}
      <Backdrop onDismiss={handleClose} zIndex={backdropZ} bg="bg-black/70" />

      {/* Shop strip — fixed to very top of screen, only visible when flag is open */}
      <a
        href={`https://www.amazon.com/s?k=${encodeURIComponent(team.name + ' 2026 World Cup soccer jersey')}&tag=zpphillips-20`}
        target="_blank"
        rel="noopener noreferrer"
        className={`fixed top-0 left-0 right-0 ${stripZ} flex items-center justify-center gap-3 px-4 bg-gradient-to-r from-cyan-950/80 via-[#0d0d16] to-cyan-950/80 border-b border-cyan-500/20 active:opacity-75 transition-opacity`}
        style={{ paddingTop: 'calc(env(safe-area-inset-top) + 0.5rem)', paddingBottom: '0.5rem' }}
      >
        {/* Home + away jersey images */}
        {(() => {
          const kit = jerseyKits[team.id]
          return (
            <div className="flex items-end gap-2 flex-shrink-0">
              {kit?.home ? (
                <div className="flex flex-col items-center gap-0.5">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={kit.home} alt={`${team.name} home kit`} style={{ height: 52 }} className="w-auto object-contain drop-shadow-lg" />
                  <span className="text-[10px] text-zinc-400 leading-none">home</span>
                </div>
              ) : null}
              {kit?.away ? (
                <div className="flex flex-col items-center gap-0.5">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={kit.away} alt={`${team.name} away kit`} style={{ height: 52 }} className="w-auto object-contain drop-shadow-lg" />
                  <span className="text-[10px] text-zinc-400 leading-none">away</span>
                </div>
              ) : null}
            </div>
          )
        })()}
        <FlagImg teamId={team.id} fallback={team.flag} className="h-4 w-auto" />
        <span className="text-[12px] font-semibold text-cyan-300">Get {team.name}&apos;s 2026 jersey</span>
        <span className="text-cyan-400 text-[11px]">→</span>
      </a>

      {/* Sheet */}
      <div
        className={`fixed bottom-0 left-0 right-0 ${panelZ} max-h-[88vh] flex flex-col rounded-t-3xl overflow-hidden ${closing ? 'animate-slide-down' : 'animate-slide-up'} bg-[#0f0f18]`}
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative bg-gradient-to-b from-[#0a1628] to-[#0f0f18] px-5 pt-4 pb-5 flex-shrink-0">
          <div className="w-10 h-1 rounded-full bg-white/20 mx-auto mb-4" />
          <button
            onClick={handleClose}
            className="absolute top-4 right-5 w-8 h-8 flex items-center justify-center rounded-full bg-white/10 text-white text-sm"
          >✕</button>

          <div className="flex items-center gap-4 mt-1">
            <FlagImg teamId={team.id} fallback={team.flag} className="h-14" />
            <div>
              <h2 className="text-xl font-black text-white">{team.name}</h2>
              {team.group && (
                <span className="text-[11px] font-semibold text-zinc-400 bg-zinc-800/60 px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Group {team.group} · #{groupPos}
                </span>
              )}
            </div>
          </div>

          {/* Quick stat pills */}
          {stats && (
            <div className="flex gap-2 flex-wrap mt-3">
              <span className="text-[11px] font-bold bg-zinc-800/60 text-zinc-300 px-2.5 py-1 rounded-full">#{stats.fifaRank} FIFA</span>
              <span className="text-[11px] text-zinc-400 bg-zinc-800/60 px-2.5 py-1 rounded-full">{stats.worldCupAppearances} WC apps</span>
              <span className="text-[11px] text-zinc-400 bg-zinc-800/60 px-2.5 py-1 rounded-full">Best: {stats.bestFinish}</span>
            </div>
          )}
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto flex-1 px-4 pt-4 pb-6 space-y-5">

          {/* Group standing row */}
          {myStanding && (
            <div>
              <p className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Group {team.group} Standing</p>
              <div className="bg-[#1a1a24] rounded-2xl px-4 py-3 grid grid-cols-7 text-center text-sm gap-1">
                {[
                  { label: 'P', val: myStanding.played },
                  { label: 'W', val: myStanding.won },
                  { label: 'D', val: myStanding.drawn },
                  { label: 'L', val: myStanding.lost },
                  { label: 'GF', val: myStanding.goalsFor },
                  { label: 'GA', val: myStanding.goalsAgainst },
                  { label: 'PTS', val: myStanding.points },
                ].map(({ label, val }) => (
                  <div key={label}>
                    <div className={`font-bold ${label === 'PTS' ? 'text-[#00d4ff]' : 'text-white'}`}>{val}</div>
                    <div className="text-[10px] text-zinc-500 mt-0.5">{label}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Matches */}
          <div>
            <p className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Group Stage Matches</p>
            <div className="space-y-2">
              {teamMatches.sort((a, b) => new Date(a.kickoff).getTime() - new Date(b.kickoff).getTime()).map(m => {
                const isHome = m.homeTeam.id === team.id
                const opponent = isHome ? m.awayTeam : m.homeTeam
                const myScore = m.status === 'ft' ? (isHome ? m.homeScore : m.awayScore) : null
                const oppScore = m.status === 'ft' ? (isHome ? m.awayScore : m.homeScore) : null
                const won = myScore != null && oppScore != null && myScore > oppScore
                const drew = myScore != null && oppScore != null && myScore === oppScore
                const lost = myScore != null && oppScore != null && myScore < oppScore
                const resultColor = won ? 'text-emerald-400' : drew ? 'text-yellow-400' : lost ? 'text-red-400' : 'text-zinc-400'
                const resultLabel = won ? 'W' : drew ? 'D' : lost ? 'L' : ''

                return (
                  <div key={m.id} className="bg-[#1a1a24] rounded-2xl px-4 py-3 flex items-center gap-3">
                    <FlagImg teamId={opponent.id} fallback={opponent.flag} className="h-7" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-white truncate">{opponent.name}</p>
                      <p className="text-[11px] text-zinc-500">{formatKickoff(m.kickoff, m.venue.timezone)} · {m.venue.city}</p>
                    </div>
                    {m.status === 'ft' && myScore != null && (
                      <div className="text-right flex-shrink-0">
                        <span className={`text-sm font-black ${resultColor}`}>{resultLabel}</span>
                        <span className="text-sm text-white ml-1.5">{isHome ? `${myScore}–${oppScore}` : `${myScore}–${oppScore}`}</span>
                      </div>
                    )}
                    {m.status === 'live' && (
                      <span className="text-xs font-bold text-red-400 animate-pulse flex-shrink-0">LIVE</span>
                    )}
                    {m.status === 'upcoming' && (
                      <span className="text-xs text-zinc-500 flex-shrink-0">MD{m.matchday}</span>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Knockout Stage */}
          {/* Only show once the group is fully played out */}
          {isGroupComplete && team.group && groupPos > 0 && (
            <div>
              <p className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Knockout Stage</p>

              {/* 1st / 2nd place: show their R32 match(es) */}
              {myKnockoutMatches.length > 0 && (
                <div className="space-y-2">
                  {myKnockoutMatches.sort((a, b) => new Date(a.kickoff).getTime() - new Date(b.kickoff).getTime()).map(m => {
                    const isHome = m.homeTeam.id === team.id
                    const opponent = isHome ? m.awayTeam : m.homeTeam
                    const myScore = m.status === 'ft' ? (isHome ? m.homeScore : m.awayScore) : null
                    const oppScore = m.status === 'ft' ? (isHome ? m.awayScore : m.homeScore) : null
                    const won = myScore != null && oppScore != null && myScore > oppScore
                    const drew = myScore != null && oppScore != null && myScore === oppScore
                    const lost = myScore != null && oppScore != null && myScore < oppScore
                    const resultColor = won ? 'text-emerald-400' : drew ? 'text-yellow-400' : lost ? 'text-red-400' : 'text-zinc-400'
                    const resultLabel = won ? 'W' : drew ? 'D' : lost ? 'L' : ''

                    return (
                      <div key={m.id} className="bg-[#1a1a24] rounded-lg px-4 py-3 flex items-center gap-3">
                        <FlagImg teamId={opponent.id} fallback={opponent.flag} className="h-7" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-white truncate">{opponent.name}</p>
                          <p className="text-[11px] text-zinc-500">{formatKickoff(m.kickoff, m.venue.timezone)} · {m.venue.city}</p>
                          <p className="text-[10px] text-zinc-600 mt-0.5 uppercase tracking-wide">{m.round}</p>
                        </div>
                        {m.status === 'ft' && myScore != null && (
                          <div className="text-right flex-shrink-0">
                            <span className={`text-sm font-black ${resultColor}`}>{resultLabel}</span>
                            <span className="text-sm text-white ml-1.5">{myScore}–{oppScore}</span>
                          </div>
                        )}
                        {m.status === 'live' && (
                          <span className="text-xs font-bold text-red-400 animate-pulse flex-shrink-0">LIVE</span>
                        )}
                        {m.status === 'upcoming' && null}
                      </div>
                    )
                  })}
                </div>
              )}

              {/* 3rd place: may still advance as one of the 8 best 3rd-place teams */}
              {myKnockoutMatches.length === 0 && groupPos === 3 && (
                <div className="bg-[#1a1a24] rounded-2xl px-4 py-3 flex items-center gap-3">
                  <span className="text-xl leading-none">⏳</span>
                  <div>
                    <p className="text-sm font-semibold text-yellow-400">Qualification pending</p>
                    <p className="text-[11px] text-zinc-500 mt-0.5">Awaiting best 3rd-place results across all groups</p>
                  </div>
                </div>
              )}

              {/* 4th place: definitively eliminated */}
              {myKnockoutMatches.length === 0 && groupPos >= 4 && (
                <div className="bg-[#1a1a24] rounded-2xl px-4 py-3 flex items-center gap-3">
                  <span className="text-xl leading-none">❌</span>
                  <p className="text-sm text-zinc-400">Did not qualify for knockout stage</p>
                </div>
              )}
            </div>
          )}

          {/* All-time stats */}
          {stats && (
            <div>
              <p className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest mb-2">All-Time World Cup Record</p>
              <div className="bg-[#1a1a24] rounded-2xl px-4 py-3 grid grid-cols-4 text-center gap-1">
                {[
                  { label: 'W', val: stats.wcWins },
                  { label: 'D', val: stats.wcDraws },
                  { label: 'L', val: stats.wcLosses },
                  { label: 'GF', val: stats.wcGoalsFor },
                ].map(({ label, val }) => (
                  <div key={label}>
                    <div className="text-lg font-black text-white">{val}</div>
                    <div className="text-[10px] text-zinc-500 mt-0.5">{label}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
