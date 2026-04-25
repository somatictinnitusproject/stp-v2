import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { incrementCurrentSession } from '@/lib/framework/advance'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ success: false }, { status: 401 })

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ success: false }, { status: 400 })
  }

  const { phase, session } = body as { phase: number; session: number }

  if (typeof phase !== 'number' || typeof session !== 'number') {
    return NextResponse.json({ success: false }, { status: 400 })
  }

  // Only phases 1, 2, 5 — phases 3 and 4 advance via /session (Phase D scope)
  if (![1, 2, 5].includes(phase)) {
    return NextResponse.json({ success: false }, { status: 400 })
  }

  // TODO Phase E: once /content/session-lists/ exists with session IDs,
  // upgrade idempotency check in lib/framework/advance.ts from phase+session
  // numeric comparison to session ID comparison per Doc 13 §7.8. Catches
  // stale-content submissions where numbers coincidentally align but represent
  // different content.

  try {
    const { nextSession } = await incrementCurrentSession(user.id, phase, session)
    return NextResponse.json({ success: true, next_session: nextSession })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : ''
    if (msg === 'framework_progress row not found for user') {
      return NextResponse.json({ success: false }, { status: 404 })
    }
    return NextResponse.json({ success: false }, { status: 500 })
  }
}
