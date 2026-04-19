import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { TRACKER_TRIGGERS } from '@/content/tracker-triggers'
import { SCORING_THRESHOLDS } from '@/content/scoring-thresholds'
import { isEditable } from '@/lib/tracker/edit-window'

const VALID_TRIGGERS = new Set<string>(TRACKER_TRIGGERS)

function isSliderValue(v: unknown): v is number {
  return typeof v === 'number' && Number.isInteger(v) && v >= 1 && v <= 10
}

export async function PATCH(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ success: false }, { status: 401 })

  let body: unknown
  try { body = await req.json() }
  catch { return NextResponse.json({ success: false }, { status: 400 }) }

  const { log_id, tinnitus_score, jaw_tension, neck_tension, stress_level, sleep_quality, notes, trigger_names } =
    body as Record<string, unknown>

  if (typeof log_id !== 'string' || !log_id) {
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

  // Fetch existing log — verify ownership and edit window
  const { data: existing, error: fetchError } = await supabase
    .from('progress_logs')
    .select('id, user_id, created_at')
    .eq('id', log_id)
    .maybeSingle()

  if (fetchError || !existing) return NextResponse.json({ success: false }, { status: 404 })
  if (existing.user_id !== user.id) return NextResponse.json({ success: false }, { status: 403 })
  if (!isEditable(new Date(existing.created_at))) {
    return NextResponse.json({ success: false, editWindowExpired: true }, { status: 403 })
  }

  // Update the log — progress_logs has no updated_at column
  const { error: updateError } = await supabase
    .from('progress_logs')
    .update({ tinnitus_score, jaw_tension, neck_tension, stress_level, sleep_quality, notes: cleanNotes || null })
    .eq('id', log_id)

  if (updateError) return NextResponse.json({ success: false }, { status: 500 })

  // Replace trigger associations: delete all then insert new set
  const { error: deleteError } = await supabase
    .from('progress_log_triggers')
    .delete()
    .eq('log_id', log_id)

  if (deleteError) {
    console.error('Trigger delete failed for log', log_id, 'user', user.id)
    revalidatePath('/tracker')
    revalidatePath('/dashboard')
    return NextResponse.json({ success: true, triggerError: true })
  }

  let triggerError = false
  if (validTriggerNames.length > 0) {
    const { data: triggerRows, error: lookupError } = await supabase
      .from('triggers').select('id, name').in('name', validTriggerNames)
    if (lookupError || !triggerRows) {
      triggerError = true
    } else {
      const { error: insertError } = await supabase
        .from('progress_log_triggers')
        .insert(triggerRows.map(t => ({ log_id, trigger_id: t.id })))
      if (insertError) triggerError = true
    }
  }

  if (triggerError) console.error('Trigger insert failed for log', log_id, 'user', user.id)

  revalidatePath('/tracker')
  revalidatePath('/dashboard')
  return NextResponse.json({ success: true, triggerError })
}
