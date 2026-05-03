import type { LucideIcon } from 'lucide-react'

type CardKind =
  | 'positive_strong'
  | 'positive_moderate'
  | 'positive_weak'
  | 'inverse_strong'
  | 'inverse_moderate'
  | 'inverse_weak'
  | 'best_worst'

interface Props {
  kind: CardKind
  icon: LucideIcon
  headline: string
  body: React.ReactNode
  strengthLabel?: 'Strong' | 'Moderate' | 'Weak'
  cervicalModifierText?: string
}

function cardClasses(kind: CardKind): string {
  if (kind === 'positive_strong' || kind === 'inverse_strong') {
    return 'bg-wins-bg border-wins-border'
  }
  return 'bg-surface border-border'
}

function iconClasses(kind: CardKind): string {
  if (kind === 'positive_strong' || kind === 'inverse_strong') {
    return 'text-primary'
  }
  return 'text-text-muted'
}

export default function InsightCard({
  kind,
  icon: Icon,
  headline,
  body,
  strengthLabel,
  cervicalModifierText,
}: Props) {
  const isWeak = kind === 'positive_weak' || kind === 'inverse_weak'

  return (
    <div className={`rounded-xl border p-5 ${cardClasses(kind)}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <Icon size={20} className={`flex-shrink-0 ${iconClasses(kind)}`} />
          <p className="text-[15px] font-semibold text-text-heading leading-snug">{headline}</p>
        </div>
        {strengthLabel && (
          <span className="text-[11px] font-medium tracking-wider uppercase text-text-muted flex-shrink-0 mt-0.5">
            {strengthLabel}
          </span>
        )}
      </div>

      <div className="text-[14px] text-text-body leading-relaxed mt-2">{body}</div>

      {isWeak && (
        <p className="text-[13px] text-text-muted italic mt-2">
          This is an early pattern — it may strengthen as more data accumulates.
        </p>
      )}

      {cervicalModifierText && (
        <p className="text-[13px] text-text-muted italic mt-2">{cervicalModifierText}</p>
      )}
    </div>
  )
}
