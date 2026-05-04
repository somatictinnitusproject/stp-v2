'use client'

import { useState } from 'react'

interface Props {
  kind: 'post' | 'reply'
  onCancel: () => void
  onConfirm: () => Promise<void> | void
}

// Generic destructive confirmation modal for soft-deleting a
// post or a reply. Backdrop click cancels; explicit Delete
// button confirms. Mirrors CharterModal's structure.
export default function DeleteConfirmModal({
  kind,
  onCancel,
  onConfirm,
}: Props) {
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const noun = kind === 'post' ? 'post' : 'reply'

  async function handleConfirm() {
    setSubmitting(true)
    setError(null)
    try {
      await onConfirm()
    } catch {
      setError('Something went wrong. Please try again.')
      setSubmitting(false)
    }
  }

  return (
    <>
      <div
        className="fixed inset-0 bg-black/40 z-30"
        aria-hidden="true"
        onClick={submitting ? undefined : onCancel}
      />
      <div
        className="fixed inset-0 z-40 flex items-center justify-center p-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-confirm-heading"
      >
        <div className="bg-surface w-full max-w-[420px] rounded-2xl shadow-xl p-6">
          <h2
            id="delete-confirm-heading"
            className="text-[18px] font-semibold leading-tight text-text-heading mb-3"
          >
            Delete this {noun}?
          </h2>
          <p className="text-[14px] text-text-body mb-5 leading-relaxed">
            This cannot be undone.
          </p>

          {error && (
            <p
              className="text-[14px] text-error mb-4"
              role="alert"
            >
              {error}
            </p>
          )}

          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onCancel}
              disabled={submitting}
              className="text-[14px] font-medium text-text-muted hover:text-text-body px-4 py-2 transition-colors disabled:opacity-60"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={submitting}
              className="border border-error text-error hover:bg-error-tint disabled:opacity-60 disabled:cursor-not-allowed text-[14px] font-medium px-4 py-2 rounded-lg transition-colors"
            >
              {submitting ? 'Deleting…' : `Delete ${noun}`}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
