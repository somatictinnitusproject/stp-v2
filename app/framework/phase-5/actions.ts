// app/framework/phase-5/actions.ts
// ─────────────────────────────────────────────────────────────────
// Server actions for Phase 5 overview page:
//   - acknowledgePhase5Reading: idempotent merge of a Phase 5
//     reading id into framework_progress.exercises_viewed.
//   - setPhase5OutcomeType: writes the member's Phase 5 outcome
//     selection to framework_progress.phase5_outcome_type. Validated
//     against PHASE5_OUTCOME_VALUES before any DB call — belt-and-
//     braces alongside the DB CHECK constraint.
//   - markPhase5Complete: writes phase5_completed_at = NOW() to
//     framework_progress. Called by Phase5ReadingList when G.8 is
//     acknowledged (marksPhaseCompleteFlag === 'phase5_completed_at').
//     Triggers completion email fire-and-forget via next/server after().
// ─────────────────────────────────────────────────────────────────

'use server'

import { after } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { PHASE5_OUTCOME_VALUES, type Phase5OutcomeType } from '@/content/framework/phase-5/types'
import { sendPhase5CompletionEmail } from '@/lib/emailoctopus/client'

export async function acknowledgePhase5Reading(readingId: string): Promise<void> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const { data: progress, error: fetchError } = await supabase
    .from('framework_progress')
    .select('exercises_viewed')
    .eq('user_id', user.id)
    .maybeSingle()

  if (fetchError) {
    console.error('[phase-5 actions] exercises_viewed fetch failed:', fetchError.message, 'user:', user.id)
    return
  }
  if (!progress) return

  const currentViewed = (progress.exercises_viewed ?? {}) as Record<string, boolean>

  // Idempotent: already acknowledged → no-op.
  if (currentViewed[readingId] === true) return

  const mergedViewed = {
    ...currentViewed,
    [readingId]: true,
  }

  const { error: updateError } = await supabase
    .from('framework_progress')
    .update({ exercises_viewed: mergedViewed })
    .eq('user_id', user.id)

  if (updateError) {
    console.error('[phase-5 actions] exercises_viewed update failed:', updateError.message, 'user:', user.id, 'readingId:', readingId)
  }
}

export async function setPhase5OutcomeType(value: Phase5OutcomeType): Promise<void> {
  // Defensive validation — TS already enforces, but server actions
  // can be called from anywhere. Belt-and-braces with the DB CHECK constraint.
  if (!(PHASE5_OUTCOME_VALUES as readonly string[]).includes(value)) {
    console.error('[phase-5 actions] setPhase5OutcomeType invalid value:', value)
    return
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const { error: updateError } = await supabase
    .from('framework_progress')
    .update({
      phase5_outcome_type: value,
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', user.id)

  if (updateError) {
    console.error('[phase-5 actions] phase5_outcome_type update failed:', updateError.message, 'user:', user.id, 'value:', value)
  }
}

export async function markPhase5Complete(): Promise<void> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const { error: updateError } = await supabase
    .from('framework_progress')
    .update({
      phase5_completed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', user.id)

  if (updateError) {
    console.error('[phase-5 actions] phase5_completed_at update failed:', updateError.message, 'user:', user.id)
    return
  }

  // Fetch display_name for email personalisation — runs before after() to avoid
  // cookie store unavailability post-response.
  const { data: userData } = await supabase
    .from('users')
    .select('display_name')
    .eq('id', user.id)
    .single()

  const email = user.email ?? ''
  const username = userData?.display_name ?? ''

  // Fire-and-forget completion email — deferred until after response via next/server after()
  after(async () => {
    await sendPhase5CompletionEmail({ email, username })
  })
}
