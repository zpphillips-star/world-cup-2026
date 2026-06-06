'use client'

import { FlagImg } from '@/components/FlagImg'
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

function isTeam(x: unknown): x is { id: string; name: string; flag: string } {
  return typeof x === 'object' && x !== null
}

function MatchRow({ slot, label, isFinal = false }: { slot: BracketSlot; label: string; isFinal?: boolean }) {
  const isTbd = slot.status === 'tbd'
  const hasScore = slot.status === 'ft' || slot.status === 'live'
  const homeTeam = isTeam(slot.home) ? slot.home : null
  const awayTeam = isTeam(slot.away) ? slot.away : null
  const homeLabel = homeTeam ? homeTeam.name : (slot.home as string)
  const awayLabel = awayTeam ? awayTeam.name : (slot.away as string)

  return (
    <div className={`rounded-xl border px-4 py-3 ${
      isFinal
        ? 'border-yellow-500/40 bg-gradient-to-r from-yellow-950/30 to-[#0d0d15]'
        : 'border-zinc-800 bg-[#13131a]'
    }`}>
      <p className={`text-[10px] font-bold uppercase tracking-widest mb-2 ${isFinal ? 'text-yellow-400' : 'text-zinc-500'}`}>
        {label}
      </p>
      <div className={`flex items-center justify-between gap-2 ${isTbd ? 'opacity-40' : ''}`}>
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {homeTeam && <FlagImg teamId={homeTeam.id} fallback={homeTeam.flag} className="h-5 flex-shrink-0" />}
          <span className="text-sm font-semibold text-white truncate">{homeLabel}</span>
        </div>
        {hasScore && <span className="text-sm font-black text-white tabular-nums">{slot.homeScore ?? 0}</span>}
      </div>
      <div className="border-t border-zinc-800/60 my-2" />
      <div className={`flex items-center justify-between gap-2 ${isTbd ? 'opacity-40' : ''}`}>
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {awayTeam && <FlagImg teamId={awayTeam.id} fallback={awayTeam.flag} className="h-5 flex-shrink-0" />}
          <span className="text-sm font-semibold text-white truncate">{awayLabel}</span>
        </div>
        {hasScore && <span className="text-sm font-black text-white tabular-nums">{slot.awayScore ?? 0}</span>}
      </div>
      {slot.status === 'live' && (
        <p className="text-[10px] text-red-400 font-bold mt-2 animate-pulse">● LIVE</p>
      )}
    </div>
  )
}

export default function BracketClient({ bracket }: { bracket: BracketRound[] }) {
  const [activeRound, setActiveRound] = useState('Round of 32')

  const mainRounds = bracket.filter(r => ROUND_ORDER.includes(r.name))
  const thirdPlace = bracket.find(r => r.name === 'Third Place')
  const currentRound = mainRounds.find(r => r.name === activeRound)
  const isFinalRound = activeRound === 'Final'

  return (
    <div className="min-h-screen bg-[#0a0a0f]" style={{ paddingTop: 'env(safe-area-inset-top)', paddingBottom: 'calc(6rem + env(safe-area-inset-bottom))' }}>
      <div className="sticky top-0 z-10 bg-[#0a0a0f]/95 backdrop-blur-md border-b border-zinc-800 px-5 pt-5 pb-3">
        <h1 className="text-[22px] font-bold text-white tracking-tight">Knockout Bracket</h1>
        <p className="text-[12px] text-zinc-500 mt-0.5 mb-3">FIFA World Cup 2026 · Elimination Rounds</p>
        <div className="flex gap-2">
          {ROUND_ORDER.map(name => {
            const exists = mainRounds.find(r => r.name === name)
            if (!exists) return null
            const active = activeRound === name
            return (
              <button
                key={name}
                onClick={() => setActiveRound(name)}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 ${
                  active
                    ? (name === 'Final' ? 'bg-yellow-400 text-zinc-900' : 'bg-[#00d4ff] text-[#0a0a0f]')
                    : 'bg-[#1a1a24] text-zinc-400'
                }`}
              >
                {ROUND_SHORT[name] || name}
              </button>
            )
          })}
        </div>
      </div>

      <div className="px-4 pt-4 space-y-3">
        {!currentRound || currentRound.matches.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-zinc-500 gap-2">
            <span className="text-3xl">🏆</span>
            <span className="text-sm">Matches TBD</span>
          </div>
        ) : (
          currentRound.matches.map((slot, i) => {
            const prefix = ROUND_SHORT[activeRound] || activeRound
            const label = isFinalRound ? '⭐ Final ⭐' : (prefix + ' · Match ' + (i + 1))
            return <MatchRow key={slot.id} slot={slot} label={label} isFinal={isFinalRound} />
          })
        )}
        {isFinalRound && thirdPlace?.matches[0] && (
          <MatchRow slot={thirdPlace.matches[0]} label="🥇 Third Place" />
        )}
      </div>
    </div>
  )
}
