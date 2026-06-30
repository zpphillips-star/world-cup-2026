'use client'

import { useState, useRef, useEffect } from 'react'
import type { Match, TeamStats, Standing, Team } from '@/lib/types'
import { TeamSheet } from '@/components/TeamSheet'
import { Backdrop } from '@/components/Backdrop'
import { getTeamColor } from '@/lib/teamColors'
import { getMatchScoreKey } from '@/lib/liveScores'
import type { ScoreUpdate } from '@/app/api/live-scores/route'

function formatTime(kickoff: string, timezone: string): { time: string; tzAbbr: string; date: string } {
  try {
    const date = new Date(kickoff)
    const time = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', timeZone: timezone })
    const tzAbbr = new Intl.DateTimeFormat('en-US', { timeZone: timezone, timeZoneName: 'short' })
      .formatToParts(date).find(p => p.type === 'timeZoneName')?.value ?? ''
    const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: timezone })
    return { time, tzAbbr, date: dateStr }
  } catch {
    return { time: '--:--', tzAbbr: '', date: '' }
  }
}

import { FlagImg } from '@/components/FlagImg'

function StatBox({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex flex-col items-center gap-1 bg-[#0d0d15] rounded-xl px-2 py-2.5 min-w-0">
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
          <div className={`grid grid-cols-5 gap-1.5 w-full`}>
            <StatBox label="W" value={stats.wcWins} />
            <StatBox label="D" value={stats.wcDraws} />
            <StatBox label="L" value={stats.wcLosses} />
            <StatBox label="GF" value={stats.wcGoalsFor} />
            <StatBox label="GA" value={stats.wcGoalsAgainst} />
          </div>
          <div className={`flex items-center gap-1 ${side === 'away' ? 'flex-row-reverse' : ''}`}>
            <span className="text-sm">🏆</span>
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
          style={{ gridTemplateColumns: '1fr 20px 20px 20px 20px 24px 24px 28px' }}>
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
              className={`grid items-center px-3 py-2.5 border-t border-zinc-800/60 text-[11px] transition-colors
                ${isHighlighted
                  ? 'bg-[#00d4ff]/8 border-l-2 border-l-[#00d4ff]'
                  : isTop2
                    ? 'bg-zinc-800/20'
                    : 'bg-[#0f0f18]'
                }`}
              style={{ gridTemplateColumns: '1fr 20px 20px 20px 20px 24px 24px 28px' }}
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-[11px] text-zinc-600 w-3 flex-shrink-0">{i + 1}</span>
                <span className="text-base leading-none flex-shrink-0"><FlagImg teamId={s.team.id} fallback={s.team.flag} className="h-4" /></span>
                <span className={`truncate font-medium ${isHighlighted ? 'text-white' : isTop2 ? 'text-zinc-200' : 'text-zinc-400'}`}>
                  {s.team.name}
                </span>

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
      <p className="text-[10px] text-zinc-600 mt-2 text-center">Top 2 advance from each group</p>
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
  noRow = false,
  // swipe navigation
  allMatches,
  allStatsMap,
  allStandingsMap,
  allLiveData,
  allLiveAliases,
  contextMatches,
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
  noRow?: boolean
  allMatches?: Match[]
  allStatsMap?: Record<string, TeamStats | null>
  allStandingsMap?: Record<string, Standing[]>
  allLiveData?: Record<string, ScoreUpdate>
  allLiveAliases?: Record<string, string>
  contextMatches?: Match[]
}){
  const [open, setOpen] = useState(defaultOpen)
  const [closing, setClosing] = useState(false)
  const [teamSheet, setTeamSheet] = useState<Team | null>(null)
  const closingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleClose = () => {
    if (closing) return
    setClosing(true)
    closingTimerRef.current = setTimeout(() => {
      setOpen(false)
      setClosing(false)
      onCloseExternal?.()
    }, 260)
  }

  useEffect(() => {
    return () => { if (closingTimerRef.current) clearTimeout(closingTimerRef.current) }
  }, [])

  // ΓöÇΓöÇ Swipe navigation ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
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

  // ΓöÇΓöÇ Current match data (navigated or original) ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
  const currentMatch = allMatches?.[currentIdx] ?? match
  const liveKey = getMatchScoreKey(currentMatch)
  const currentLiveData = allLiveData?.[liveKey] ?? (allLiveAliases ? allLiveData?.[allLiveAliases[liveKey]] : undefined)
  const currentScorers = currentLiveData?.scorers ?? (currentMatch.id === match.id ? scorers : undefined)
  const currentRedCards = currentLiveData?.redCards ?? []
  const currentClock   = currentLiveData?.clock   ?? (currentMatch.id === match.id ? clock : undefined)
  const currentHomeStats    = allStatsMap?.[currentMatch.homeTeam.id] ?? (currentMatch.id === match.id ? homeStats : null)
  const currentAwayStats    = allStatsMap?.[currentMatch.awayTeam.id] ?? (currentMatch.id === match.id ? awayStats : null)
  const currentGroupMatches = currentMatch.group
    ? (currentMatch.id === match.id && groupMatches
       ? groupMatches
       : allMatches?.filter(m => m.group === currentMatch.group))
    : undefined
  const currentGroupStandings = currentMatch.group
    ? (allStandingsMap?.[currentMatch.group] ?? (currentMatch.id === match.id ? groupStandings : undefined))
    : undefined

  const isLive = currentMatch.status === 'live'
  const isFt = currentMatch.status === 'ft'
  const hasScore = isLive || isFt
  const { time, tzAbbr, date } = formatTime(currentMatch.kickoff, userTimezone)

  return (
    <>
      {/* Match row — hidden when used as sheet-only (e.g. bracket tap) */}
      {!noRow && (
        <div
          className="flex items-center px-4 py-2 border-b border-zinc-800/50 hover:bg-zinc-800/20 transition-colors cursor-pointer select-none"
          onClick={() => setOpen(true)}
        >
          <div className="w-[80px] flex-shrink-0 flex flex-col items-start justify-center">
            {isLive ? (
              <>
                <span className="text-[11px] font-bold tracking-widest text-red-500 uppercase animate-pulse">LIVE</span>
                {clock && <span className="text-[11px] font-semibold text-red-400">{clock}</span>}
              </>
            ) : isFt ? (
              <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wide">
                {currentMatch.penaltyWinner ? 'FINAL (P)' : 'FINAL'}
              </span>
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
                <div className="flex flex-col items-center">
                  <span className={`text-[14px] font-bold tabular-nums ${isLive ? 'text-red-500' : 'text-white'}`}>
                    {match.homeScore}–{match.awayScore}
                  </span>
                  {match.penaltyWinner && (
                    <span className="text-[9px] text-zinc-500 font-medium">PENS</span>
                  )}
                </div>
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
      )}

      {/* Slide-up sheet */}
      {open && (
        <>
          <Backdrop onDismiss={handleClose} zIndex="z-[65]" bg="bg-black/70" />

          {/* Jersey ad banner — full-width prominent, anchored just above the sheet */}
          {/* TODO: add &tag=YOUR-TRACKING-ID to links once Amazon Associates approved */}

          <div
            className={`fixed bottom-0 left-0 right-0 z-[70] max-h-[88vh] flex flex-col rounded-t-3xl overflow-hidden ${closing ? 'animate-slide-down' : 'animate-slide-up'}`}
            style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            onClick={e => e.stopPropagation()}
          >
            {/* Gradient header */}
            <div className="relative bg-gradient-to-b from-[#0a1628] to-[#13131a] px-5 pt-4 pb-5 flex-shrink-0">
              <div className="w-10 h-1 rounded-full bg-white/20 mx-auto mb-4" />
              <button
                onClick={handleClose}
                className="absolute top-4 right-5 w-8 h-8 flex items-center justify-center rounded-full bg-white/10 text-white text-sm hover:bg-white/20 transition-colors"
              >✕</button>

              <div className="flex items-center gap-2 mb-2">
                {currentMatch.group && (
                  <span className="text-[11px] font-bold text-zinc-400 bg-white/5 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                    Group {currentMatch.group}
                  </span>
                )}
                {isLive && <span className="text-[11px] font-bold text-red-400 bg-red-500/10 px-2.5 py-0.5 rounded-full animate-pulse">● LIVE</span>}
                {isFt && <span className="text-[11px] font-semibold text-green-400 bg-green-500/10 px-2.5 py-0.5 rounded-full">{currentMatch.penaltyWinner ? 'FINAL (P)' : 'FINAL'}</span>}
                {currentMatch.status === 'upcoming' && (
                  <span className="text-[11px] text-zinc-400 bg-zinc-800/60 px-2.5 py-0.5 rounded-full">{date} · {time} {tzAbbr}</span>
                )}

              </div>

              <div className="flex items-center justify-between mt-3 gap-4">
                <div className="flex-1 flex flex-col items-center gap-2">
                  <button
                    className="active:scale-90 transition-transform"
                    onClick={() => setTeamSheet(currentMatch.homeTeam)}
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
                      {currentMatch.penaltyWinner && currentMatch.homePenaltyScore != null && currentMatch.awayPenaltyScore != null && (
                        <span className="text-[12px] font-semibold text-zinc-400 mt-0.5">
                          Pens: {currentMatch.homePenaltyScore} – {currentMatch.awayPenaltyScore}
                        </span>
                      )}
                      {isLive && currentClock && (
                        <div className="flex items-center gap-1 mt-0.5">
                          <span className="text-[13px] font-bold text-red-500 animate-pulse">LIVE</span>
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
                    onClick={() => setTeamSheet(currentMatch.awayTeam)}
                    title={`View ${currentMatch.awayTeam.name}`}
                  >
                    <FlagImg teamId={currentMatch.awayTeam.id} fallback={currentMatch.awayTeam.flag} className="h-10" />
                  </button>
                  <span className="text-[13px] font-semibold text-white text-center leading-tight">{currentMatch.awayTeam.name}</span>
                </div>
              </div>

              {currentMatch.venue?.name && (
                <div className="flex items-center justify-center gap-1.5 mt-4">
                  <span className="text-sm">📍</span>
                  <span className="text-[11px] text-zinc-500 text-center">{currentMatch.venue.name}, {currentMatch.venue.city}</span>
                </div>
              )}
              {/* Swipe hint — shown only when navigation is available */}
              {allMatches && allMatches.length > 1 && (
                <p className="text-[10px] text-zinc-700 text-center mt-2">Swipe left or right to browse matches</p>
              )}
            </div>

            {/* Scrollable body */}
            <div key={currentIdx} className="overflow-y-auto bg-[#0f0f18] px-4 pt-5 flex-1" style={{ paddingBottom: 'calc(5rem + env(safe-area-inset-bottom))' }}>

              {/* Goal scorers */}
              {currentScorers && currentScorers.length > 0 && (
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex-1 h-px bg-zinc-800" />
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Goals</span>
                    <div className="flex-1 h-px bg-zinc-800" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    {[...currentScorers].sort((a, b) => parseInt(a.minute) - parseInt(b.minute)).map((s, i) => (
                      <div key={i} className="grid items-center w-full" style={{ gridTemplateColumns: '1fr 40px 1fr', columnGap: '8px' }}>
                        <span className="text-[12px] text-white font-semibold text-right leading-none">
                          {s.teamSide === 'home' && <span>{s.playerName}{s.type !== 'goal' ? ` (${s.type === 'og' ? 'OG' : 'P'})` : ''}</span>}
                        </span>
                        <span className="text-[11px] text-zinc-500 font-medium leading-none text-center">{s.minute}</span>
                        <span className="text-[12px] text-white font-semibold text-left leading-none">
                          {s.teamSide === 'away' && <span>{s.playerName}{s.type !== 'goal' ? ` (${s.type === 'og' ? 'OG' : 'P'})` : ''}</span>}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Red cards */}
              {currentRedCards.length > 0 && (
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex-1 h-px bg-red-500/30" />
                    <span className="text-[10px] font-bold text-red-400 uppercase tracking-widest">Red Cards</span>
                    <div className="flex-1 h-px bg-red-500/30" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    {[...currentRedCards].sort((a, b) => parseInt(a.minute) - parseInt(b.minute)).map((c, i) => (
                      <div key={i} className="grid items-center w-full" style={{ gridTemplateColumns: '1fr 40px 1fr', columnGap: '8px' }}>
                        <span className="text-[12px] text-white font-semibold text-right leading-none">
                          {c.teamSide === 'home' && <span>🟥 {c.playerName}{c.cardType === 'yellow-red' ? ' (2Y)' : ''}</span>}
                        </span>
                        <span className="text-[11px] text-zinc-500 font-medium leading-none text-center">{c.minute}</span>
                        <span className="text-[12px] text-white font-semibold text-left leading-none">
                          {c.teamSide === 'away' && <span>{c.playerName}{c.cardType === 'yellow-red' ? ' (2Y)' : ''} 🟥</span>}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {/* Team stats */}
              <div className="mt-6 mb-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex-1 h-px bg-zinc-800" />
                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Team Stats</span>
                  <div className="flex-1 h-px bg-zinc-800" />
                </div>
                <div className="flex gap-4 items-start">
                  <TeamPanel team={currentMatch.homeTeam} stats={currentHomeStats ?? null} side="home" />
                  <div className="w-px bg-zinc-800 self-stretch" />
                  <TeamPanel team={currentMatch.awayTeam} stats={currentAwayStats ?? null} side="away" />
                </div>
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
          </div>
        </>
      )}

      {/* Team sheet — opens as L3 on top of this sheet; closing it reveals MatchCard */}
      {teamSheet && (
        <TeamSheet team={teamSheet} onClose={() => setTeamSheet(null)} layer={3} standings={currentGroupStandings} groupMatches={currentGroupMatches} allStandingsMap={allStandingsMap} allMatchesFull={contextMatches} />
      )}
    </>
  )
}
