'use client'

import { useState, useRef, useEffect } from 'react'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

const CANNED: Record<string, string> = {
  schedule: "The 2026 World Cup runs June 11 – July 19, 2026 across 16 venues in the USA, Canada, and Mexico. Group stage runs June 11–26, then knockout rounds through the Final on July 19 at MetLife Stadium.",
  groups: "There are 12 groups (A–L) with 4 teams each for the expanded 48-team format. The top 2 from each group plus 8 best 3rd-place teams advance to the Round of 32.",
  usa: "🇺🇸 The USA is in Group A alongside Mexico, Panama, and Morocco. They open on June 11 at MetLife Stadium!",
  england: "🏴󠁧󠁢󠁥󠁮󠁧󠁿 England is in Group C with Algeria, Ecuador, and Czech Republic. They had a dominant 4-0 win over Algeria in the opener.",
  brazil: "🇧🇷 Brazil is in Group E with Netherlands, Chile, and Iran. They've won their first two matches convincingly.",
  default: "I can answer questions about World Cup 2026 schedule, groups, teams, venues, and more! Try asking about a specific team or group.",
}

function getBotReply(text: string): string {
  const lower = text.toLowerCase()
  if (lower.includes('schedule') || lower.includes('when') || lower.includes('dates')) return CANNED.schedule
  if (lower.includes('group') || lower.includes('format')) return CANNED.groups
  if (lower.includes('usa') || lower.includes('united states') || lower.includes('usmnt')) return CANNED.usa
  if (lower.includes('england')) return CANNED.england
  if (lower.includes('brazil')) return CANNED.brazil
  return CANNED.default
}

export default function AssistantPage() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: "⚽ Hey! I'm your World Cup 2026 companion. Ask me about teams, groups, schedules, or venues!" },
  ])
  const [input, setInput] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  function handleSend() {
    if (!input.trim()) return
    const userMsg: Message = { role: 'user', content: input.trim() }
    const botMsg: Message = { role: 'assistant', content: getBotReply(input) }
    setMessages(m => [...m, userMsg, botMsg])
    setInput('')
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex flex-col">
      <div className="sticky top-0 bg-[#0a0a0f]/90 backdrop-blur-sm z-10 px-4 py-3 border-b border-gray-800">
        <h1 className="text-xl font-bold">⚽ Assistant</h1>
        <p className="text-xs text-gray-400">World Cup 2026 Companion</p>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${
                msg.role === 'user'
                  ? 'bg-[#00d4ff] text-[#0a0a0f] font-medium'
                  : 'bg-[#13131a] text-white border border-gray-800'
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <div className="sticky bottom-20 bg-[#0a0a0f] px-4 py-3 border-t border-gray-800">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            placeholder="Ask about teams, groups, schedule..."
            className="flex-1 bg-[#13131a] border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 outline-none focus:border-[#00d4ff] transition-colors"
          />
          <button
            onClick={handleSend}
            className="bg-[#00d4ff] text-[#0a0a0f] font-bold px-4 py-2.5 rounded-xl text-sm hover:bg-[#00b8d9] transition-colors"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  )
}
