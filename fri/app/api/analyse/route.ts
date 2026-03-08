import { NextRequest, NextResponse } from 'next/server'
import { analyseConversations } from '@/lib/claudeAnalyser'
import { Conversation } from '@/lib/types'

export async function POST(request: NextRequest) {
  console.log('[FRI API] POST /api/analyse received')

  let body: { conversations: Conversation[] }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { conversations } = body

  if (!Array.isArray(conversations) || conversations.length === 0) {
    return NextResponse.json({ error: 'conversations must be a non-empty array' }, { status: 400 })
  }

  if (conversations.length > 100) {
    return NextResponse.json(
      { error: 'Maximum 100 conversations per analysis. Please reduce your dataset.' },
      { status: 400 }
    )
  }

  console.log(`[FRI API] Analysing ${conversations.length} conversations`)

  try {
    const result = await analyseConversations(conversations)
    console.log('[FRI API] Analysis complete, returning result')
    return NextResponse.json(result)
  } catch (error) {
    console.error('[FRI API] Analysis failed:', error)
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { error: `Analysis failed: ${message}` },
      { status: 500 }
    )
  }
}
