// app/framework/phase-3/components/StateSummary.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Server component. Pure presentation — renders the Phase 3 state summary
// card: release-since date, resistance state, and day count.
// Three lines per M13k Locked Decision 1. No interactivity.
// ─────────────────────────────────────────────────────────────────────────────

type StateSummaryProps = {
  releasePhaseSince: string
  resistanceState: { startDate: string } | null
  daysIntoPhase3: number
}

export default function StateSummary({
  releasePhaseSince,
  resistanceState,
  daysIntoPhase3,
}: StateSummaryProps) {
  return (
    <div className="bg-surface border border-border rounded-[12px] p-5 mb-6">
      <p className="text-[14px] text-text-body leading-relaxed mb-2">
        Release phase since {releasePhaseSince}.
      </p>
      {resistanceState ? (
        <p className="text-[14px] text-text-body leading-relaxed mb-2">
          Resistance phase since {resistanceState.startDate}.
        </p>
      ) : (
        <p className="text-[14px] text-text-body leading-relaxed mb-2">
          Resistance phase not yet acknowledged. You&apos;ll begin the resistance phase
          from D.13 (TMJ) or E.12 (cervical) inside today&apos;s session.
        </p>
      )}
      <p className="text-[14px] text-text-body leading-relaxed">
        Day {daysIntoPhase3} of Phase 3.
      </p>
    </div>
  )
}
