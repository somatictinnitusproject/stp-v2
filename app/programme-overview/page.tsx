import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import AuthShell from '@/components/shells/AuthShell'
import { PHASE_NAMES } from '@/content/framework-manifest'

type PhaseStatus = 'completed' | 'active' | 'unlocked' | 'locked'

const PHASE_CONTENT: Record<number, { timeline: string; description: string; note?: string }> = {
  1: {
    timeline: '45–75 minutes across one to three sessions',
    description: 'Phase 1 maps your specific pattern — which physical pathways are driving your tinnitus, how significantly each is involved, and what daily factors are maintaining the problem. The system generates a personalised driver profile that shapes everything in Phase 3 and beyond.',
  },
  2: {
    timeline: 'Work through at your own pace',
    description: 'Phase 2 addresses the daily habits that continuously reload tension into the structures your Phase 3 protocol will be working to release. Phase 3 unlocks when you confirm the maintaining factors relevant to your profile are genuinely in place.',
  },
  3: {
    timeline: '8–16 weeks of daily practice',
    description: 'Phase 3 is the primary intervention — structured daily protocol work targeting the specific physical pathways identified in Phase 1. Release phase first, then resistance and retraining phase added on top. Most members are assigned both jaw and cervical protocols.',
  },
  4: {
    timeline: 'Accessible from Phase 2 onwards',
    description: 'Phase 4 addresses the postural and nervous system layer alongside Phase 3. Covers workstation setup, movement pattern integration, breath work, hypervigilance interruption, tinnitus neutralisation, sleep. Recommended during Phase 3 work.',
    note: 'Phase 4 is available alongside Phase 3 from Phase 2 onwards. It is recommended to engage with it during your Phase 3 work rather than waiting until Phase 3 is complete.',
  },
  5: {
    timeline: 'Unlocks when Phase 3 marked complete',
    description: 'Phase 5 covers what resolution actually looks like, the minimum effective maintenance protocol, early warning signs, and how to handle setbacks. The transition from active treatment to stable, maintained improvement.',
  },
}

function getPhaseStatus(
  phase: number,
  currentPhase: number,
  completedAt: Record<number, string | null>,
): PhaseStatus {
  if (completedAt[phase]) return 'completed'
  if (phase === currentPhase) return 'active'
  if (phase === 4 && currentPhase >= 2) return 'unlocked'
  if (phase < currentPhase) return 'completed'
  return 'locked'
}

// Doc 11 F7: text only, 12px/600/uppercase/tracking — no pills or borders
function StatusLabel({ status }: { status: PhaseStatus }) {
  if (status === 'completed') {
    return <span className="text-[12px] font-semibold uppercase tracking-wide text-primary">Completed</span>
  }
  if (status === 'active') {
    return <span className="text-[12px] font-semibold uppercase tracking-wide text-text-heading">Active</span>
  }
  if (status === 'unlocked') {
    return <span className="text-[12px] font-semibold uppercase tracking-wide text-phase-unlocked">Available</span>
  }
  return <span className="text-[12px] font-semibold uppercase tracking-wide text-text-muted">Locked</span>
}

export default async function ProgrammeOverviewPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: progress } = await supabase
    .from('framework_progress')
    .select('current_phase, phase1_completed_at, phase2_completed_at, phase3_completed_at, phase4_completed_at, phase5_completed_at')
    .eq('user_id', user.id)
    .maybeSingle()

  const currentPhase = progress?.current_phase ?? 1
  const completedAt: Record<number, string | null> = {
    1: progress?.phase1_completed_at ?? null,
    2: progress?.phase2_completed_at ?? null,
    3: progress?.phase3_completed_at ?? null,
    4: progress?.phase4_completed_at ?? null,
    5: progress?.phase5_completed_at ?? null,
  }

  return (
    <AuthShell>
      <div className="max-w-[720px] mx-auto py-8">

        <div className="mb-8">
          <h1 className="text-[28px] font-bold text-text-heading">Your programme</h1>
          <p className="text-[15px] text-text-muted mt-1">Five phases. One complete framework.</p>
        </div>

        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map(phase => {
            const status = getPhaseStatus(phase, currentPhase, completedAt)
            const content = PHASE_CONTENT[phase]
            const isNavigable = status === 'completed' || status === 'active' || status === 'unlocked'
            // Doc 11 G7: locked phase descriptions render text-muted
            const descriptionColour = status === 'locked' ? 'text-text-muted' : 'text-text-body'

            const inner = (
              <div className="bg-surface rounded-[12px] border border-border p-5">
                <div className="flex items-start justify-between gap-4 mb-2">
                  <div>
                    <p className="text-[11px] font-medium text-text-muted uppercase tracking-wide mb-0.5">
                      Phase {phase}
                    </p>
                    <h2 className="text-[17px] font-semibold text-text-heading">{PHASE_NAMES[phase]}</h2>
                  </div>
                  <StatusLabel status={status} />
                </div>
                <p className="text-[12px] text-text-muted mb-3">{content.timeline}</p>
                <p className={`text-[14px] leading-relaxed ${descriptionColour}`}>{content.description}</p>
                {content.note && (
                  <p className="text-[13px] text-text-muted mt-3 pt-3 border-t border-border leading-relaxed">
                    {content.note}
                  </p>
                )}
              </div>
            )

            // Doc 12 Section 9.6: completed/active/unlocked → /framework/phase-[N]; locked → nothing
            if (isNavigable) {
              return (
                <Link key={phase} href={`/framework/phase-${phase}`} className="block no-underline">
                  {inner}
                </Link>
              )
            }
            return <div key={phase}>{inner}</div>
          })}
        </div>

        {/* Doc 11 G7: closing note — divider above, italic, body-sm, text-muted, centred, mt-16 */}
        <div className="mt-16 pt-6 border-t border-border">
          <p className="text-[13px] italic text-text-muted text-center leading-relaxed">
            Every phase remains accessible after you have passed through it. Content does not disappear as you advance — you can return to any section at any time. The exercise library is available throughout as a reference resource independent of your current phase.
          </p>
        </div>

      </div>
    </AuthShell>
  )
}
