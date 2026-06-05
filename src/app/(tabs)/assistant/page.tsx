'use client'

import { useState } from 'react'
import { mockProvider } from '@/lib/mockProvider'

const TODAY_UTC = new Date('2026-06-17')

function getTodayMatches() {
  const all = mockProvider.getMatches()
  return all.filter(m => {
    const d = new Date(m.kickoff)
    return (
      d.getUTCFullYear() === TODAY_UTC.getUTCFullYear() &&
      d.getUTCMonth() === TODAY_UTC.getUTCMonth() &&
      d.getUTCDate() === TODAY_UTC.getUTCDate()
    )
  })
}

function formatKickoff(iso: string) {
  return new Date(iso).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    timeZoneName: 'short',
    timeZone: 'America/New_York',
  })
}

const FAQS = [
  { q: 'How does the 2026 format work?', a: '48 teams split into 12 groups of 4. Top 2 from each group plus 8 best 3rd-place teams (32 total) advance to the Round of 32. Then straight knockout to the Final.' },
  { q: 'Where is the Final?', a: '🏟️ MetLife Stadium, East Rutherford, New Jersey — July 19, 2026.' },
  { q: 'How many games in total?', a: '104 matches — 72 group stage, 32 knockout. The most ever at a World Cup.' },
  { q: 'Which countries are hosting?', a: '🇺🇸 USA (11 cities), 🇲🇽 Mexico (3 cities), 🇨🇦 Canada (2 cities). 16 venues total.' },
  { q: 'When does the group stage end?', a: 'June 26–27, 2026. All matchday 3 group games wrap up by June 27.' },
  { q: 'Who are the defending champions?', a: '🇦🇷 Argentina — won the 2022 World Cup in Qatar, beating France on penalties in the final.' },
  { q: "What's the prize money?", a: 'FIFA total prize pool: $1 billion. The winner takes home $50 million.' },
]

const STATS = [
  { label: 'Teams', value: '48' },
  { label: 'Matches', value: '104' },
  { label: 'Venues', value: '16' },
  { label: 'Groups', value: '12' },
  { label: 'Host Nations', value: '3' },
  { label: 'Prize Pool', value: '$1B' },
]

export default function AssistantPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const todayMatches = getTodayMatches()

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      {/* Header */}
      <div className="px-4 pt-5 pb-3">
        <p className="text-xs text-gray-500 uppercase tracking-widest mb-0.5">World Cup 2026</p>
        <h1 className="text-2xl font-black text-white">Today</h1>
        <p className="text-sm text-gray-400 mt-0.5">June 17, 2026 · Matchday 2</p>
      </div>

      {/* Today's matches */}
      <div className="px-4 mb-6">
        <p className="text-[11px] text-gray-500 uppercase tracking-widest mb-3">{"Today's Matches"}</p>
        {todayMatches.length === 0 ? (
          <div className="bg-[#13131a] rounded-2xl p-4 text-center text-gray-500 text-sm">No matches today</div>
        ) : (
          <div className="space-y-2">
            {todayMatches.map(m => {
              const home = typeof m.homeTeam === 'object' ? m.homeTeam : { name: String(m.homeTeam), flag: '🏆' }
              const away = typeof m.awayTeam === 'object' ? m.awayTeam : { name: String(m.awayTeam), flag: '🏆' }
              return (
                <div key={m.id} className="bg-[#1a1a24] rounded-2xl px-4 py-3 shadow-lg shadow-black/40">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <span className="text-xl flex-shrink-0">{home.flag}</span>
                      <span className="text-sm font-semibold text-white truncate">{home.name}</span>
                    </div>
                    <div className="flex flex-col items-center px-3 min-w-[64px]">
                      {m.status === 'ft' && <><span className="text-lg font-black text-white">{m.homeScore}–{m.awayScore}</span><span className="text-[10px] text-gray-500">FT</span></>}
                      {m.status === 'live' && <><span className="text-lg font-black text-white">{m.homeScore}–{m.awayScore}</span><span className="text-[10px] text-red-400 font-bold animate-pulse">● LIVE</span></>}
                      {m.status === 'upcoming' && <><span className="text-xs font-bold text-gray-300 text-center">{formatKickoff(m.kickoff)}</span><span className="text-[10px] text-gray-500">{m.group ? `Group ${m.group}` : m.round}</span></>}
                    </div>
                    <div className="flex items-center gap-2 flex-1 min-w-0 justify-end">
                      <span className="text-sm font-semibold text-white truncate text-right">{away.name}</span>
                      <span className="text-xl flex-shrink-0">{away.flag}</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Quick stats */}
      <div className="px-4 mb-6">
        <p className="text-[11px] text-gray-500 uppercase tracking-widest mb-3">Tournament at a Glance</p>
        <div className="grid grid-cols-3 gap-2">
          {STATS.map(s => (
            <div key={s.label} className="bg-[#1a1a24] rounded-2xl p-3 text-center shadow-lg shadow-black/40">
              <div className="text-xl font-black text-white">{s.value}</div>
              <div className="text-[10px] text-gray-500 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* FAQ accordion */}
      <div className="px-4 pb-6">
        <p className="text-[11px] text-gray-500 uppercase tracking-widest mb-3">FAQs</p>
        <div className="space-y-2">
          {FAQS.map((faq, i) => (
            <button
              key={i}
              onClick={() => setOpenFaq(openFaq === i ? null : i)}
              className="w-full text-left bg-[#1a1a24] rounded-2xl px-4 py-3.5 shadow-lg shadow-black/40 active:scale-[0.98] transition-transform"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm font-semibold text-white">{faq.q}</span>
                <span className={`text-gray-400 text-xl flex-shrink-0 transition-transform duration-200 ${openFaq === i ? 'rotate-45' : ''}`}>+</span>
              </div>
              {openFaq === i && (
                <p className="text-sm text-gray-400 mt-2.5 leading-relaxed border-t border-gray-800 pt-2.5">
                  {faq.a}
                </p>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
