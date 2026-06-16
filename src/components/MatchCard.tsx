'use client'

import { useState, useRef, useEffect } from 'react'
import type { Match, TeamStats, Standing, Team } from '@/lib/types'
import { TeamSheet } from '@/components/TeamSheet'
import { getTeamColor } from '@/lib/teamColors'
import { normalize } from '@/lib/espnAliases'
import type { ScoreUpdate } from '@/app/api/live-scores/route'

function formatTime(kickoff: string, timezone: string): { time: string; tzAbbr: string } {
  try {
    const date = new Date(kickoff)
    const time = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', timeZone: timezone })
    const tzAbbr = new Intl.DateTimeFormat('en-US', { timeZone: timezone, timeZoneName: 'short' })
      .formatToParts(date).find(p => p.type === 'timeZoneName')?.value ?? ''
    return { time, tzAbbr }
  } catch {
    return { time: '--:--', tzAbbr: '' }
  }
}

import { FlagImg } from '@/components/FlagImg'

function StatBox({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex flex-col items-center gap-1 bg-[#0d0d15] rounded-xl px-3 py-2.5 min-w-[44px]">
      <span className="text-[18px] font-bold text-white tabular-nums leading-none">{value}</span>
      <span className="text-[10px] text-zinc-500 uppercase tracking-widest leading-none">{label}</span>
    </div>
  )
}

function TeamPanel({ team, stats, side }: {
  team: { id: string; name: string; flag: string }
  stats: TeamStats | null
  side: 'home' | 'away'
}) {
  return (
    <div className={`flex-1 flex flex-col gap-3 ${side === 'away' ? 'items-end' : 'items-start'}`}>
      <span className={`text-[15px] font-bold text-white leading-tight`}>{team.name}</span>
      {!stats ? (
        <span className="text-xs text-zinc-600">No data</span>
      ) : (
        <>
          <div className={`flex flex-wrap gap-1.5 ${side === 'away' ? 'justify-end' : ''}`}>
            <span className="text-[11px] font-bold bg-[#00d4ff]/10 text-[#00d4ff] px-2 py-0.5 rounded-full">
              #{stats.fifaRank} FIFA
            </span>
            <span className="text-[11px] text-zinc-500 bg-zinc-800/60 px-2 py-0.5 rounded-full">
              {stats.worldCupAppearances} WC apps
            </span>
          </div>
          <div className={`flex gap-1.5 flex-wrap ${side === 'away' ? 'justify-end' : ''}`}>
            <StatBox label="W" value={stats.wcWins} />
            <StatBox label="D" value={stats.wcDraws} />
            <StatBox label="L" value={stats.wcLosses} />
            <StatBox label="GF" value={stats.wcGoalsFor} />
            <StatBox label="GA" value={stats.wcGoalsAgainst} />
          </div>
          <div className={`flex items-center gap-1 ${side === 'away' ? 'flex-row-reverse' : ''}`}>
            <span className="text-base">🏆</span>
            <span className="text-[12px] text-zinc-300 font-medium">{stats.bestFinish}</span>
          </div>
        </>
      )}
    </div>
  )
}

function GroupTable({ groupId, standings, highlightIds }: {
  groupId: string
  standings: Standing[]
  highlightIds: string[]
}) {
  return (
    <div className="mt-6">
      <p className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest mb-3 text-center">
        Group {groupId} Standings
      </p>
      <div className="rounded-2xl overflow-hidden border border-zinc-800">
        {/* Header */}
        <div className="grid bg-zinc-800/60 px-3 py-2 text-[10px] font-bold text-zinc-500 uppercase tracking-widest"
          style={{ gridTemplateColumns: '1fr 28px 28px 28px 28px 28px 28px 32px' }}>
          <span>Team</span>
          <span className="text-center">P</span>
          <span className="text-center">W</span>
          <span className="text-center">D</span>
          <span className="text-center">L</span>
          <span className="text-center">GF</span>
          <span className="text-center">GA</span>
          <span className="text-center">Pts</span>
        </div>
        {standings.map((s, i) => {
          const isHighlighted = highlightIds.includes(s.team.id)
          const isTop2 = i < 2
          return (
            <div
              key={s.team.id}
              className={`grid items-center px-3 py-2.5 border-t border-zinc-800/60 text-[13px] transition-colors
                ${isHighlighted
                  ? 'bg-[#00d4ff]/8 border-l-2 border-l-[#00d4ff]'
                  : isTop2
                    ? 'bg-zinc-800/20'
                    : 'bg-[#0f0f18]'
                }`}
              style={{ gridTemplateColumns: '1fr 28px 28px 28px 28px 28px 28px 32px' }}
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-[11px] text-zinc-600 w-3 flex-shrink-0">{i + 1}</span>
                <span className="text-base leading-none flex-shrink-0"><FlagImg teamId={s.team.id} fallback={s.team.flag} className="h-4" /></span>
                <span className={`truncate font-medium ${isHighlighted ? 'text-white' : isTop2 ? 'text-zinc-200' : 'text-zinc-400'}`}>
                  {s.team.name}
                </span>
                {isTop2 && !isHighlighted && (
                  <span className="text-[9px] text-emerald-500 bg-emerald-500/10 px-1 py-0.5 rounded flex-shrink-0">ADV</span>
                )}
              </div>
              <span className="text-center text-zinc-400 tabular-nums">{s.played}</span>
              <span className="text-center text-zinc-300 tabular-nums">{s.won}</span>
              <span className="text-center text-zinc-400 tabular-nums">{s.drawn}</span>
              <span className="text-center text-zinc-400 tabular-nums">{s.lost}</span>
              <span className="text-center text-zinc-400 tabular-nums">{s.goalsFor}</span>
              <span className="text-center text-zinc-400 tabular-nums">{s.goalsAgainst}</span>
              <span className={`text-center font-bold tabular-nums ${isHighlighted ? 'text-[#00d4ff]' : isTop2 ? 'text-white' : 'text-zinc-400'}`}>
                {s.points}
              </span>
            </div>
          )
        })}
      </div>
      <p className="text-[10px] text-zinc-600 mt-2 text-center">Top 2 advance · ADV = advancing position</p>
    </div>
  )
}

import type { ScoringEvent, CardEvent } from '@/app/api/live-scores/route'

export default function MatchCard({
  match,
  userTimezone = 'UTC',
  homeStats,
  awayStats,
  groupStandings,
  groupMatches,
  clock,
  scorers,
  defaultOpen = false,
  onCloseExternal,
  // swipe navigation
  allMatches,
  allStatsMap,
  allStandingsMap,
  allLiveData,
}: {
  match: Match
  userTimezone?: string
  homeStats?: TeamStats | null
  awayStats?: TeamStats | null
  groupStandings?: Standing[]
  groupMatches?: Match[]
  clock?: string
  scorers?: ScoringEvent[]
  defaultOpen?: boolean
  onCloseExternal?: () => void
  allMatches?: Match[]
  allStatsMap?: Record<string, TeamStats | null>
  allStandingsMap?: Record<string, Standing[]>
  allLiveData?: Record<string, ScoreUpdate>
}){
  const [open, setOpen] = useState(defaultOpen)
  const [teamSheet, setTeamSheet] = useState<Team | null>(null)

  // ── Swipe navigation ───────────────────────────────────────────────────────
  const [currentIdx, setCurrentIdx] = useState<number>(() => {
    if (!allMatches) return 0
    const i = allMatches.findIndex(m => m.id === match.id)
    return i >= 0 ? i : 0
  })
  const touchStartX = useRef(0)
  const touchStartY = useRef(0)

  // Reset team sheet when navigating to a new match
  useEffect(() => { setTeamSheet(null) }, [currentIdx])

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
    touchStartY.current = e.touches[0].clientY
  }
  const handleTouchEnd = (e: React.TouchEvent) => {
    const dx = e.changedTouches[0].clientX - touchStartX.current
    const dy = e.changedTouches[0].clientY - touchStartY.current
    if (!allMatches || Math.abs(dx) < 48 || Math.abs(dx) < Math.abs(dy)) return
    if (dx < 0 && currentIdx < allMatches.length - 1) setCurrentIdx(i => i + 1)
    else if (dx > 0 && currentIdx > 0) setCurrentIdx(i => i - 1)
  }

  // ── Current match data (navigated or original) ─────────────────────────────
  const currentMatch = allMatches?.[currentIdx] ?? match
  const liveKey = `${normalize(currentMatch.homeTeam.name)}|${normalize(currentMatch.awayTeam.name)}`
  const currentLiveData = allLiveData?.[liveKey]
  const currentScorers = currentLiveData?.scorers ?? (currentMatch.id === match.id ? scorers : undefined)
  const currentRedCards = currentLiveData?.redCards ?? []
  const currentClock   = currentLiveData?.clock   ?? (currentMatch.id === match.id ? clock : undefined)
  const currentHomeStats    = allStatsMap?.[currentMatch.homeTeam.id] ?? (currentMatch.id === match.id ? homeStats : null)
  const currentAwayStats    = allStatsMap?.[currentMatch.awayTeam.id] ?? (currentMatch.id === match.id ? awayStats : null)
  const currentGroupMatches = currentMatch.group
    ? (allMatches?.filter(m => m.group === currentMatch.group) ?? (currentMatch.id === match.id ? groupMatches : undefined))
    : undefined
  const currentGroupStandings = currentMatch.group
    ? (allStandingsMap?.[currentMatch.group] ?? (currentMatch.id === match.id ? groupStandings : undefined))
    : undefined

  const isLive = currentMatch.status === 'live'
  const isFt = currentMatch.status === 'ft'
  const hasScore = isLive || isFt
  const { time, tzAbbr } = formatTime(currentMatch.kickoff, userTimezone)

  return (
    <>
      {/* Match row */}
      <div
        className="flex items-center px-4 py-2 border-b border-zinc-800/50 hover:bg-zinc-800/20 transition-colors cursor-pointer select-none"
        onClick={() => setOpen(true)}
      >
        <div className="w-[80px] flex-shrink-0 flex flex-col items-start justify-center">
          {isLive ? (
            <>
              <span className="text-[11px] font-bold tracking-widest text-red-500 uppercase">LIVE</span>
              {clock && <span className="text-[11px] font-semibold text-red-400">{clock}</span>}
            </>
          ) : isFt ? (
            <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wide">FINAL</span>
          ) : (
            <span className="text-[12px] font-medium text-zinc-300 leading-snug whitespace-nowrap">
              {time} <span className="text-[10px] text-zinc-500">{tzAbbr}</span>
            </span>
          )}
        </div>

        <div className="flex-1 flex items-center min-w-0">
          <div className="flex-1 flex items-center justify-end gap-1.5 min-w-0">
            <span className="text-[13px] font-semibold text-white truncate text-right">{match.homeTeam.name}</span>
            <span className="flex-shrink-0">
              <FlagImg teamId={match.homeTeam.id} fallback={match.homeTeam.flag} className="h-4" />
            </span>
          </div>
          <div className="w-12 flex-shrink-0 text-center">
            {hasScore ? (
              <span className={`text-[14px] font-bold tabular-nums ${isLive ? 'text-red-500' : 'text-white'}`}>
                {match.homeScore}–{match.awayScore}
              </span>
            ) : (
              <span className="text-[12px] font-medium text-zinc-400">vs</span>
            )}
          </div>
          <div className="flex-1 flex items-center gap-1.5 min-w-0">
            <span className="flex-shrink-0">
              <FlagImg teamId={match.awayTeam.id} fallback={match.awayTeam.flag} className="h-4" />
            </span>
            <span className="text-[13px] font-semibold text-white truncate">{match.awayTeam.name}</span>
          </div>
        </div>

      </div>

      {/* Live score bar — shown below the row when the match is in progress */}
      {isLive && hasScore && (
        <div className="flex items-center gap-2 px-4 py-1.5 bg-red-950/30 border-b border-red-500/20">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse flex-shrink-0" />
          {clock && <span className="text-[11px] font-bold text-red-400 tabular-nums">{clock}</span>}
          <span className="text-[12px] font-black text-red-300 tabular-nums">
            {match.homeScore} – {match.awayScore}
          </span>
          {scorers && scorers.length > 0 && (
            <span className="flex items-center gap-1 text-[10px] text-zinc-400 truncate">
              <span>⚽</span>
              {scorers.map((s, i) => (
                <span key={i}>{s.playerName} {s.minute}{i < scorers.length - 1 ? ',' : ''}</span>
              ))}
            </span>
          )}
        </div>
      )}

      {/* Slide-up sheet */}
      {open && (
        <>
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40" onClick={() => { setOpen(false); onCloseExternal?.() }} />

          {/* Jersey ad banner — full-width prominent, anchored just above the sheet */}
          {/* TODO: add &tag=YOUR-TRACKING-ID to links once Amazon Associates approved */}

          <div
            className="fixed bottom-0 left-0 right-0 z-[60] max-h-[88vh] flex flex-col rounded-t-3xl overflow-hidden animate-slide-up"
            style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            {/* Gradient header */}
            <div className="relative bg-gradient-to-b from-[#0a1628] to-[#13131a] px-5 pt-4 pb-5 flex-shrink-0">
              <div className="w-10 h-1 rounded-full bg-white/20 mx-auto mb-4" />
              <button
                onClick={() => { setOpen(false); onCloseExternal?.() }}
                className="absolute top-4 right-5 w-8 h-8 flex items-center justify-center rounded-full bg-white/10 text-white text-sm hover:bg-white/20 transition-colors"
              >✕</button>

              <div className="flex items-center gap-2 mb-2">
                {currentMatch.group && (
                  <span className="text-[11px] font-bold text-zinc-400 bg-white/5 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                    Group {currentMatch.group}
                  </span>
                )}
                {isLive && <span className="text-[11px] font-bold text-red-400 bg-red-500/10 px-2.5 py-0.5 rounded-full animate-pulse">● LIVE</span>}
                {isFt && <span className="text-[11px] font-semibold text-green-400 bg-green-500/10 px-2.5 py-0.5 rounded-full">FINAL</span>}
                {currentMatch.status === 'upcoming' && (
                  <span className="text-[11px] text-zinc-400 bg-zinc-800/60 px-2.5 py-0.5 rounded-full">{time} {tzAbbr}</span>
                )}
                {/* Navigation indicator */}
                {allMatches && allMatches.length > 1 && (
                  <span className="text-[10px] text-zinc-600 ml-auto mr-8 flex items-center gap-1">
                    <span className={currentIdx > 0 ? 'text-zinc-400' : 'text-zinc-700'}>‹</span>
                    <span>{currentIdx + 1} / {allMatches.length}</span>
                    <span className={currentIdx < allMatches.length - 1 ? 'text-zinc-400' : 'text-zinc-700'}>›</span>
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between mt-3 gap-4">
                <div className="flex-1 flex flex-col items-center gap-2">
                  <button
                    className="active:scale-90 transition-transform"
                    onClick={() => { setOpen(false); setTeamSheet(currentMatch.homeTeam) }}
                    title={`View ${currentMatch.homeTeam.name}`}
                  >
                    <FlagImg teamId={currentMatch.homeTeam.id} fallback={currentMatch.homeTeam.flag} className="h-10" />
                  </button>
                  <span className="text-[13px] font-semibold text-white text-center leading-tight">{currentMatch.homeTeam.name}</span>
                </div>
                <div className="flex flex-col items-center gap-1 min-w-[80px]">
                  {hasScore ? (
                    <>
                      <span className={`text-4xl font-black tabular-nums ${isLive ? 'text-red-400' : 'text-white'}`}>
                        {currentMatch.homeScore} – {currentMatch.awayScore}
                      </span>
                      {isLive && currentClock && (
                        <div className="flex items-center gap-1 mt-0.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                          <span className="text-[13px] font-bold text-red-400">{currentClock}</span>
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      <span className="text-2xl font-bold text-zinc-500">vs</span>
                      <span className="text-[10px] text-zinc-600 text-center leading-tight">{time}<br />{tzAbbr}</span>
                    </>
                  )}
                </div>
                <div className="flex-1 flex flex-col items-center gap-2">
                  <button
                    className="active:scale-90 transition-transform"
                    onClick={() => { setOpen(false); setTeamSheet(currentMatch.awayTeam) }}
                    title={`View ${currentMatch.awayTeam.name}`}
                  >
                    <FlagImg teamId={currentMatch.awayTeam.id} fallback={currentMatch.awayTeam.flag} className="h-10" />
                  </button>
                  <span className="text-[13px] font-semibold text-white text-center leading-tight">{currentMatch.awayTeam.name}</span>
                </div>
              </div>

              <div className="flex items-center justify-center gap-1.5 mt-4">
                <span className="text-sm">📍</span>
                <span className="text-[12px] text-zinc-400">{currentMatch.venue.name}, {currentMatch.venue.city}</span>
              </div>
              {/* Swipe hint — shown only when navigation is available */}
              {allMatches && allMatches.length > 1 && (
                <p className="text-[10px] text-zinc-700 text-center mt-2">Swipe left or right to browse matches</p>
              )}
            </div>

            {/* Scrollable body */}
            <div key={currentIdx} className="overflow-y-auto bg-[#0f0f18] px-4 pt-5 flex-1" style={{ paddingBottom: 'calc(5rem + env(safe-area-inset-bottom))' }}>

              {/* Goal scorers — two-column layout: home left (⚽ on left), away right (⚽ on right) */}
              {currentScorers && currentScorers.length > 0 && (
                <div className="mb-5">
                  <p className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest mb-3 text-center">Goals</p>
                  <div className="flex gap-3">
                    {/* Home scorers — ball on the LEFT */}
                    <div className="flex-1 space-y-1.5">
                      {currentScorers.filter(s => s.teamSide !== 'away').map((s, i) => (
                        <div key={i} className="flex items-center gap-1.5">
                          <span className="text-sm leading-none">⚽</span>
                          <span className="text-[12px] font-semibold text-white">{s.playerName}</span>
                          <span className="text-[11px] text-zinc-500">{s.minute}</span>
                          {s.type !== 'goal' && (
                            <span className="text-[9px] text-zinc-500 bg-zinc-800 px-1 rounded">{s.type === 'og' ? 'OG' : 'pen'}</span>
                          )}
                        </div>
                      ))}
                    </div>
                    {/* Away scorers — ball on the RIGHT */}
                    <div className="flex-1 space-y-1.5 flex flex-col items-end">
                      {currentScorers.filter(s => s.teamSide === 'away').map((s, i) => (
                        <div key={i} className="flex items-center gap-1.5 flex-row-reverse">
                          <span className="text-sm leading-none">⚽</span>
                          <span className="text-[12px] font-semibold text-white">{s.playerName}</span>
                          <span className="text-[11px] text-zinc-500">{s.minute}</span>
                          {s.type !== 'goal' && (
                            <span className="text-[9px] text-zinc-500 bg-zinc-800 px-1 rounded">{s.type === 'og' ? 'OG' : 'pen'}</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="mt-3 h-px bg-zinc-800" />
                </div>
              )}

              {/* Red cards — two-column: home left 🟥, away right 🟥 */}
              {currentRedCards.length > 0 && (
                <div className="mb-5">
                  <p className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest mb-3 text-center">Red Cards</p>
                  <div className="flex gap-3">
                    <div className="flex-1 space-y-1.5">
                      {currentRedCards.filter(c => c.teamSide === 'home').map((c, i) => (
                        <div key={i} className="flex items-center gap-1.5">
                          <span className="text-sm leading-none">🟥</span>
                          <span className="text-[12px] font-semibold text-white">{c.playerName}</span>
                          <span className="text-[11px] text-zinc-500">{c.minute}</span>
                          {c.cardType === 'yellow-red' && (
                            <span className="text-[9px] text-zinc-500 bg-zinc-800 px-1 rounded">2Y</span>
                          )}
                        </div>
                      ))}
                    </div>
                    <div className="flex-1 space-y-1.5 flex flex-col items-end">
                      {currentRedCards.filter(c => c.teamSide === 'away').map((c, i) => (
                        <div key={i} className="flex items-center gap-1.5 flex-row-reverse">
                          <span className="text-sm leading-none">🟥</span>
                          <span className="text-[12px] font-semibold text-white">{c.playerName}</span>
                          <span className="text-[11px] text-zinc-500">{c.minute}</span>
                          {c.cardType === 'yellow-red' && (
                            <span className="text-[9px] text-zinc-500 bg-zinc-800 px-1 rounded">2Y</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="mt-3 h-px bg-zinc-800" />
                </div>
              )}
              {/* Team stats */}
              <p className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest mb-4 text-center">Team Stats</p>
              <div className="flex gap-4 items-start">
                <TeamPanel team={currentMatch.homeTeam} stats={currentHomeStats ?? null} side="home" />
                <div className="w-px bg-zinc-800 self-stretch" />
                <TeamPanel team={currentMatch.awayTeam} stats={currentAwayStats ?? null} side="away" />
              </div>

              {/* Group standings */}
              {currentMatch.group && currentGroupStandings && currentGroupStandings.length > 0 && (
                <GroupTable
                  groupId={currentMatch.group}
                  standings={currentGroupStandings}
                  highlightIds={[currentMatch.homeTeam.id, currentMatch.awayTeam.id]}
                />
              )}
            </div>

            {/* Sticky ad footer — team-colored, whole card is tappable */}
            {/* TODO: add &tag=YOUR-TRACKING-ID once Amazon Associates approved */}
          </div>
        </>
      )}

      {/* Team sheet — opens when a flag is tapped */}
      {teamSheet && (
        <TeamSheet team={teamSheet} onClose={() => { setTeamSheet(null); setOpen(true) }} standings={currentGroupStandings} groupMatches={currentGroupMatches} />
      )}
    </>
  )
}

