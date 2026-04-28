'use client'

// /components/exercise/expand-toggle.tsx
// Client component. Wraps the "Read full explanation" affordance in condensed view.
// Per Doc 12 §6.5: state NOT persisted — collapses on next visit.

import { useState, type ReactNode } from 'react'

interface ExpandToggleProps {
  expandedContent: ReactNode
  collapsedLabel?: string
  expandedLabel?: string
}

export function ExpandToggle({
  expandedContent,
  collapsedLabel = 'Read full explanation',
  expandedLabel = 'Hide full explanation',
}: ExpandToggleProps) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div>
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="min-h-[44px] min-w-[44px] flex items-center text-primary hover:text-primary-hover text-body font-medium transition-colors"
      >
        <span className="underline underline-offset-2">
          {expanded ? expandedLabel : collapsedLabel}
        </span>
      </button>
      {expanded && (
        <div className="mt-4">
          {expandedContent}
        </div>
      )}
    </div>
  )
}

export default ExpandToggle
