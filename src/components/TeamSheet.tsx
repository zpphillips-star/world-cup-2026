'use client'

import { useEffect } from 'react'
import { mockProvider } from '@/lib/mockProvider'
import { FlagImg } from '@/components/FlagImg'
import { getTeamColor } from '@/lib/teamColors'
import type { Team } from '@/lib/types'

interface Props {
  team: Team
  onClose: () => void
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

export function TeamSheet({ team, onClose }: Props) {
  const allMatches = mockProvider.getMatches()
  const teamMatches = allMatches.filter(m =>
    m.group && (m.homeTeam.id === team.id || m.awayTeam.id === team.id)
  )
  const standings = team.group ? mockProvider.getStandings()[team.group] ?? [] : []
  const myStanding = standings.find(s => s.team.id === team.id)
  const groupPos = standings.findIndex(s => s.team.id === team.id) + 1
  const stats = mockProvider.getTeamStats(team.id)

  // Close on Escape
  useEffect(() => {
    const fn = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', fn)
    return () => window.removeEventListener('keydown', fn)
  }, [onClose])

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40"
        onClick={onClose}
      />

      {/* Jersey ad — full-width prominent banner above the sheet */}
      {/* Jersey ad — removed from fixed position, now inside sheet as sticky footer */}

      {/* Sheet */}
      <div
        className="fixed bottom-0 left-0 right-0 z-[60] max-h-[88vh] flex flex-col rounded-t-3xl overflow-hidden animate-slide-up bg-[#0f0f18]"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        {/* Header */}
        <div className="relative bg-gradient-to-b from-[#0a1628] to-[#0f0f18] px-5 pt-4 pb-5 flex-shrink-0">
          <div className="w-10 h-1 rounded-full bg-white/20 mx-auto mb-4" />
          <button
            onClick={onClose}
            className="absolute top-4 right-5 w-8 h-8 flex items-center justify-center rounded-full bg-white/10 text-white text-sm"
          >✕</button>

          <div className="flex items-center gap-4 mt-1">
            <FlagImg teamId={team.id} fallback={team.flag} className="h-14" />
            <div>
              <h2 className="text-xl font-black text-white">{team.name}</h2>
              {team.group && (
                <span className="text-[11px] font-bold text-[#00d4ff] bg-[#00d4ff]/10 px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Group {team.group} · #{groupPos}
                </span>
              )}
            </div>
          </div>

          {/* Quick stat pills */}
          {stats && (
            <div className="flex gap-2 flex-wrap mt-3">
              <span className="text-[11px] font-bold bg-[#00d4ff]/10 text-[#00d4ff] px-2.5 py-1 rounded-full">#{stats.fifaRank} FIFA</span>
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

        {/* Sticky ad footer — team-colored, whole card is tappable */}
        {/* TODO: add &tag=YOUR-TRACKING-ID once Amazon Associates approved */}
        <a
          href={`https://www.amazon.com/s?k=${encodeURIComponent(team.name + ' soccer jersey 2026')}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-shrink-0 block mx-4 mb-4 rounded-2xl overflow-hidden active:opacity-75 transition-opacity"
          style={{
            background: `color-mix(in srgb, ${getTeamColor(team.id)} 18%, #1a1a24)`,
            border: `1px solid color-mix(in srgb, ${getTeamColor(team.id)} 40%, transparent)`,
          }}
          onClick={e => e.stopPropagation()}
        >
          <div className="flex items-center gap-3 px-4 py-3.5">
            <FlagImg teamId={team.id} fallback={team.flag} className="h-8 rounded-sm flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-bold text-white leading-tight">
                Buy their gear
              </p>
              <p className="text-[11px] text-zinc-400 leading-tight mt-0.5">
                Shop on Amazon
              </p>
            </div>
            <span className="text-[9px] font-semibold text-zinc-500 uppercase tracking-widest flex-shrink-0">Ad</span>
          </div>
        </a>

      </div>
    </>
  )
}
