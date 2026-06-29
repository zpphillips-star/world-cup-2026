import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const body = await req.json() as { message: string }
  return NextResponse.json({ reply: 'AI responses coming in Phase 2!' })
}
