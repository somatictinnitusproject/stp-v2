import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { incrementCurrentSession } from '@/lib/framework/advance'

// Phase 2 habit acknowledgement route.
// Two payload shapes:
//   { kind: 'habit', habitId: string } — writes per-habit timestamp under
//                                         phase2_habits_acknowledged.C2.habits[habitId]
//   { kind: 'section' }                — writes section timestamp under
//                                         phase2_habits_acknowledged.C2.section,
//                                         AND advances current_session 1 -> 2
//
// JSONB merge pattern: read-modify-write in a single supabase update. Last-
// write-wins per Doc 12 §6.13. No concurrent write concern for human-paced
// habit acknowledges.

type HabitId = 'H1' | 'H2' | 'H3' | 'H4' | 'H5' | 'H6' | 'H7'
const VALID_HABIT_IDS: HabitId[] = ['H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'H7']

type RequestBody =
  | { kind: 'habit'; habitId: string }
  | { kind: 'section' }

type ExistingHabitsAck = {
  C2?: {
    section?: string
    habits?: Record<string, string>
  }
  [key: string]: unknown
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ success: false }, { status: 401 })
  }

  let body: RequestBody
  try {
    body = (await req.json()) as RequestBody
  } catch {
    return NextResponse.json({ success: false, message: 'Invalid JSON' }, { status: 400 })
  }

  if (body.kind !== 'habit' && body.kind !== 'section') {
    return NextResponse.json({ success: false, message: 'Invalid kind' }, { status: 400 })
  }

  if (body.kind === 'habit') {
    if (!VALID_HABIT_IDS.includes(body.habitId as HabitId)) {
      return NextResponse.json({ success: false, message: 'Invalid habitId' }, { status: 400 })
    }
  }

  // Read current phase2_habits_acknowledged
  const { data: progress, error: readError } = await supabase
    .from('framework_progress')
    .select('phase2_habits_acknowledged')
    .eq('user_id', user.id)
    .maybeSingle()

  if (readError) {
    console.error('[c2-acknowledge] read error', readError)
    return NextResponse.json({ success: false, message: 'Read failed' }, { status: 500 })
  }
  if (!progress) {
    return NextResponse.json({ success: false, message: 'No progress row' }, { status: 404 })
  }

  // Merge in the new value
  const existing = (progress.phase2_habits_acknowledged ?? {}) as ExistingHabitsAck
  const c2 = existing.C2 ?? {}
  const nowIso = new Date().toISOString()

  let merged: ExistingHabitsAck
  if (body.kind === 'habit') {
    merged = {
      ...existing,
      C2: {
        ...c2,
        habits: {
          ...(c2.habits ?? {}),
          [body.habitId]: nowIso,
        },
      },
    }
  } else {
    // section
    merged = {
      ...existing,
      C2: {
        ...c2,
        section: nowIso,
      },
    }
  }

  // Write merged JSONB
  const { error: writeError } = await supabase
    .from('framework_progress')
    .update({ phase2_habits_acknowledged: merged })
    .eq('user_id', user.id)

  if (writeError) {
    console.error('[c2-acknowledge] write error', writeError)
    return NextResponse.json({ success: false, message: 'Write failed' }, { status: 500 })
  }

  // For section acknowledge, also advance current_session 1 -> 2
  if (body.kind === 'section') {
    try {
      const { nextSession } = await incrementCurrentSession(user.id, 2, 2)
      return NextResponse.json({ success: true, kind: 'section', next_session: nextSession })
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : ''
      if (msg === 'framework_progress row not found for user') {
        return NextResponse.json({ success: false, message: 'No progress row' }, { status: 404 })
      }
      console.error('[c2-acknowledge] advance error', err)
      return NextResponse.json({ success: false, message: 'Advance failed' }, { status: 500 })
    }
  }

  return NextResponse.json({ success: true, kind: 'habit', habitId: (body as { habitId: string }).habitId })
}
