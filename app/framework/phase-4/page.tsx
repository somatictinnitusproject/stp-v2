// app/framework/phase-4/page.tsx
// ─────────────────────────────────────────────────────────────────
// Server component. Static route — shadows [phase]/page.tsx for
// /framework/phase-4. Phase 4 is accessible from current_phase >= 2
// per Doc 12 §6.3 — gated below with redirect to current phase.
//
// M14a renders only the eyebrow + h1. F.* reading list and section
// navigation land in M14b onwards. phase4_first_accessed is written
// idempotently on first overview load.
// ─────────────────────────────────────────────────────────────────

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import AuthShell from '@/components/shells/AuthShell'
import { PHASE_NAMES } from '@/content/framework-manifest'
import { markPhase4FirstAccessed } from './actions'

export default async function Phase4OverviewPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: progress } = await supabase
    .from('framework_progress')
    .select('current_phase')
    .eq('user_id', user.id)
    .maybeSingle()

  const currentPhase = progress?.current_phase ?? 1

  // Access control — Doc 12 §6.3: Phase 4 accessible from Phase 2
  // onwards. Redirect locked members to their current phase route.
  if (currentPhase < 2) redirect(`/framework/phase-${currentPhase}`)

  // Idempotent first-access timestamp write.
  await markPhase4FirstAccessed()

  return (
    <AuthShell>
      <div className="max-w-[720px] mx-auto py-8">
        <p className="text-[12px] font-medium text-primary uppercase tracking-wide mb-1">Phase 4</p>
        <h1 className="text-[28px] md:text-[36px] font-bold text-text-heading mb-6">
          {PHASE_NAMES[4]}
        </h1>
      </div>
    </AuthShell>
  )
}
