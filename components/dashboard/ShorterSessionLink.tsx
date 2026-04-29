'use client'

// /components/dashboard/ShorterSessionLink.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Renders the "Limited time today? Start a shorter session." link with a
// confirmation modal. Modal appears every tap (no dismissal persistence).
// Per M13i.1 locked decisions: shorter session is a backup option, not a
// default. The modal copy and button hierarchy reinforce this.
//
// Used by /app/dashboard/page.tsx for Phase 3 members. Dashboard handles the
// Phase-3-only and hidden-when-done conditions; this component just renders
// the link + modal once told to render.
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function ShorterSessionLink() {
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()

  const handleConfirm = () => {
    setIsOpen(false)
    router.push('/session/short')
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="text-[12px] text-text-muted hover:text-primary hover:underline transition-colors text-center bg-transparent border-0 p-0 cursor-pointer"
      >
        Limited time today? Start a shorter session.
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
          onClick={() => setIsOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="shorter-session-modal-heading"
        >
          <div
            className="bg-surface rounded-xl border border-border max-w-[420px] w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h2
              id="shorter-session-modal-heading"
              className="text-[18px] font-semibold text-text-heading mb-3"
            >
              Shorter session
            </h2>
            <p className="text-[14px] text-text-body leading-relaxed mb-3">
              The full session is what produces results. The shorter version
              exists for days you genuinely can&apos;t fit the full one in &mdash;
              not as a regular substitute.
            </p>
            <p className="text-[14px] text-text-body leading-relaxed mb-6">
              Used too often, the shorter session slows everything down.
            </p>
            <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 sm:gap-3">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 text-[14px] text-text-muted hover:text-text-body hover:underline transition-colors bg-transparent border-0 cursor-pointer"
              >
                Go back
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                className="px-4 py-2 text-[14px] font-medium text-text-body bg-surface-raised border border-border rounded-lg hover:brightness-95 transition-all cursor-pointer"
              >
                Start shorter session
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
