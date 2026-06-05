'use client'

import { useState, useRef, useEffect } from 'react'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

const CANNED: Record<string, string> = {
  schedule: "The 2026 World Cup runs June 11 – July 19, 2026 across 16 venues in the USA, Canada, and Mexico. Group stage runs June 11–26, then knockout rounds through the Final on July 19 at MetLife Stadium.",
  groups: "There are 12 groups (A–L) with 4 teams each for the expanded 48-team format. The top 2 from each group plus 8 best 3rd-place teams advance to the Round of 32.",
  usa: "🇺🇸 The USA is in Group A alongside Mexico, Panama, and Morocco. They opened with a 1-0 win over Morocco on June 11 at MetLife Stadium and are currently winning 2-0 vs Panama!",
  england: "🏴󠁧󠁢󠁥󠁮󠁧󠁿 England is in Group C with Algeria, Ecuador, and Czech Republic. They had a dominant 4-0 win over Algeria in the opener — looking sharp!",
  brazil: "🇧🇷 Brazil is in Group E with Netherlands, Chile, and Iran. They've won their first two matches convincingly — 2-0 vs Iran and 3-1 vs Chile.",
  today: "⚽ Today (June 13) we've got 3 matches: England 🏴󠁧󠁢󠁥󠁮󠁧󠁿 4–0 Algeria 🇩🇿, Ecuador 🇪🇨 1–2 Czech Republic 🇨🇿, and France 🇫🇷 2–0 Nigeria 🇳🇬.",
  goldenboot: "🥇 Golden Boot leaders so far: Erling Haaland (Brazil) with 3 goals, and several players tied on 2 including Jude Bellingham, Lionel Messi, and Vinícius Jr.",
  groupa: "📊 Group A standings:\n1. USA 🇺🇸 — 3 pts (1W)\n2. Mexico 🇲🇽 — 3 pts (1W)\n3. Panama 🇵🇦 — 0 pts\n4. Morocco 🇲🇦 — 0 pts\nBig USA vs Mexico clash coming June 21!",
  default: "I can answer questions about the 2026 World Cup schedule, groups, teams, venues, and more! Try asking about a specific team or group.",
}

function getBotReply(text: string): string {
  const lower = text.toLowerCase()
  if (lower.includes('today') || lower.includes('june 13')) return CANNED.today
  if (lower.includes('golden boot') || lower.includes('top scorer')) return CANNED.goldenboot
  if (lower.includes('group a') || lower.includes('group a standings')) return CANNED.groupa
  if (lower.includes('schedule') || lower.includes('when') || lower.includes('dates')) return CANNED.schedule
  if (lower.includes('group') || lower.includes('format')) return CANNED.groups
  if (lower.includes('usa') || lower.includes('united states') || lower.includes('usmnt')) return CANNED.usa
  if (lower.includes('england')) return CANNED.england
  if (lower.includes('brazil')) return CANNED.brazil
  return CANNED.default
}

const SUGGESTED = [
  { label: "Who plays today?", query: "Who plays today?" },
  { label: "Group A standings", query: "Show me Group A standings" },
  { label: "When does USA play?", query: "When does USA play?" },
  { label: "Golden Boot leader?", query: "Who's leading the Golden Boot?" },
]

