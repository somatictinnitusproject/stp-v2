'use client'

import type { NudgeData } from '@/content/framework/phase-2/nudges'

type NudgeCardProps = {
  nudge: NudgeData
  onDismiss: () => void
  dismissDisabled: boolean  // true while dismiss POST is in flight
}

export default function NudgeCard(props: NudgeCardProps) {
  return (
    <div className="mt-10 pt-8 border-t border-border">
      <div className="relative bg-surface border-l-[3px] border-primary rounded-r-[8px] px-5 py-4 mb-8">
        {/* Dismiss-X in top-right */}
        <button
          onClick={props.onDismiss}
          disabled={props.dismissDisabled}
          aria-label="Dismiss this recommendation"
          className="absolute top-3 right-3 w-6 h-6 flex items-center justify-center text-text-muted hover:text-text-body transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className="text-[18px] leading-none">&times;</span>
        </button>

        {/* Title */}
        <p className="text-body-sm font-semibold text-text-heading uppercase tracking-[0.06em] mb-2 pr-8">
          {props.nudge.title}
        </p>

        {/* Body */}
        <p className="text-body-sm text-text-body pr-8">
          {props.nudge.body}
        </p>
      </div>
    </div>
  )
}
