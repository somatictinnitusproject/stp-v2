'use client'

import { useEffect, useRef, useId } from 'react'

type DefaultConfirmModalProps = {
  open: boolean
  onConfirm: () => void
  onCancel: () => void
}

export default function DefaultConfirmModal({ open, onConfirm, onCancel }: DefaultConfirmModalProps) {
  const headingId = useId()
  const ghostRef = useRef<HTMLButtonElement>(null)
  const confirmRef = useRef<HTMLButtonElement>(null)

  // Focus "Let me adjust" on open — prevents accidental submit on Enter
  useEffect(() => {
    if (open) ghostRef.current?.focus()
  }, [open])

  if (!open) return null

  // Two-button focus trap. If this component is generalised
  // into a reusable <Modal /> post-Phase D, replace with a
  // dynamic focusable-elements query pattern.
  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Escape') {
      onCancel()
      return
    }
    if (e.key === 'Tab') {
      e.preventDefault()
      const focused = document.activeElement
      if (e.shiftKey) {
        if (focused === ghostRef.current) confirmRef.current?.focus()
        else ghostRef.current?.focus()
      } else {
        if (focused === confirmRef.current) ghostRef.current?.focus()
        else confirmRef.current?.focus()
      }
    }
  }

  return (
    // Backdrop — transparent on mobile (panel fills screen), dark overlay on desktop
    <div className="fixed inset-0 z-overlay modal-fade-in min-[480px]:bg-black/40 min-[480px]:flex min-[480px]:items-center min-[480px]:justify-center min-[480px]:px-4">
      {/* Panel — fills viewport on mobile, centred card on desktop */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={headingId}
        onKeyDown={handleKeyDown}
        className="bg-surface-overlay w-full h-full flex flex-col p-8 z-modal min-[480px]:h-auto min-[480px]:max-w-modal min-[480px]:rounded-xl min-[480px]:shadow-modal"
      >
        <h2 id={headingId} className="text-heading-2 text-text-heading mb-8">
          All sliders are at 5 — does that reflect today accurately?
        </h2>

        {/* Ghost left, primary right, 16px gap — mt-auto pushes to bottom on full-screen mobile */}
        <div className="flex gap-4 mt-auto min-[480px]:mt-0">
          <button
            ref={ghostRef}
            type="button"
            onClick={onCancel}
            className="flex-1 min-h-[44px] bg-transparent text-primary text-btn-primary px-5 py-2.5 rounded-lg hover:bg-wins-bg transition-colors duration-150"
          >
            Let me adjust
          </button>
          <button
            ref={confirmRef}
            type="button"
            onClick={onConfirm}
            className="flex-1 min-h-[44px] bg-primary text-white text-btn-primary px-5 py-2.5 rounded-lg hover:bg-primary-hover active:bg-primary-active transition-colors duration-150"
          >
            Yes, submit
          </button>
        </div>
      </div>
    </div>
  )
}
