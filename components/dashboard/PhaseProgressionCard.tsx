import Link from 'next/link'

type PhaseStatus = 'completed' | 'active' | 'locked' | 'unlocked'

type Props = {
  currentPhase: number
  completedAtMap: Record<number, boolean>
  resistancePhaseStart: string | null
}

// Short phase names — used on the dashboard progression blocks to fit 80px width
const SHORT_NAMES: Record<number, string> = {
  1: 'Identification',
  2: 'Foundations',
  3: 'Protocols',
  4: 'Maintaining',
  5: 'Stabilisation',
}

const STYLES: Record<PhaseStatus, { bg: string; border: string; color: string }> = {
  completed: { bg: '#EEF7F5', border: '1.5px solid #4A9B8E', color: '#4A9B8E' },
  active:    { bg: '#FFFFFF', border: '2px solid #1A1A2E',   color: '#1A1A2E' },
  locked:    { bg: '#F2F0EC', border: '1px solid #E5E3DF',   color: '#6B7280' },
  unlocked:  { bg: '#EDF2F8', border: '1.5px solid #5B8DB8', color: '#5B8DB8' },
}

const STATUS_LABELS: Record<PhaseStatus, string> = {
  completed: '\u2713 Done',
  active:    'Active',
  locked:    'Locked',
  unlocked:  'Available',
}

function getStatus(
  phase: number,
  currentPhase: number,
  completedAtMap: Record<number, boolean>
): PhaseStatus {
  if (completedAtMap[phase]) return 'completed'
  if (phase === currentPhase) return 'active'
  if (phase === 4 && currentPhase >= 2) return 'unlocked'
  if (phase < currentPhase) return 'completed'
  return 'locked'
}

export default function PhaseProgressionCard({
  currentPhase,
  completedAtMap,
  resistancePhaseStart,
}: Props) {
  return (
    <div className="bg-surface border border-border rounded-xl p-4">
      <p className="text-[13px] font-semibold text-text-heading mb-3">Your programme</p>
      <div
        className="flex flex-nowrap gap-2 overflow-x-auto pb-1 [&::-webkit-scrollbar]:hidden"
        style={{ scrollbarWidth: 'none' }}
      >
        {[1, 2, 3, 4, 5].map(phase => {
          const status = getStatus(phase, currentPhase, completedAtMap)
          const s = STYLES[status]

          const content = (
            <div
              className="min-w-[80px] h-[72px] rounded-[10px] p-[10px] flex flex-col justify-between flex-shrink-0"
              style={{ background: s.bg, border: s.border }}
            >
              <div
                className="text-[10px] font-semibold uppercase tracking-[0.08em]"
                style={{ color: s.color }}
              >
                <span className="hidden md:inline">P{phase}</span>
                <span className="md:hidden">Phase {phase}</span>
              </div>
              <div className="flex flex-col">
                <div className="text-[11px] font-semibold leading-tight" style={{ color: s.color }}>
                  {SHORT_NAMES[phase]}
                </div>
                {phase === 3 && status === 'active' && (
                  <div className="text-[10px] mt-[2px]" style={{ color: '#6B7280' }}>
                    {resistancePhaseStart ? 'Release + Resistance' : 'Release Phase'}
                  </div>
                )}
                <div
                  className="text-[11px] font-semibold uppercase tracking-[0.06em] mt-[2px]"
                  style={{ color: s.color }}
                >
                  {STATUS_LABELS[status]}
                </div>
              </div>
            </div>
          )

          if (status === 'locked') {
            return <div key={phase} className="flex-1 flex">{content}</div>
          }
          return (
            <Link key={phase} href={`/framework/phase-${phase}`} className="flex-1 flex no-underline">
              {content}
            </Link>
          )
        })}
      </div>
    </div>
  )
}
