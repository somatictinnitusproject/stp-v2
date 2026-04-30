import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import AuthShell from '@/components/shells/AuthShell'
import { PHASE_NAMES, getMaxSessionsForPhase } from '@/content/framework-manifest'

type Props = { params: Promise<{ phase: string }> }

export default async function PhaseOverviewPage({ params }: Props) {
  const { phase: phaseParam } = await params
  const phase = parseInt(phaseParam.replace('phase-', ''), 10)
  if (isNaN(phase) || phase < 1 || phase > 5) notFound()

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: progress } = await supabase
    .from('framework_progress')
    .select('current_phase, current_session, phase1_completed_at, phase2_completed_at, phase3_completed_at, phase4_completed_at, phase5_completed_at')
    .eq('user_id', user.id)
    .maybeSingle()

  const currentPhase = progress?.current_phase ?? 1

  // Access control — Doc 12 Section 6.3, redirect per Doc 13 Section 7.1
  const phase4Accessible = currentPhase >= 2
  const isLocked = phase === 4 ? !phase4Accessible : phase > currentPhase
  if (isLocked) redirect(`/framework/phase-${currentPhase}`)

  const completedAtMap: Record<number, string | null> = {
    1: progress?.phase1_completed_at ?? null,
    2: progress?.phase2_completed_at ?? null,
    3: progress?.phase3_completed_at ?? null,
    4: progress?.phase4_completed_at ?? null,
    5: progress?.phase5_completed_at ?? null,
  }

  const phaseCompleted = !!completedAtMap[phase]
  const currentSession = progress?.current_session ?? 1
  const maxSessions = getMaxSessionsForPhase(phase)

  function getSessionStatus(sessionNum: number): 'completed' | 'active' | 'upcoming' {
    if (phaseCompleted || phase < currentPhase) return 'completed'
    // Phase 4 has no current_session tracking per Doc 13 §7.5.
    // phase4_first_accessed written on first nav, phase4_completed_at optional.
    // All sessions accessible throughout. Full session list UI in Phase E.
    if (phase === 4) return 'upcoming'
    if (sessionNum < currentSession) return 'completed'
    if (sessionNum === currentSession) return 'active'
    return 'upcoming'
  }

  return (
    <AuthShell>
      <div className="max-w-[720px] mx-auto py-8">

        {/* Doc 11 G5: phase label — primary colour, uppercase, phase-label type */}
        <p className="text-[12px] font-medium text-primary uppercase tracking-wide mb-1">Phase {phase}</p>
        <h1 className="text-[28px] md:text-[36px] font-bold text-text-heading mb-6">{PHASE_NAMES[phase]}</h1>

        {/* Session list — Phase 3 is served by the static phase-3/page.tsx route */}
        <div className="bg-surface rounded-[12px] border border-border overflow-hidden mb-6">
          {Array.from({ length: maxSessions }, (_, i) => {
            const sessionNum = i + 1
            const status = getSessionStatus(sessionNum)
            // Doc 11 E12: completed + active → bg-background; upcoming → bg-surface
            const rowBg = status === 'upcoming' ? 'bg-surface' : 'bg-background'

            return (
              <Link
                key={sessionNum}
                href={`/framework/phase-${phase}/session-${sessionNum}`}
                className={`flex items-center gap-4 h-[56px] px-6 border-b border-border last:border-b-0 no-underline transition-colors hover:bg-surface-raised ${rowBg}`}
              >
                {/* Doc 11 E12 icon states */}
                <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                  status === 'completed'
                    ? 'bg-primary'
                    : status === 'active'
                    ? 'border-2 border-text-heading'
                    : 'border-2 border-border'
                }`}>
                  {status === 'completed' && (
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path d="M2.5 6l2.5 2.5 4.5-4.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                  {status === 'active' && (
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path d="M3 6h6M6 3l3 3-3 3" stroke="#1A1A2E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                  {status === 'upcoming' && (
                    <div className="w-1.5 h-1.5 rounded-full bg-border" />
                  )}
                </div>

                {/* Doc 11 E12: active → heading/medium; completed + upcoming → text-muted */}
                <span className={`text-[14px] ${
                  status === 'active' ? 'font-medium text-text-heading' : 'text-text-muted'
                }`}>
                  Session {sessionNum}
                </span>

                {/* TODO Phase E: wire duration from framework-manifest once sessions have estimated times */}
              </Link>
            )
          })}
        </div>

      </div>
    </AuthShell>
  )
}
