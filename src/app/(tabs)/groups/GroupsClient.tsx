'use client'

import { useState } from 'react'
import type { Standing, Group, BracketRound, BracketSlot } from '@/lib/types'

// ── Standings table ────────────────────────────────────────────────────────

function StandingsTable({ standings }: { standings: Standing[] }) {
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
          {/* GF/GA/GD hidden on small screens */}
          <th className="hidden sm:table-cell text-center py-1.5 w-8">GF</th>
          <th className="hidden sm:table-cell text-center py-1.5 w-8">GA</th>
          <th className="text-center py-1.5 w-8">GD</th>
          <th className="text-center py-1.5 w-8 text-[#00d4ff] font-bold">Pts</th>
        </tr>
      </thead>
      <tbody>
        {standings.map((s, idx) => {
          const advances = idx < 2
          return (
            <tr
              key={s.team.id}
              className={`border-b border-gray-800/60 last:border-b-0 transition-colors
                ${advances ? 'bg-green-950/20' : ''}
              `}
            >
              {/* Advance indicator left-border via inset box-shadow trick */}
              <td className="py-2 relative">
                {advances && (
                  <span className="absolute left-0 top-0 bottom-0 w-0.5 bg-green-500 rounded-r" />
                )}
                <span className={`pl-1.5 ${advances ? 'text-green-400' : 'text-gray-500'}`}>
                  {idx + 1}
                </span>
              </td>
              <td className="py-2">
                <div className="flex items-center gap-1.5">
                  <span className="text-base leading-none">{s.team.flag}</span>
                  <span className={`truncate max-w-[90px] font-medium ${advances ? 'text-white' : 'text-gray-300'}`}>
                    {s.team.name}
                  </span>
                </div>
              </td>
              <td className="text-center py-2 text-gray-300">{s.played}</td>
              <td className="text-center py-2 text-gray-300">{s.won}</td>
              <td className="text-center py-2 text-gray-300">{s.drawn}</td>
              <td className="text-center py-2 text-gray-300">{s.lost}</td>
              <td className="hidden sm:table-cell text-center py-2 text-gray-400">{s.goalsFor}</td>
              <td className="hidden sm:table-cell text-center py-2 text-gray-400">{s.goalsAgainst}</td>
              <td className="text-center py-2 text-gray-400">
                {s.goalDiff > 0 ? `+${s.goalDiff}` : s.goalDiff}
              </td>
              <td className="text-center py-2 font-bold text-[#00d4ff]">{s.points}</td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}

// ── Group accordion ────────────────────────────────────────────────────────

const GROUP_COLORS: Record<string, string> = {
  A: '#ef4444', B: '#f97316', C: '#eab308', D: '#22c55e',
  E: '#14b8a6', F: '#3b82f6', G: '#8b5cf6', H: '#ec4899',
  I: '#f43f5e', J: '#06b6d4', K: '#84cc16', L: '#a855f7',
}

function GroupAccordion({ groupId, standings, group }: { groupId: string; standings: Standing[]; group: Group }) {
  const [open, setOpen] = useState(false)
  const completedMatches = group.matches.filter(m => m.status === 'ft')
  const accent = GROUP_COLORS[groupId] ?? '#00d4ff'

  return (
    <div
      className="mb-3 rounded-xl border border-gray-800 overflow-hidden"
      style={{ background: '#13131a' }}
    >
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-3">
          {/* Colored pill badge */}
          <span
            className="text-[10px] font-black tracking-widest px-2.5 py-1 rounded-full"
            style={{ background: `${accent}22`, color: accent, border: `1px solid ${accent}44` }}
          >
            GROUP {groupId}
          </span>
          {/* Top 2 team flags preview */}
          <div className="flex gap-0.5 text-base">
            {standings.slice(0, 2).map(s => (
              <span key={s.team.id}>{s.team.flag}</span>
            ))}
          </div>
        </div>
        <span className="text-gray-500 text-xs">{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div className="border-t border-gray-800">
          {/* Advance indicator legend */}
          <div className="px-4 pt-3 pb-1 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-sm bg-green-500" />
            <span className="text-[10px] text-green-400 font-medium">Top 2 advance</span>
          </div>
          <div className="px-4 pb-4">
            <StandingsTable standings={standings} />
          </div>

          {completedMatches.length > 0 && (
            <div className="px-4 pb-4 border-t border-gray-800/60 pt-3 space-y-2">
              <p className="text-[11px] text-gray-500 font-semibold uppercase tracking-wider">Results</p>
              {completedMatches.map(m => (
                <div key={m.id} className="flex items-center justify-between text-xs bg-[#0a0a0f] rounded-lg px-3 py-2">
                  <span className="flex items-center gap-1.5">
                    <span>{m.homeTeam.flag}</span>
                    <span className="text-gray-300">{m.homeTeam.name}</span>
                  </span>
                  <span className="font-bold text-white tabular-nums px-2">
                    {m.homeScore} – {m.awayScore}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="text-gray-300 text-right">{m.awayTeam.name}</span>
                    <span>{m.awayTeam.flag}</span>
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ── Bracket ────────────────────────────────────────────────────────────────

const SLOT_H = 72   // px per QF slot
const CARD_W = 168  // px per match card
const CONN_W = 24   // px connector width

function isTeamObj(x: string | { id: string; name: string; flag: string }): x is { id: string; name: string; flag: string } {
  return typeof x === 'object'
}

function BracketCard({ slot, isFinal = false }: { slot: BracketSlot; isFinal?: boolean }) {
  const isTbd = slot.status === 'tbd'
  const hasScore = slot.status === 'ft' || slot.status === 'live'

  const homeTeam = isTeamObj(slot.home) ? slot.home : null
  const awayTeam = isTeamObj(slot.away) ? slot.away : null
  const homeLabel = homeTeam ? homeTeam.name : (slot.home as string)
  const awayLabel = awayTeam ? awayTeam.name : (slot.away as string)

  return (
    <div
      className={`rounded-lg border text-[11px] overflow-hidden w-full
        ${isFinal
          ? 'border-yellow-500/50 shadow-lg shadow-yellow-900/30 bg-gradient-to-br from-yellow-950/30 to-[#13131a]'
          : isTbd
            ? 'border-dashed border-gray-700/40 bg-[#0d0d15]'
            : 'border-gray-700 bg-[#13131a]'
        }`}
    >
      {isFinal && (
        <div className="bg-yellow-500/10 px-2 py-0.5 text-center text-[10px] font-bold text-yellow-400 uppercase tracking-widest border-b border-yellow-500/20">
          ⭐ Final ⭐
        </div>
      )}
      {/* Home row */}
      <div className={`flex items-center gap-1.5 px-2.5 py-1.5 ${isTbd ? 'text-gray-600' : 'text-gray-200'}`}>
        {homeTeam && <span className="text-sm flex-shrink-0">{homeTeam.flag}</span>}
        <span className="flex-1 truncate">{homeLabel}</span>
        {hasScore && <span className="font-bold text-white ml-auto tabular-nums">{slot.homeScore ?? 0}</span>}
      </div>
      <div className="border-t border-gray-800/60" />
      {/* Away row */}
      <div className={`flex items-center gap-1.5 px-2.5 py-1.5 ${isTbd ? 'text-gray-600' : 'text-gray-200'}`}>
        {awayTeam && <span className="text-sm flex-shrink-0">{awayTeam.flag}</span>}
        <span className="flex-1 truncate">{awayLabel}</span>
        {hasScore && <span className="font-bold text-white ml-auto tabular-nums">{slot.awayScore ?? 0}</span>}
      </div>
    </div>
  )
}

/** Binary bracket connector: 'count' match slots on left → count/2 on right */
function BinaryConnector({ count, slotH }: { count: number; slotH: number }) {
  const pairs = Math.floor(count / 2)
  const pairH = slotH * 2

  return (
    <div style={{ width: CONN_W, flexShrink: 0 }}>
      {Array.from({ length: pairs }, (_, i) => (
        <div key={i} style={{ height: pairH, display: 'flex', flexDirection: 'column' }}>
          <div style={{ flex: 1, borderRight: '1px solid rgba(75,85,99,0.5)', borderBottom: '1px solid rgba(75,85,99,0.5)' }} />
          <div style={{ flex: 1, borderRight: '1px solid rgba(75,85,99,0.5)', borderTop: '1px solid rgba(75,85,99,0.5)' }} />
        </div>
      ))}
    </div>
  )
}

/** Column of bracket slots, each slot height = slotH */
function BracketColumn({
  title, slots, slotH, isFinal,
}: {
  title: string
  slots: BracketSlot[]
  slotH: number
  isFinal?: boolean
}) {
  return (
    <div style={{ flexShrink: 0, width: CARD_W }}>
      <div className="text-[10px] font-bold text-[#00d4ff] mb-2 text-center uppercase tracking-widest">
        {title}
      </div>
      {slots.map((slot) => (
        <div
          key={slot.id}
          style={{ height: slotH, display: 'flex', alignItems: 'center', padding: '4px 0' }}
        >
          <BracketCard slot={slot} isFinal={isFinal} />
        </div>
      ))}
    </div>
  )
}

/** Collapsible list for early rounds (R32, R16) */
function EarlyRoundList({ round }: { round: BracketRound }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="mb-3 rounded-xl border border-gray-800 overflow-hidden" style={{ background: '#13131a' }}>
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/5 transition-colors"
      >
        <span className="text-sm font-bold text-gray-200">{round.name}</span>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">{round.matches.length} matches</span>
          <span className="text-gray-500 text-xs">{open ? '▲' : '▼'}</span>
        </div>
      </button>
      {open && (
        <div className="border-t border-gray-800 px-4 py-3 space-y-2">
          {round.matches.map((slot) => (
            <div key={slot.id} className="bg-[#0a0a0f] rounded-lg px-3 py-2 text-xs text-gray-400 flex items-center gap-2">
              <span className="flex-1 truncate">
                {isTeamObj(slot.home) ? `${slot.home.flag} ${slot.home.name}` : slot.home}
              </span>
              <span className="text-gray-600 font-bold">vs</span>
              <span className="flex-1 text-right truncate">
                {isTeamObj(slot.away) ? `${slot.away.flag} ${slot.away.name}` : slot.away}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function BracketView({ bracket }: { bracket: BracketRound[] }) {
  const r32 = bracket.find(r => r.name === 'Round of 32')
  const r16 = bracket.find(r => r.name === 'Round of 16')
  const qf = bracket.find(r => r.name === 'Quarter-Finals')
  const sf = bracket.find(r => r.name === 'Semi-Finals')
  const finalRound = bracket.find(r => r.name === 'Final')
  const thirdRound = bracket.find(r => r.name === 'Third Place')

  const qfMatches = qf?.matches ?? []
  const sfMatches = sf?.matches ?? []
  const finalMatch = finalRound?.matches[0]

  // Heights: QF=base, SF=2×, Final=4×
  const qfSlotH = SLOT_H
  const sfSlotH = SLOT_H * (qfMatches.length / (sfMatches.length || 1))
  const finalSlotH = sfMatches.length > 0
    ? sfSlotH * (sfMatches.length / 1)
    : qfSlotH * qfMatches.length

  const totalH = qfMatches.length * qfSlotH

  return (
    <div>
      {/* Early rounds as collapsible lists */}
      {r32 && <EarlyRoundList round={r32} />}
      {r16 && <EarlyRoundList round={r16} />}

      {/* Visual bracket: QF → SF → Final */}
      {qfMatches.length > 0 && finalMatch && (
        <div className="mt-4">
          <p className="text-xs text-gray-500 mb-3 font-medium">
            Knockout stages — scroll right to see full bracket →
          </p>
          <div className="overflow-x-auto pb-4">
            <div
              className="flex items-stretch"
              style={{ minWidth: (CARD_W + CONN_W) * 3 + CARD_W, height: totalH + 28 }}
            >
              {/* QF column */}
              <div className="flex flex-col">
                <div className="h-6 flex items-center">
                  <div className="text-[10px] font-bold text-[#00d4ff] uppercase tracking-widest w-full text-center">
                    Quarter-Finals
                  </div>
                </div>
                <div style={{ width: CARD_W }}>
                  {qfMatches.map((slot) => (
                    <div key={slot.id} style={{ height: qfSlotH, display: 'flex', alignItems: 'center', padding: '4px 0' }}>
                      <BracketCard slot={slot} />
                    </div>
                  ))}
                </div>
              </div>

              {/* QF → SF connector */}
              <div className="flex flex-col">
                <div className="h-6" />
                <BinaryConnector count={qfMatches.length} slotH={qfSlotH} />
              </div>

              {/* SF column */}
              <div className="flex flex-col">
                <div className="h-6 flex items-center">
                  <div className="text-[10px] font-bold text-[#00d4ff] uppercase tracking-widest w-full text-center">
                    Semi-Finals
                  </div>
                </div>
                <div style={{ width: CARD_W }}>
                  {sfMatches.map((slot) => (
                    <div key={slot.id} style={{ height: sfSlotH, display: 'flex', alignItems: 'center', padding: '4px 0' }}>
                      <BracketCard slot={slot} />
                    </div>
                  ))}
                </div>
              </div>

              {/* SF → Final connector */}
              <div className="flex flex-col">
                <div className="h-6" />
                <BinaryConnector count={sfMatches.length} slotH={sfSlotH} />
              </div>

              {/* Final column */}
              <div className="flex flex-col">
                <div className="h-6 flex items-center">
                  <div className="text-[10px] font-bold text-yellow-400 uppercase tracking-widest w-full text-center">
                    Final
                  </div>
                </div>
                <div style={{ width: CARD_W, height: totalH, display: 'flex', alignItems: 'center', padding: '4px 0' }}>
                  <BracketCard slot={finalMatch} isFinal />
                </div>
              </div>
            </div>
          </div>

          {/* 3rd place */}
          {thirdRound && thirdRound.matches[0] && (
            <div className="mt-3 bg-[#13131a] rounded-xl border border-gray-800 p-3">
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Third Place</p>
              <BracketCard slot={thirdRound.matches[0]} />
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ── Main export ────────────────────────────────────────────────────────────

interface GroupsClientProps {
  standings: Record<string, Standing[]>
  groups: Group[]
  bracket: BracketRound[]
}

export default function GroupsClient({ standings, groups, bracket }: GroupsClientProps) {
  const [view, setView] = useState<'groups' | 'bracket'>('groups')

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <div className="sticky top-0 bg-[#0a0a0f]/90 backdrop-blur-sm z-10 px-4 py-3 border-b border-gray-800">
        <h1 className="text-xl font-bold mb-3">Groups &amp; Bracket</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setView('groups')}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              view === 'groups' ? 'bg-[#00d4ff] text-[#0a0a0f]' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            Groups
          </button>
          <button
            onClick={() => setView('bracket')}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              view === 'bracket' ? 'bg-[#00d4ff] text-[#0a0a0f]' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            Bracket
          </button>
        </div>
      </div>

      <div className="px-4 py-4">
        {view === 'groups' ? (
          <div>
            {Object.entries(standings).map(([groupId, groupStandings]) => {
              const group = groups.find(g => g.id === groupId)!
              return (
                <GroupAccordion key={groupId} groupId={groupId} standings={groupStandings} group={group} />
              )
            })}
          </div>
        ) : (
          <BracketView bracket={bracket} />
        )}
      </div>
    </div>
  )
}

