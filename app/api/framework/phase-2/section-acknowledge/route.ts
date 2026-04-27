import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { incrementCurrentSession } from '@/lib/framework/advance'

// Phase 2 section acknowledgement route — handles C.2 through C.7.
// Three payload shapes:
//   { sectionId: 'C2'..'C7', kind: 'habit', habitId: string }
//     → writes per-habit timestamp under
//       phase2_habits_acknowledged[sectionId].habits[habitId]
//   { sectionId: 'C2'..'C7', kind: 'section' }
//     → writes section timestamp under
//       phase2_habits_acknowledged[sectionId].section,
//       AND advances current_session by 1 (idempotent)
//
// C1 has no acknowledgement — it uses the generic /api/framework/advance-session
// route directly (just advances current_session, no jsonb write).
// C8 uses a separate /api/framework/phase-2/confirm-phase-2 route (built in M12g)
// which writes phase2_completed_at and advances Phase 2 → Phase 3.
//
// JSONB merge pattern: read-modify-write in a single supabase update. Last-
// write-wins per Doc 12 §6.13. Established in M12c, generalised here.

type SectionId = 'C2' | 'C3' | 'C4' | 'C5' | 'C6' | 'C7'
const VALID_SECTION_IDS: SectionId[] = ['C2', 'C3', 'C4', 'C5', 'C6', 'C7']

// Map sectionId to the session number it corresponds to.
// C2 = session 2, C3 = session 3, etc. The session number is what gets
// passed as completedSession to incrementCurrentSession.
const SECTION_TO_SESSION: Record<SectionId, number> = {
  C2: 2,
  C3: 3,
  C4: 4,
  C5: 5,
  C6: 6,
  C7: 7,
}

type RequestBody =
  | { sectionId: SectionId; kind: 'habit'; habitId: string }
  | { sectionId: SectionId; kind: 'section' }

type SectionAck = {
  section?: string
  habits?: Record<string, string>
}

type ExistingHabitsAck = {
  [sectionId: string]: SectionAck | undefined
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

  // Validate sectionId
  if (!body.sectionId || !VALID_SECTION_IDS.includes(body.sectionId)) {
    return NextResponse.json({ success: false, message: 'Invalid sectionId' }, { status: 400 })
  }

  // Validate kind
  if (body.kind !== 'habit' && body.kind !== 'section') {
    return NextResponse.json({ success: false, message: 'Invalid kind' }, { status: 400 })
  }

  // For habit kind, validate habitId is a non-empty string.
  // We do NOT validate against a per-section habitId list — the route doesn't
  // need to know which habit IDs are valid for which section. The content
  // file owns that knowledge; the client sends what the content file defines.
  // Garbage habitId values just create no-op JSONB keys, which is acceptable
  // engagement telemetry behaviour.
  if (body.kind === 'habit') {
    if (typeof body.habitId !== 'string' || body.habitId.length === 0 || body.habitId.length > 32) {
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
    console.error('[section-acknowledge] read error', readError)
    return NextResponse.json({ success: false, message: 'Read failed' }, { status: 500 })
  }
  if (!progress) {
    return NextResponse.json({ success: false, message: 'No progress row' }, { status: 404 })
  }

  // Merge in the new value
  const existing = (progress.phase2_habits_acknowledged ?? {}) as ExistingHabitsAck
  const sectionAck: SectionAck = existing[body.sectionId] ?? {}
  const nowIso = new Date().toISOString()

  let merged: ExistingHabitsAck
  if (body.kind === 'habit') {
    merged = {
      ...existing,
      [body.sectionId]: {
        ...sectionAck,
        habits: {
          ...(sectionAck.habits ?? {}),
          [body.habitId]: nowIso,
        },
      },
    }
  } else {
    // section
    merged = {
      ...existing,
      [body.sectionId]: {
        ...sectionAck,
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
    console.error('[section-acknowledge] write error', writeError)
    return NextResponse.json({ success: false, message: 'Write failed' }, { status: 500 })
  }

  // For section acknowledge, also advance current_session
  if (body.kind === 'section') {
    const completedSession = SECTION_TO_SESSION[body.sectionId]
    try {
      const { nextSession } = await incrementCurrentSession(user.id, 2, completedSession)
      return NextResponse.json({ success: true, kind: 'section', sectionId: body.sectionId, next_session: nextSession })
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : ''
      if (msg === 'framework_progress row not found for user') {
        return NextResponse.json({ success: false, message: 'No progress row' }, { status: 404 })
      }
      console.error('[section-acknowledge] advance error', err)
      return NextResponse.json({ success: false, message: 'Advance failed' }, { status: 500 })
    }
  }

  return NextResponse.json({
    success: true,
    kind: 'habit',
    sectionId: body.sectionId,
    habitId: (body as { habitId: string }).habitId,
  })
}
