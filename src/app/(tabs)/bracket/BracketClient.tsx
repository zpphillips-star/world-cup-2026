'use client'

import { useState } from 'react'
import type { BracketRound, BracketSlot } from '@/lib/types'

const SLOT_H = 72
const CARD_W = 168
const CONN_W = 24

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
      <div className={`flex items-center gap-1.5 px-2.5 py-1.5 ${isTbd ? 'text-gray-600' : 'text-gray-200'}`}>
        {homeTeam && <span className="text-sm flex-shrink-0">{homeTeam.flag}</span>}
        <span className="flex-1 truncate">{homeLabel}</span>
        {hasScore && <span className="font-bold text-white ml-auto tabular-nums">{slot.homeScore ?? 0}</span>}
      </div>
      <div className="border-t border-gray-800/60" />
      <div className={`flex items-center gap-1.5 px-2.5 py-1.5 ${isTbd ? 'text-gray-600' : 'text-gray-200'}`}>
        {awayTeam && <span className="text-sm flex-shrink-0">{awayTeam.flag}</span>}
        <span className="flex-1 truncate">{awayLabel}</span>
        {hasScore && <span className="font-bold text-white ml-auto tabular-nums">{slot.awayScore ?? 0}</span>}
      </div>
    </div>
  )
}

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

export default function BracketClient({ bracket }: { bracket: BracketRound[] }) {
  const r32 = bracket.find(r => r.name === 'Round of 32')
  const r16 = bracket.find(r => r.name === 'Round of 16')
  const qf = bracket.find(r => r.name === 'Quarter-Finals')
  const sf = bracket.find(r => r.name === 'Semi-Finals')
  const finalRound = bracket.find(r => r.name === 'Final')
  const thirdRound = bracket.find(r => r.name === 'Third Place')

  const qfMatches = qf?.matches ?? []
  const sfMatches = sf?.matches ?? []
  const finalMatch = finalRound?.matches[0]

  const qfSlotH = SLOT_H
  const sfSlotH = SLOT_H * (qfMatches.length / (sfMatches.length || 1))
  const totalH = qfMatches.length * qfSlotH

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <div className="sticky top-0 bg-[#0a0a0f]/90 backdrop-blur-sm z-10 px-4 py-3 border-b border-gray-800">
        <h1 className="text-xl font-bold">Bracket</h1>
      </div>

      <div className="px-4 py-4">
        {r32 && <EarlyRoundList round={r32} />}
        {r16 && <EarlyRoundList round={r16} />}

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

                <div className="flex flex-col">
                  <div className="h-6" />
                  <BinaryConnector count={qfMatches.length} slotH={qfSlotH} />
                </div>

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

                <div className="flex flex-col">
                  <div className="h-6" />
                  <BinaryConnector count={sfMatches.length} slotH={sfSlotH} />
                </div>

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

            {thirdRound && thirdRound.matches[0] && (
              <div className="mt-3 bg-[#13131a] rounded-xl border border-gray-800 p-3">
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Third Place</p>
                <BracketCard slot={thirdRound.matches[0]} />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
