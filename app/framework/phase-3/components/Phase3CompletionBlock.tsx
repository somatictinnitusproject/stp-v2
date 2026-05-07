'use client'

// app/framework/phase-3/components/Phase3CompletionBlock.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Client component. Renders the Phase 3 completion button, inactive message
// (when gates not yet met), the permanent 8–16 week prompt, and the
// confirmation modal on button tap.
//
// Gate enforcement is server-side (page.tsx); buttonActive is the computed
// result passed as a prop. The server action re-validates both gates before
// writing — the client state is only for UX.
//
// Modal: click-outside-to-close (disabled while submitting). Primary button
// calls advanceAction (server action), then pushes to /dashboard on success.
// On error: console.error only, modal stays open — silent failure per
// locked architecture.
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from 'react'
import { useRouter } from 'next/navigation'

type Props = {
  buttonActive: boolean
  inactiveMessage: string | null
  advanceAction: () => Promise<{ success: boolean; error?: string }>
}

export default function Phase3CompletionBlock({
  buttonActive,
  inactiveMessage,
  advanceAction,
}: Props) {
  const [modalOpen, setModalOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const router = useRouter()

  const handleConfirm = async () => {
    setSubmitting(true)
    const result = await advanceAction()
    if (result.success) {
      router.push('/dashboard')
    } else {
      console.error('[phase-3 advance] error:', result.error)
      setSubmitting(false)
    }
  }

  return (
    <div className="bg-surface border border-border rounded-[12px] p-5">
      {inactiveMessage && (
        <p className="text-[13px] text-text-muted mb-4">{inactiveMessage}</p>
      )}
      <button
        type="button"
        disabled={!buttonActive}
        onClick={buttonActive ? () => setModalOpen(true) : undefined}
        className={`w-full py-3 px-4 rounded-lg text-[16px] font-medium transition-colors ${
          buttonActive
            ? 'bg-primary text-white hover:bg-primary-hover cursor-pointer'
            : 'bg-surface-raised text-text-muted cursor-not-allowed opacity-50'
        }`}
      >
        I have completed my Phase 3 protocol. Move to Phase 5
      </button>
      <p className="text-[13px] text-text-muted mt-4 leading-relaxed">
        Most members find Phase 3 takes eight to sixteen weeks to produce meaningful
        and stable change. Mark complete when your physical indicators and progress
        tracker data reflect genuine improvement, not when a minimum has elapsed.
      </p>

      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
          onClick={() => !submitting && setModalOpen(false)}
        >
          <div
            className="bg-surface border border-border rounded-[12px] p-6 max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-[14px] text-text-body leading-relaxed mb-6">
              Are you sure? Phase 5 covers stabilisation and maintenance. Phase 3
              content remains fully accessible after advancing.
            </p>
            <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 sm:gap-3">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                disabled={submitting}
                className="px-4 py-2 text-[14px] text-text-body bg-surface border border-border rounded-lg hover:bg-surface-raised transition-colors cursor-pointer disabled:opacity-50"
              >
                Not yet
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                disabled={submitting}
                className="px-4 py-2 text-[14px] font-medium text-white bg-primary hover:bg-primary-hover rounded-lg transition-colors cursor-pointer disabled:opacity-50"
              >
                {submitting ? 'Advancing…' : 'Yes, advance to Phase 5'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
