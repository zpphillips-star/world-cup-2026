import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { message } = await req.json() as { message: string }
  return NextResponse.json({
    reply: `Thanks for your message: "${message}". AI responses coming in Phase 2!`
  })
}
