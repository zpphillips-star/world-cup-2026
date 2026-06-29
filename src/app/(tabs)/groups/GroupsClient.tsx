'use client'

import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import type { Standing, Group, Team, Match, TeamStats } from '@/lib/types'
import type { ScoreUpdate } from '@/app/api/live-scores/route'
import { FlagImg } from '@/components/FlagImg'
import { TeamSheet } from '@/components/TeamSheet'
import MatchCard from '@/components/MatchCard'
import { Backdrop } from '@/components/Backdrop'
import { mergeStandings } from '@/lib/standingsUtils'
import { applyLiveScores, getMatchScoreKey } from '@/lib/liveScores'
import { useEffectiveStandings } from '@/lib/useEffectiveStandings'
import { getBracket } from '@/lib/mockProvider'

// -- Standings table --------------------------------------------------------

function StandingsTable({ standings, advancedIds }: { standings: Standing[], advancedIds: Set<string> }) {
  return (
    <table className="w-full text-xs">
      <thead>
        <tr className="text-gray-500 border-b border-gray-700 text-[11px] uppercase tracking-wider">
          <th className="text-left py-1.5 w-5">#</th>
          <th className="text-left py-1.5">Team</th>
          <th className="text-center py-1.5 w-7">P</th>
          <th className="text-center py-1.5 w-7">W</th>
          <th className="text-center py-1.5 w-7">D</th>
          <th className="text-center py-1.5 w-7">L</th>
          <th className="text-center py-1.5 w-8">GD</th>
          <th className="text-center py-1.5 w-8 text-[#00d4ff] font-bold">Pts</th>
        </tr>
      </thead>
      <tbody>
        {standings.map((s, idx) => {
          const advances = advancedIds.has(s.team.id)
          return (
            <tr key={s.team.id} className={`border-b border-gray-800/60 last:border-b-0 ${advances ? 'bg-green-950/20' : ''}`}>
              <td className="py-2 relative">
                {advances && <span className="absolute left-0 top-0 bottom-0 w-0.5 bg-green-500 rounded-r" />}
                <span className={`pl-1.5 ${advances ? 'text-green-400' : 'text-gray-500'}`}>{idx + 1}</span>
              </td>
              <td className="py-2">
                <div className="flex items-center gap-1.5">
                  <FlagImg teamId={s.team.id} fallback={s.team.flag} className="h-4" />
                  <span className={`font-medium truncate max-w-[80px] ${advances ? 'text-white' : 'text-gray-300'}`}>
                    {s.team.name}
                  </span>
                  {advances && (
                    <span className="ml-auto text-[8px] font-bold text-green-400 bg-green-950/80 border border-green-800/50 rounded px-1 leading-[14px] flex-shrink-0">
                      R32
                    </span>
                  )}
                </div>
              </td>
              <td className="text-center py-2 text-gray-300">{s.played}</td>
              <td className="text-center py-2 text-gray-300">{s.won}</td>
              <td className="text-center py-2 text-gray-300">{s.drawn}</td>
              <td className="text-center py-2 text-gray-300">{s.lost}</td>
              <td className="text-center py-2 text-gray-400">{s.goalDiff > 0 ? `+${s.goalDiff}` : s.goalDiff}</td>
              <td className="text-center py-2 font-bold text-[#00d4ff]">{s.points}</td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}

// -- Group button card ------------------------------------------------------

function GroupCard({
  groupId,
  standings,
  advancedIds,
  onOpen,
}: {
  groupId: string
  standings: Standing[]
  advancedIds: Set<string>
  onOpen: () => void
}) {
  return (
    <button
      onClick={onOpen}
      className="w-full text-left active:scale-[0.97] transition-transform"
    >
      <div
        className="rounded-2xl overflow-hidden relative"
        style={{
          background: 'linear-gradient(160deg, #1a1a24 0%, #111118 100%)',
          border: '1px solid rgba(255,255,255,0.06)',
          boxShadow: '0 2px 12px rgba(0,0,0,0.6)',
        }}
      >
        {/* Watermark group letter */}
        <span
          className="absolute right-2 bottom-[-2px] font-black text-[36px] leading-none select-none pointer-events-none"
          style={{ color: 'rgba(255,255,255,0.04)' }}
        >
          {groupId}
        </span>

        {/* Header */}
        <div className="px-2.5 pt-1.5 pb-1 flex items-baseline justify-between">
          <div className="flex items-baseline gap-1">
            <span className="text-[7px] font-semibold uppercase tracking-[0.2em] text-zinc-500">Group</span>
            <span className="text-[13px] font-bold text-white leading-none ml-0.5">{groupId}</span>
          </div>
          <span className="text-zinc-700 text-xs">›</span>
        </div>

        {/* Divider */}
        <div className="mx-2.5 h-px bg-white/[0.04] mb-1" />

        {/* Teams */}
        <div className="px-2.5 pb-1.5 space-y-0.5">
          {standings.map((s) => {
            const advanced = advancedIds.has(s.team.id)
            return (
              <div key={s.team.id} className="flex items-center gap-1.5">
                <FlagImg teamId={s.team.id} fallback={s.team.flag} className="h-3 flex-shrink-0 rounded-[1px]" />
                <span className={`text-[10.5px] font-medium leading-none truncate ${advanced ? 'text-green-200' : 'text-zinc-400'}`}>
                  {s.team.name}
                </span>
                {advanced && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-green-500 flex-shrink-0" />
                )}
              </div>
            )
          })}
        </div>
      </div>
    </button>
  )
}

// -- Group bottom sheet -----------------------------------------------------

function GroupSheet({
  groupId,
  standings,
  group,
  advancedIds,
  onClose,
  onTeamOpen,
  onMatchOpen,
  allGroupIds,
  onNavigate,
}: {
  groupId: string
  standings: Standing[]
  group: Group
  advancedIds: Set<string>
  onClose: () => void
  onTeamOpen: (team: Team) => void
  onMatchOpen: (match: Match) => void
  allGroupIds?: string[]
  onNavigate?: (groupId: string) => void
}) {
  const [userTimezone, setUserTimezone] = useState('UTC')
  const [closing, setClosing] = useState(false)
  const closingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  useEffect(() => {
    setUserTimezone(Intl.DateTimeFormat().resolvedOptions().timeZone)
    return () => { if (closingTimerRef.current) clearTimeout(closingTimerRef.current) }
  }, [])

  const handleClose = () => {
    setClosing(true)
    closingTimerRef.current = setTimeout(onClose, 260)
  }

  // ΓöÇΓöÇ Swipe between groups ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
  const touchStartX = useRef(0)
  const touchStartY = useRef(0)
  const currentGroupIdx = allGroupIds?.indexOf(groupId) ?? -1

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
    touchStartY.current = e.touches[0].clientY
  }
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!allGroupIds || !onNavigate || currentGroupIdx === -1) return
    const dx = e.changedTouches[0].clientX - touchStartX.current
    const dy = e.changedTouches[0].clientY - touchStartY.current
    if (Math.abs(dx) < 48 || Math.abs(dx) < Math.abs(dy)) return
    if (dx < 0 && currentGroupIdx < allGroupIds.length - 1) onNavigate(allGroupIds[currentGroupIdx + 1])
    else if (dx > 0 && currentGroupIdx > 0) onNavigate(allGroupIds[currentGroupIdx - 1])
  }

  const completedMatches = group.matches.filter(m => m.status === 'ft')
  const upcomingMatches = group.matches.filter(m => m.status === 'upcoming' || m.status === 'live')

  return (
    <>
      <Backdrop onDismiss={handleClose} zIndex="z-[30]" bg="bg-black/60" />

      <div
        className={`fixed bottom-0 left-0 right-0 z-[45] max-h-[86vh] flex flex-col rounded-t-2xl overflow-hidden ${closing ? 'animate-slide-down' : 'animate-slide-up'}`}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative px-5 pt-4 pb-4 flex-shrink-0 bg-[#13131a] border-b border-white/10">
          <div className="w-9 h-1 rounded-full bg-white/20 mx-auto mb-3" />
          <button
            onClick={handleClose}
            className="absolute top-4 right-5 w-8 h-8 flex items-center justify-center rounded-full bg-white/10 text-white text-sm hover:bg-white/20 transition-colors"
          >
            ✓
          </button>

          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-white">Group {groupId}</h2>
          </div>

          {/* Large flags — tappable */}
          <div className="flex gap-4 mt-3">
            {standings.map((s) => (
              <button
                key={s.team.id}
                className="flex flex-col items-center gap-0.5 active:scale-90 transition-transform"
                onClick={() => onTeamOpen(s.team)}
              >
                <FlagImg teamId={s.team.id} fallback={s.team.flag} className="h-8" />
                <span className={`text-[10px] font-medium ${advancedIds.has(s.team.id) ? 'text-green-400' : 'text-gray-400'}`}>
                  {s.team.name.length > 6 ? s.team.name.slice(0, 6) + '…' : s.team.name}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Scrollable body */}
        <div
          className="overflow-y-auto bg-[#13131a] flex-1 px-4 py-3 space-y-5"
          style={{ paddingBottom: 'calc(5.5rem + env(safe-area-inset-bottom))' }}
        >
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-sm bg-green-500" />
              <span className="text-[10px] text-green-400 font-semibold uppercase tracking-wider">
                {standings.filter(s => advancedIds.has(s.team.id)).length || 2} teams advance to Round of 32
              </span>
            </div>
            <StandingsTable standings={standings} advancedIds={advancedIds} />
          </div>

          {completedMatches.length > 0 && (
            <div>
              <p className="text-[11px] text-gray-500 font-semibold uppercase tracking-wider mb-2">Results</p>
              <div className="space-y-2">
                {completedMatches.map(m => (
                  <button
                    key={m.id}
                    className="w-full flex items-center justify-between text-xs bg-[#0a0a0f] rounded-xl px-3 py-2.5 border border-gray-800/60 active:bg-white/5 transition-colors"
                    onClick={() => onMatchOpen(m)}
                  >
                    <span className="flex items-center gap-1.5 flex-1">
                      <FlagImg teamId={m.homeTeam.id} fallback={m.homeTeam.flag} className="h-5" />
                      <span className="text-gray-200 font-medium">{m.homeTeam.name}</span>
                    </span>
                    <span className="font-bold text-white tabular-nums px-3 text-sm">
                      {m.homeScore} – {m.awayScore}
                    </span>
                    <span className="flex items-center gap-1.5 flex-1 justify-end">
                      <span className="text-gray-200 font-medium text-right">{m.awayTeam.name}</span>
                      <FlagImg teamId={m.awayTeam.id} fallback={m.awayTeam.flag} className="h-5" />
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {upcomingMatches.length > 0 && (
            <div>
              <p className="text-[11px] text-gray-500 font-semibold uppercase tracking-wider mb-2">Upcoming</p>
              <div className="space-y-2">
                {upcomingMatches.map(m => {
                  const time = new Date(m.kickoff).toLocaleString('en-US', {
                    month: 'short', day: 'numeric',
                    hour: 'numeric', minute: '2-digit', timeZoneName: 'short',
                    timeZone: userTimezone,
                  })
                  return (
                    <button
                      key={m.id}
                      className="w-full flex items-center justify-between text-xs bg-[#0a0a0f] rounded-xl px-3 py-2.5 border border-gray-800/60 active:bg-white/5 transition-colors"
                      onClick={() => onMatchOpen(m)}
                    >
                      <span className="flex items-center gap-1.5 flex-1">
                        <FlagImg teamId={m.homeTeam.id} fallback={m.homeTeam.flag} className="h-5" />
                        <span className="text-gray-300">{m.homeTeam.name}</span>
                      </span>
                      <div className="flex flex-col items-center px-2">
                        <span className="text-gray-500 font-medium">vs</span>
                        <span className="text-[10px] text-gray-600 text-center">{time}</span>
                      </div>
                      <span className="flex items-center gap-1.5 flex-1 justify-end">
                        <span className="text-gray-300 text-right">{m.awayTeam.name}</span>
                        <FlagImg teamId={m.awayTeam.id} fallback={m.awayTeam.flag} className="h-5" />
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

// -- Main export ------------------------------------------------------------

interface GroupsClientProps {
  standings: Record<string, Standing[]>
  groups: Group[]
  statsMap?: Record<string, TeamStats | null>
}

export default function GroupsClient({ standings: baseStandings, groups, statsMap = {} }: GroupsClientProps) {
  const [activeGroup, setActiveGroup] = useState<string | null>(null)
  const [teamSheet, setTeamSheet] = useState<Team | null>(null)
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null)
  const [standings, setStandings] = useState<Record<string, Standing[]>>(baseStandings)
  const [liveScores, setLiveScores] = useState<Record<string, ScoreUpdate>>({})
  const [liveAliases, setLiveAliases] = useState<Record<string, string>>({})
  const [userTimezone, setUserTimezone] = useState('UTC')
  const liveScoresRef = useRef(liveScores)
  useEffect(() => { liveScoresRef.current = liveScores }, [liveScores])
  useEffect(() => { setUserTimezone(Intl.DateTimeFormat().resolvedOptions().timeZone) }, [])
  // Track scores interval via ref so cleanup always captures the latest ID (fix interval leak)
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

  // Fetch live standings on mount and refresh every 60s
  // Also fetch live scores for match status updates
  useEffect(() => {
    async function fetchStandings() {
      try {
        const res = await fetch('/api/standings')
        if (!res.ok) return
        const data = await res.json()
        setStandings(mergeStandings(baseStandings, data.standings ?? {}))
      } catch { /* fail silently */ }
    }
    fetchStandings()
    fetchScores()
    const standingsInterval = setInterval(fetchStandings, 60_000)
    scoresIntervalRef.current = setInterval(fetchScores, 30_000)
    // Adaptive polling: 2s when live, 30s otherwise
    const adaptivePoller = setInterval(() => {
      const hasLive = Object.values(liveScoresRef.current).some(s => s.status === 'live')
      const rate = hasLive ? 2_000 : 30_000
      if (scoresIntervalRef.current) clearInterval(scoresIntervalRef.current)
      scoresIntervalRef.current = setInterval(fetchScores, rate)
    }, 5_000)
    return () => {
      clearInterval(standingsInterval)
      if (scoresIntervalRef.current) clearInterval(scoresIntervalRef.current)
      clearInterval(adaptivePoller)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Compute standings from our match data — instant, no ESPN lag
  // For each group, pull all matches from groups data and apply live scores
  const allGroupMatches = useMemo(
    () => groups.flatMap(g => applyLiveScores(g.matches, liveScores, liveAliases)),
    [groups, liveScores, liveAliases]
  )
  const { effectiveStandingsMap: effectiveStandings } = useEffectiveStandings(allGroupMatches, baseStandings, standings)

  // Derive which team IDs advanced to R32 — dynamically from the bracket data
  const advancedTeamIds = useMemo(() => {
    const bracket = getBracket(allGroupMatches)
    const r32Round = bracket.find(r => r.name === 'Round of 32')
    const ids = new Set<string>()
    if (r32Round) {
      for (const slot of r32Round.matches) {
        if (typeof slot.home !== 'string') ids.add(slot.home.id)
        if (typeof slot.away !== 'string') ids.add(slot.away.id)
      }
    }
    return ids
  }, [allGroupMatches])

  const activeStandings = activeGroup ? effectiveStandings[activeGroup] : null
  const activeGroupData = activeGroup ? groups.find(g => g.id === activeGroup) : null
  // Apply live scores to the active group's matches so completed games show results
  const activeGroupWithLiveScores = activeGroupData
    ? { ...activeGroupData, matches: applyLiveScores(activeGroupData.matches, liveScores, liveAliases) }
    : null

  return (
    <div className="h-full overflow-y-auto bg-[#0a0a0f]">
      <div className="px-4 pt-2 pb-1">
        <h1 className="text-[16px] font-bold text-white leading-tight tracking-tight">Groups</h1>
        <p className="text-[10px] text-zinc-500 leading-none">FIFA World Cup 2026 · 12 Groups</p>
      </div>
      <div
        className="grid grid-cols-2 gap-2.5 px-3"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        {Object.entries(effectiveStandings).map(([groupId, groupStandings]) => (
          <GroupCard
            key={groupId}
            groupId={groupId}
            standings={groupStandings}
            advancedIds={advancedTeamIds}
            onOpen={() => setActiveGroup(groupId)}
          />
        ))}
      </div>

      {/* Group sheet — stays visible as L1 backdrop when team/match sheet is open */}
      {activeGroup && activeStandings && activeGroupWithLiveScores && (
        <GroupSheet
          groupId={activeGroup}
          standings={activeStandings}
          group={activeGroupWithLiveScores}
          advancedIds={advancedTeamIds}
          onClose={() => setActiveGroup(null)}
          onTeamOpen={(team) => setTeamSheet(team)}
          onMatchOpen={(match) => setSelectedMatch(match)}
          allGroupIds={Object.keys(effectiveStandings).sort()}
          onNavigate={(gId) => setActiveGroup(gId)}
        />
      )}

      {/* Match detail popup — opened from a match row tap */}
      {selectedMatch && (
        <MatchCard
          match={selectedMatch}
          userTimezone={userTimezone}
          homeStats={statsMap[selectedMatch.homeTeam.id]}
          awayStats={statsMap[selectedMatch.awayTeam.id]}
          groupStandings={selectedMatch.group ? effectiveStandings[selectedMatch.group] : undefined}
          groupMatches={selectedMatch.group ? allGroupMatches.filter(m => m.group === selectedMatch.group) : undefined}
          clock={(liveScores[getMatchScoreKey(selectedMatch)] ?? liveScores[liveAliases[getMatchScoreKey(selectedMatch)]])?.clock}
          scorers={(liveScores[getMatchScoreKey(selectedMatch)] ?? liveScores[liveAliases[getMatchScoreKey(selectedMatch)]])?.scorers}
          defaultOpen
          onCloseExternal={() => setSelectedMatch(null)}
          allMatches={allGroupMatches}
          allStatsMap={statsMap}
          allStandingsMap={effectiveStandings}
          allLiveData={liveScores}
          allLiveAliases={liveAliases}
        />
      )}

      {/* Team sheet — closes back to group sheet */}
      {teamSheet && (
        <TeamSheet
          team={teamSheet}
          onClose={() => setTeamSheet(null)}
          standings={teamSheet.group ? effectiveStandings[teamSheet.group] : undefined}
          groupMatches={teamSheet.group ? allGroupMatches.filter(m => m.group === teamSheet.group) : undefined}
          allStandingsMap={effectiveStandings}
          allMatchesFull={allGroupMatches}
        />
      )}
    </div>
  )
}