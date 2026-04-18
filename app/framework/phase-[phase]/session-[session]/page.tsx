import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import AuthShell from '@/components/shells/AuthShell'
import { PHASE_NAMES, getMaxSessionsForPhase } from '@/content/framework-manifest'

type Props = { params: Promise<{ phase: string; session: string }> }

export default async function SessionPage({ params }: Props) {
  const { phase: phaseParam, session: sessionParam } = await params
  const phase = parseInt(phaseParam, 10)
  const session = parseInt(sessionParam, 10)

  if (isNaN(phase) || phase < 1 || phase > 5) notFound()
  if (isNaN(session) || session < 1 || session > getMaxSessionsForPhase(phase)) notFound()

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: progress } = await supabase
    .from('framework_progress')
    .select('current_phase, current_session, phase4_first_accessed')
    .eq('user_id', user.id)
    .maybeSingle()

  const currentPhase = progress?.current_phase ?? 1

  // Access control — Doc 12 Section 6.3, redirect per Doc 13 Section 7.1
  const phase4Accessible = currentPhase >= 2
  const isLocked = phase === 4 ? !phase4Accessible : phase > currentPhase
  if (isLocked) redirect(`/framework/phase-${currentPhase}`)

  // Write phase4_first_accessed on first navigation to any Phase 4 content — Doc 13 §7.5
  if (phase === 4 && progress && !progress.phase4_first_accessed) {
    await supabase
      .from('framework_progress')
      .update({ phase4_first_accessed: new Date().toISOString() })
      .eq('user_id', user.id)
  }

  return (
    <AuthShell>
      <div className="max-w-[680px] mx-auto pt-10 pb-16">

        <p className="text-[12px] font-medium text-primary uppercase tracking-wide mb-3">
          Phase {phase} · Session {session}
        </p>
        <h1 className="text-[28px] md:text-[36px] font-bold text-text-heading mb-6">
          {PHASE_NAMES[phase]}
        </h1>

        {/* TODO Phase E: replace with real session content.
            Session content lives in /content/framework/*.ts — static TypeScript constants.
            Render: mechanism explanation, profile modifier blocks, technique instructions,
            demonstration video, complete button. See Doc 12 Section 6.5 for full view spec. */}
        <div className="bg-surface rounded-[12px] border border-border p-6">
          <p className="text-[14px] text-text-muted text-center py-8">
            Session content — Phase E.
          </p>
        </div>

      </div>
    </AuthShell>
  )
}
