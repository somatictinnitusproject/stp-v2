'use client'

// C.9 — Phase 2 → Phase 3 Transition Screen client component.
// Renders once on first Phase 3 entry. CTA navigates back to same URL
// — server-side branching falls through to Phase 3 default stub on the
// second render (phase3_first_accessed is now set).

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { C9Transition } from '@/content/framework/phase-2/c9-transition'

type Session1Phase3TransitionClientProps = {
  content: C9Transition
  bodyParagraph2: string  // pre-templated by page.tsx
}

export default function Session1Phase3TransitionClient(
  props: Session1Phase3TransitionClientProps,
) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  function handleBegin() {
    if (loading) return
    setLoading(true)
    // phase3_first_accessed was already written server-side at render
    // time. We just navigate — page.tsx re-reads progress and falls
    // through to Phase 3 default stub.
    router.refresh()
    router.push('/framework/phase-3/session-1')
  }

  return (
    <div className="max-w-[680px] mx-auto pt-10 pb-16">

      {/* Headline */}
      <h1 className="text-[28px] md:text-[36px] font-bold leading-[1.2] text-text-heading mb-8">
        {props.content.headline}
      </h1>

      {/* Body paragraph 1 */}
      <p className="text-body text-text-body mb-6">
        {props.content.bodyParagraph1}
      </p>

      {/* Body paragraph 2 (pre-templated with profile callback) */}
      <p className="text-body text-text-body mb-10">
        {props.bodyParagraph2}
      </p>

      {/* CTA button */}
      <div className="mt-10 pt-8 border-t border-border">
        <button
          onClick={handleBegin}
          disabled={loading}
          className={`w-full md:w-auto md:px-8 h-11 rounded-[8px] text-btn-primary transition-colors ${
            loading
              ? 'bg-primary-disabled text-white cursor-not-allowed'
              : 'bg-primary text-white hover:bg-primary-hover'
          }`}
        >
          {loading ? 'Loading\u2026' : props.content.ctaLabel}
        </button>
      </div>

    </div>
  )
}
