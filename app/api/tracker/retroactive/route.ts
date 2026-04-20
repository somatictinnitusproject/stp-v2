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

  const { log_date, tinnitus_score, jaw_tension, neck_tension, stress_level, sleep_quality, notes, trigger_names } =
    body as Record<string, unknown>

  // Validate log_date format and retroactive window
  if (typeof log_date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(log_date)) {
    return NextResponse.json({ success: false }, { status: 400 })
  }
  const today = new Date().toISOString().split('T')[0]
  if (log_date === today) return NextResponse.json({ success: false }, { status: 400 })

  const todayMs   = new Date(today   + 'T00:00:00Z').getTime()
  const logDateMs = new Date(log_date + 'T00:00:00Z').getTime()
  const daysDiff  = (todayMs - logDateMs) / 86_400_000
  if (daysDiff < 1 || daysDiff > SCORING_THRESHOLDS.RETROACTIVE_LOG_DAYS) {
    return NextResponse.json({ success: false }, { status: 400 })
  }

  if (
    !isSliderValue(tinnitus_score) || !isSliderValue(jaw_tension) || !isSliderValue(neck_tension) ||
    !isSliderValue(stress_level)   || !isSliderValue(sleep_quality)
  ) {
    return NextResponse.json({ success: false }, { status: 400 })
  }

  const cleanNotes = typeof notes === 'string' ? notes.trim() : ''
  if (cleanNotes.length > SCORING_THRESHOLDS.NOTES_MAX_LENGTH) {
    return NextResponse.json({ success: false }, { status: 400 })
  }

  const validTriggerNames = Array.isArray(trigger_names)
    ? trigger_names.filter((n): n is string => typeof n === 'string' && VALID_TRIGGERS.has(n))
    : []

  const { data: log, error: insertError } = await supabase
    .from('progress_logs')
    .insert({
      user_id: user.id, log_date,
      tinnitus_score, jaw_tension, neck_tension, stress_level, sleep_quality,
      notes: cleanNotes || null,
    })
    .select('id').single()

  if (insertError) {
    if (insertError.code === '23505') return NextResponse.json({ success: false, duplicate: true }, { status: 409 })
    return NextResponse.json({ success: false }, { status: 500 })
  }

  if (!log?.id) return NextResponse.json({ success: false }, { status: 500 })

  let triggerError = false
  if (validTriggerNames.length > 0) {
    const { data: triggerRows, error: lookupError } = await supabase
      .from('triggers').select('id, name').in('name', validTriggerNames)
    if (lookupError || !triggerRows) {
      triggerError = true
    } else {
      const { error: junctionError } = await supabase
        .from('progress_log_triggers')
        .insert(triggerRows.map(t => ({ log_id: log.id, trigger_id: t.id })))
      if (junctionError) triggerError = true
    }
  }

  if (triggerError) console.error('Trigger insert failed for retroactive log', log.id, 'user', user.id)

  revalidatePath('/tracker')
  revalidatePath('/dashboard')
  return NextResponse.json({ success: true, triggerError })
}
