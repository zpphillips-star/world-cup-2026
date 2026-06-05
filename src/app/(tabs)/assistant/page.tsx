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

const CANNED: Record<string, string> = {
  schedule: "The 2026 World Cup runs June 11 – July 19 across 16 venues in the USA, Canada, and Mexico. Group stage runs June 11–26, then knockout rounds through the Final on July 19 at MetLife Stadium.",
  groups: "12 groups of 4 teams (A–L). Top 2 from each group plus 8 best 3rd-place teams (32 total) advance to the Round of 32.",
  usa: "🇺🇸 USA is in Group A with Mexico, Panama, and Morocco. They opened with a 1-0 win over Morocco and are currently winning 2-0 vs Panama!",
  england: "🏴󠁧󠁢󠁥󠁮󠁧󠁿 England is in Group C — had a dominant 4-0 win over Algeria in the opener. Looking sharp.",
  brazil: "🇧🇷 Brazil is in Group E — won 2-0 vs Iran and 3-1 vs Chile. Strong tournament so far.",
  france: "🇫🇷 France is in Group D — beat Nigeria 2-0 in the opener. Currently level 0-0 with South Korea.",
  germany: "🇩🇪 Germany is in Group B — won 3-1 vs Japan and is 1-1 vs Senegal right now.",
  spain: "🇪🇸 Spain is in Group F — crushed Cameroon 3-0 in the opener.",
  argentina: "🇦🇷 Argentina (defending champions) are in Group D — won 3-0 vs South Korea in the opener.",
  final: "🏟️ The Final is at MetLife Stadium, East Rutherford, NJ on July 19, 2026.",
  format: "48 teams, 12 groups of 4. Top 2 + 8 best 3rd-place = 32 knockout teams. Then R32 → R16 → QF → SF → Final.",
  prize: "💰 Total prize pool: $1 billion. Winners take home $50 million.",
  default: "I can answer questions about the 2026 World Cup — try asking about a team, the schedule, format, venues, or prize money!",
}

function getReply(text: string): string {
  const t = text.toLowerCase()
  if (t.includes('usa') || t.includes('united states') || t.includes('usmnt')) return CANNED.usa
  if (t.includes('england')) return CANNED.england
  if (t.includes('brazil')) return CANNED.brazil
  if (t.includes('france')) return CANNED.france
  if (t.includes('germany')) return CANNED.germany
  if (t.includes('spain')) return CANNED.spain
  if (t.includes('argentina')) return CANNED.argentina
  if (t.includes('final')) return CANNED.final
  if (t.includes('format') || t.includes('how does') || t.includes('work')) return CANNED.format
  if (t.includes('prize') || t.includes('money') || t.includes('billion')) return CANNED.prize
  if (t.includes('schedule') || t.includes('when') || t.includes('date')) return CANNED.schedule
  if (t.includes('group')) return CANNED.groups
  return CANNED.default
}

interface Msg { role: 'user' | 'bot'; text: string }

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
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<Msg[]>([])
  const [thinking, setThinking] = useState(false)
  const todayMatches = getTodayMatches()

  function send(text: string) {
    if (!text.trim()) return
    setMessages(m => [...m, { role: 'user', text: text.trim() }])
    setInput('')
    setThinking(true)
    setTimeout(() => {
      setMessages(m => [...m, { role: 'bot', text: getReply(text) }])
      setThinking(false)
    }, 600)
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f]" style={{ paddingBottom: 'calc(10rem + env(safe-area-inset-bottom))' }}>
      {/* Header */}
      <div className="px-4 pt-5 pb-3">
        <p className="text-xs text-gray-500 uppercase tracking-widest mb-0.5">World Cup 2026</p>
        <h1 className="text-2xl font-black text-white">Today</h1>
        <p className="text-sm text-gray-400 mt-0.5">June 17, 2026 · Matchday 2</p>
      </div>

      {/* Chat messages (only shown when there's a conversation) */}
      {messages.length > 0 && (
        <div className="px-4 mb-6 space-y-2">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed
                ${msg.role === 'user'
                  ? 'bg-[#00d4ff] text-[#0a0a0f] font-medium rounded-br-sm'
                  : 'bg-[#1a1a24] text-white shadow-lg shadow-black/40 rounded-bl-sm'
                }`}>
                {msg.text}
              </div>
            </div>
          ))}
          {thinking && (
            <div className="flex justify-start">
              <div className="bg-[#1a1a24] rounded-2xl rounded-bl-sm px-4 py-3 text-gray-500 text-sm shadow-lg shadow-black/40">
                Thinking…
              </div>
            </div>
          )}
        </div>
      )}

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
      <div className="px-4">
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

      {/* Fixed input bar above nav */}
      <div
        className="fixed left-0 right-0 px-3 pb-3"
        style={{ bottom: 'calc(5.5rem + env(safe-area-inset-bottom))' }}
      >
        {/* Gradient fade so content doesn't hard-clip behind the bar */}
        <div className="absolute inset-x-0 -top-8 h-8 bg-gradient-to-t from-[#0a0a0f] to-transparent pointer-events-none" />

        {/* Suggestion chips */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar mb-2 pb-0.5">
          {['How does it work?', 'USA matches', 'Argentina', 'The Final'].map(chip => (
            <button
              key={chip}
              onClick={() => send(chip)}
              className="flex-shrink-0 text-xs text-gray-300 bg-[#1e1e2e] border border-white/10 rounded-full px-3 py-1.5 hover:border-[#00d4ff]/40 hover:text-white transition-colors active:scale-95"
            >
              {chip}
            </button>
          ))}
        </div>

        {/* Input row */}
        <div className="flex items-center gap-2 bg-[#16161f] border border-white/15 rounded-2xl px-4 py-3 shadow-xl shadow-black/60 focus-within:border-[#00d4ff]/50 focus-within:shadow-[0_0_0_1px_rgba(0,212,255,0.15)] transition-all">
          {/* Bot avatar */}
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#00d4ff] to-[#0077ff] flex items-center justify-center flex-shrink-0 mr-0.5">
            <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2a2 2 0 012 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 017 7h1a1 1 0 010 2h-1v1a2 2 0 01-2 2H5a2 2 0 01-2-2v-1H2a1 1 0 010-2h1a7 7 0 017-7h1V5.73A2 2 0 0110 4a2 2 0 012-2zm0 7a5 5 0 00-5 5v3h10v-3a5 5 0 00-5-5zm-2 6a1 1 0 110-2 1 1 0 010 2zm4 0a1 1 0 110-2 1 1 0 010 2z"/>
            </svg>
          </div>
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && send(input)}
            placeholder="Ask anything about the World Cup…"
            className="flex-1 bg-transparent text-sm text-white placeholder-gray-500 outline-none"
          />
          <button
            onClick={() => send(input)}
            disabled={!input.trim()}
            className="w-9 h-9 rounded-xl bg-[#00d4ff] flex items-center justify-center text-[#0a0a0f] disabled:opacity-25 disabled:cursor-not-allowed flex-shrink-0 transition-all active:scale-90 shadow-md shadow-[#00d4ff]/20"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
