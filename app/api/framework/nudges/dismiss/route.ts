import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// The 5 valid nudge IDs per Doc 13 §9.2. Future Phase 3 nudges (4, 5)
// are accepted now even though they're not yet rendered anywhere —
// the route is future-ready.
const VALID_NUDGE_IDS = [
  'phase4_workstation',
  'phase4_sleep',
  'phase4_breathwork',
  'phase4_nervous_system_stress',
  'phase4_hypervigilance',
] as const

type ValidNudgeId = typeof VALID_NUDGE_IDS[number]

function isValidNudgeId(id: unknown): id is ValidNudgeId {
  return typeof id === 'string' && (VALID_NUDGE_IDS as readonly string[]).includes(id)
}

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ success: false }, { status: 401 })
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json(
      { success: false, message: 'Invalid request body' },
      { status: 400 },
    )
  }

  const nudgeId = (body as { nudgeId?: unknown })?.nudgeId
  if (!isValidNudgeId(nudgeId)) {
    return NextResponse.json(
      { success: false, message: 'Invalid nudgeId' },
      { status: 400 },
    )
  }

  // Read existing dismissed map
  const { data: progress, error: readError } = await supabase
    .from('framework_progress')
    .select('nudges_dismissed')
    .eq('user_id', user.id)
    .maybeSingle()

  if (readError || !progress) {
    console.error('[nudges/dismiss] read error', readError)
    return NextResponse.json(
      { success: false, message: 'Could not read progress' },
      { status: 500 },
    )
  }

  const existing =
    (progress.nudges_dismissed as Record<string, unknown> | null) ?? {}
  const updated = { ...existing, [nudgeId]: true }

  const { error: writeError } = await supabase
    .from('framework_progress')
    .update({ nudges_dismissed: updated })
    .eq('user_id', user.id)

  if (writeError) {
    console.error('[nudges/dismiss] write error', writeError)
    return NextResponse.json(
      { success: false, message: 'Could not save dismissal' },
      { status: 500 },
    )
  }

  return NextResponse.json({ success: true })
}
