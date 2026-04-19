import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { TRACKER_TRIGGERS } from '@/content/tracker-triggers'
import { SCORING_THRESHOLDS } from '@/content/scoring-thresholds'

const VALID_TRIGGERS = new Set<string>(TRACKER_TRIGGERS)

function isSliderValue(v: unknown): v is number {
  return typeof v === 'number' && Number.isInteger(v) && v >= 1 && v <= 10
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ success: false }, { status: 401 })

  let body: unknown
  try { body = await req.json() }
  catch { return NextResponse.json({ success: false }, { status: 400 }) }

  const { tinnitus_score, jaw_tension, neck_tension, stress_level, sleep_quality, notes, trigger_names } =
    body as Record<string, unknown>

  if (!isSliderValue(tinnitus_score) || !isSliderValue(jaw_tension) || !isSliderValue(neck_tension) ||
      !isSliderValue(stress_level) || !isSliderValue(sleep_quality)) {
    return NextResponse.json({ success: false }, { status: 400 })
  }

  const cleanNotes = typeof notes === 'string' ? notes.trim() : ''
  if (cleanNotes.length > SCORING_THRESHOLDS.NOTES_MAX_LENGTH) {
    return NextResponse.json({ success: false }, { status: 400 })
  }

  // Filter to known names only — client should only send valid names, but validate at boundary
  const validTriggerNames = Array.isArray(trigger_names)
    ? trigger_names.filter((n): n is string => typeof n === 'string' && VALID_TRIGGERS.has(n))
    : []

  const today = new Date().toISOString().split('T')[0]

  const { data: log, error: insertError } = await supabase
    .from('progress_logs')
    .insert({
      user_id: user.id,
      log_date: today,
      tinnitus_score,
      jaw_tension,
      neck_tension,
      stress_level,
      sleep_quality,
      notes: cleanNotes || null,
    })
    .select('id')
    .single()

  if (insertError) {
    if (insertError.code === '23505') {
      return NextResponse.json({ success: false, duplicate: true }, { status: 409 })
    }
    return NextResponse.json({ success: false }, { status: 500 })
  }

  if (!log?.id) {
    console.error('Progress log insert returned no id for user', user.id)
    return NextResponse.json({ success: false }, { status: 500 })
  }

  // Resolve trigger names to IDs, then insert junction rows
  let triggerError = false
  if (validTriggerNames.length > 0) {
    const { data: triggerRows, error: lookupError } = await supabase
      .from('triggers')
      .select('id, name')
      .in('name', validTriggerNames)

    if (lookupError || !triggerRows) {
      triggerError = true
    } else {
      if (triggerRows.length < validTriggerNames.length) {
        console.warn(
          'Trigger name mismatch: requested', validTriggerNames,
          'found', triggerRows.map(t => t.name)
        )
      }

      const { error: junctionError } = await supabase
        .from('progress_log_triggers')
        .insert(triggerRows.map(t => ({ log_id: log.id, trigger_id: t.id })))
      if (junctionError) triggerError = true
    }
  }

  if (triggerError) {
    console.error(
      'Trigger insert failed for log', log.id,
      'user', user.id,
      'triggers:', validTriggerNames
    )
  }

  revalidatePath('/tracker')
  revalidatePath('/dashboard')
  return NextResponse.json({ success: true, triggerError })
}
