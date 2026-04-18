import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

// Doc 13 Section 5.10 getContinueDestination logic.
export default async function FrameworkPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: progress } = await supabase
    .from('framework_progress')
    .select('current_phase, current_session, phase5_completed_at')
    .eq('user_id', user.id)
    .maybeSingle()

  // No progress row — first framework access ever (Doc 13 §5.10)
  if (!progress) {
    redirect('/framework/phase-1/session-1')
  }

  // All phases complete
  // TODO Phase E: confirm whether /framework/phase-5/maintenance exists
  // as a distinct route or whether this routes to session-[last].
  // Doc 13 §5.10 says /maintenance; Doc 14 §4.6 doesn't list it.
  if (progress.phase5_completed_at) {
    redirect('/framework/phase-5/maintenance')
  }

  const { current_phase: phase, current_session: session } = progress

  // Phase 3 and 4 go to daily session view (/session) — Phase D scope
  // TODO Phase D: redirect to /session once that route exists
  if (phase === 3 || phase === 4) {
    redirect(`/framework/phase-${phase}`)
  }

  // Phases 1, 2, 5 — direct to current session (placeholder in Phase C,
  // real content in Phase E)
  redirect(`/framework/phase-${phase}/session-${session}`)
}
