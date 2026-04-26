import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import AuthShell from '@/components/shells/AuthShell'
import { PHASE_NAMES, getMaxSessionsForPhase } from '@/content/framework-manifest'
import { B1_OPENING } from '@/content/framework/phase-1/b1-opening'
import Session1OpeningClient from './Session1OpeningClient'
import { B2_MODULE_1_TMJ } from '@/content/framework/phase-1/b2-module-1-tmj'
import Session2ModuleOneClient from './Session2ModuleOneClient'
import { B3_MODULE_2_CERV } from '@/content/framework/phase-1/b3-module-2-cervical'
import Session3ModuleTwoClient from './Session3ModuleTwoClient'
import { B4_MODULE_3_POSTURAL } from '@/content/framework/phase-1/b4-module-3-postural'
import Session4ModuleThreeClient from './Session4ModuleThreeClient'
import { B5_MODULE_4_NS } from '@/content/framework/phase-1/b5-module-4-ns'
import Session5ModuleFourClient from './Session5ModuleFourClient'

type Props = { params: Promise<{ phase: string; session: string }> }

export default async function SessionPage({ params }: Props) {
  const { phase: phaseParam, session: sessionParam } = await params
  console.log('[session-page] params', { phaseParam, sessionParam })
  const phase = parseInt(phaseParam.replace('phase-', ''), 10)
  const session = parseInt(sessionParam.replace('session-', ''), 10)
  console.log('[session-page] parsed', { phase, session, max: getMaxSessionsForPhase(phase) })

  if (isNaN(phase) || phase < 1 || phase > 5) { console.log('[session-page] 404 phase bounds'); notFound() }
  if (isNaN(session) || session < 1 || session > getMaxSessionsForPhase(phase)) { console.log('[session-page] 404 session bounds'); notFound() }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  console.log('[session-page] user', user?.id ?? 'none')
  if (!user) { console.log('[session-page] redirect login'); redirect('/login') }

  const { data: progress } = await supabase
    .from('framework_progress')
    .select('current_phase, current_session, phase4_first_accessed')
    .eq('user_id', user.id)
    .maybeSingle()

  console.log('[session-page] progress', progress)

  // No progress row means onboarding is incomplete
  if (!progress) { console.log('[session-page] redirect dashboard (no progress)'); redirect('/dashboard') }

  const currentPhase = progress.current_phase

  // Access control — Doc 12 Section 6.3, redirect per Doc 13 Section 7.1
  const phase4Accessible = currentPhase >= 2
  const isLocked = phase === 4 ? !phase4Accessible : phase > currentPhase
  console.log('[session-page] access', { currentPhase, isLocked })
  if (isLocked) { console.log('[session-page] redirect locked'); redirect(`/framework/phase-${currentPhase}`) }

  // Write phase4_first_accessed on first navigation to any Phase 4 content — Doc 13 §7.5
  if (phase === 4 && progress && !progress.phase4_first_accessed) {
    await supabase
      .from('framework_progress')
      .update({ phase4_first_accessed: new Date().toISOString() })
      .eq('user_id', user.id)
  }

  // ── Phase 1 session rendering ────────────────────────────────────────────────

  console.log('[session-page] reached rendering', { phase, session })

  if (phase === 1 && session === 1) {
    console.log('[session-page] rendering session-1 opening')
    return (
      <AuthShell>
        <Session1OpeningClient content={B1_OPENING} />
      </AuthShell>
    )
  }

  if (phase === 1 && session === 2) {
    console.log('[session-page] rendering session-2 module-1')
    return (
      <AuthShell>
        <Session2ModuleOneClient content={B2_MODULE_1_TMJ} />
      </AuthShell>
    )
  }

  if (phase === 1 && session === 3) {
    console.log('[session-page] rendering session-3 module-2')
    return (
      <AuthShell>
        <Session3ModuleTwoClient content={B3_MODULE_2_CERV} />
      </AuthShell>
    )
  }

  if (phase === 1 && session === 4) {
    console.log('[session-page] rendering session-4 module-3')
    return (
      <AuthShell>
        <Session4ModuleThreeClient content={B4_MODULE_3_POSTURAL} />
      </AuthShell>
    )
  }

  if (phase === 1 && session === 5) {
    console.log('[session-page] rendering session-5 module-4')
    return (
      <AuthShell>
        <Session5ModuleFourClient content={B5_MODULE_4_NS} />
      </AuthShell>
    )
  }

  // Phase 1 sessions 4–7 — stub until sub-steps 4–7 are built

  // ── Default stub — all other phases and Phase 1 sessions 3–7 ────────────────

  console.log('[session-page] rendering default stub')
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