export default function AssistantPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [thinking, setThinking] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, thinking])

  function sendMessage(text: string) {
    if (!text.trim()) return
    const userMsg: Message = { role: 'user', content: text.trim() }
    setMessages(m => [...m, userMsg])
    setInput('')
    setThinking(true)

    // Simulate a short delay for the typing indicator
    setTimeout(() => {
      const botMsg: Message = { role: 'assistant', content: getBotReply(text) }
      setMessages(m => [...m, botMsg])
      setThinking(false)
    }, 700)
  }

  const isEmpty = messages.length === 0 && !thinking

  return (
    <div
      className="bg-[#0a0a0f] flex flex-col overflow-hidden"
      style={{
        height: '100dvh',
        paddingTop: 'env(safe-area-inset-top)',
      }}
    >
      {/* Header */}
      <div className="flex-shrink-0 bg-[#0a0a0f]/90 backdrop-blur-sm px-4 py-3 border-b border-gray-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#00d4ff] to-[#0066cc] flex items-center justify-center text-sm font-bold text-white">
            ⚽
          </div>
          <div>
            <h1 className="text-base font-bold leading-tight">World Cup Assistant</h1>
            <p className="text-[11px] text-green-400 font-medium">● Online</p>
          </div>
        </div>
      </div>

      {/* Messages area — scrollable, fills remaining space */}
      <div className="flex-1 overflow-y-auto px-4 py-4 min-h-0">
        {/* Empty state */}
        {isEmpty && (
          <div className="flex flex-col items-center justify-center text-center pt-8 pb-4">
            <div className="text-6xl mb-4">⚽</div>
            <h2 className="text-xl font-bold text-white mb-2">World Cup 2026 Assistant</h2>
            <p className="text-sm text-gray-400 max-w-xs">
              Ask me anything about the 2026 FIFA World Cup — teams, groups, schedules, venues, or scores.
            </p>

            {/* Suggested questions */}
            <div className="mt-6 flex flex-wrap gap-2 justify-center">
              {SUGGESTED.map(s => (
                <button
                  key={s.label}
                  onClick={() => sendMessage(s.query)}
                  className="px-3 py-1.5 rounded-full text-xs font-medium bg-[#13131a] border border-gray-700 text-gray-300 hover:border-[#00d4ff] hover:text-[#00d4ff] transition-colors"
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Message bubbles */}
        <div className="space-y-3">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.role === 'assistant' && (
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#00d4ff] to-[#0066cc] flex items-center justify-center text-xs mr-2 flex-shrink-0 mt-0.5">
                  ⚽
                </div>
              )}
              <div
                className={`max-w-[78%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-line
                  ${msg.role === 'user'
                    ? 'bg-[#00d4ff] text-[#0a0a0f] font-medium rounded-br-sm'
                    : 'bg-[#13131a] text-white border border-gray-800 rounded-bl-sm'
                  }`}
              >
                {msg.content}
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {thinking && (
            <div className="flex justify-start items-end gap-2">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#00d4ff] to-[#0066cc] flex items-center justify-center text-xs flex-shrink-0">
                ⚽
              </div>
              <div className="bg-[#13131a] border border-gray-800 rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-1.5 text-gray-400">
                <span className="typing-dot" />
                <span className="typing-dot" />
                <span className="typing-dot" />
              </div>
            </div>
          )}
        </div>

        {/* Suggested chips below chat when there are messages */}
        {!isEmpty && !thinking && (
          <div className="mt-4 flex flex-wrap gap-2">
            {SUGGESTED.map(s => (
              <button
                key={s.label}
                onClick={() => sendMessage(s.query)}
                className="px-3 py-1 rounded-full text-[11px] font-medium bg-[#13131a] border border-gray-700 text-gray-400 hover:border-[#00d4ff] hover:text-[#00d4ff] transition-colors"
              >
                {s.label}
              </button>
            ))}
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input bar — pinned above nav */}
      <div
        className="flex-shrink-0 bg-[#0a0a0f] px-4 py-3 border-t border-gray-800"
        style={{ paddingBottom: 'calc(5.5rem + env(safe-area-inset-bottom))' }}
      >
        <div className="flex items-center gap-2 bg-[#13131a] border border-gray-700 rounded-full px-4 py-2.5 focus-within:border-[#00d4ff] transition-colors">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && sendMessage(input)}
            placeholder="Ask about teams, groups, schedule…"
            className="flex-1 bg-transparent text-sm text-white placeholder-gray-500 outline-none"
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={!input.trim()}
            className="w-8 h-8 rounded-full bg-[#00d4ff] flex items-center justify-center text-[#0a0a0f] hover:bg-[#00b8d9] transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
            aria-label="Send"
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

