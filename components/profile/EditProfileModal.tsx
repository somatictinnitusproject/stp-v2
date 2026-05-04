'use client'

import { useState } from 'react'

interface Props {
  initialBio: string | null
  onCancel: () => void
  onSaved: (bio: string | null) => void
}

const MAX_BIO_LENGTH = 300

export default function EditProfileModal({
  initialBio,
  onCancel,
  onSaved,
}: Props) {
  const [bio, setBio] = useState(initialBio ?? '')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const trimmed = bio.trim()
  const overLimit = trimmed.length > MAX_BIO_LENGTH

  async function handleSave() {
    if (overLimit || submitting) return
    setSubmitting(true)
    setError(null)
    try {
      const payload = trimmed.length === 0 ? null : trimmed
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bio: payload }),
      })
      if (!res.ok) throw new Error('save_failed')
      const data: { user: { bio: string | null } } = await res.json()
      onSaved(data.user.bio)
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
        aria-labelledby="edit-profile-heading"
      >
        <div className="bg-surface w-full max-w-[480px] rounded-2xl shadow-xl p-6">
          <h2
            id="edit-profile-heading"
            className="text-[18px] font-semibold leading-tight text-text-heading mb-4"
          >
            Edit profile
          </h2>

          <label
            htmlFor="profile-bio"
            className="block text-[14px] font-medium text-text-body mb-2"
          >
            Bio
          </label>
          <textarea
            id="profile-bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="A sentence or two about you (optional)"
            rows={4}
            maxLength={MAX_BIO_LENGTH + 50}
            disabled={submitting}
            className="w-full bg-background border border-border rounded-lg p-3 text-[16px] text-text-body placeholder:text-text-muted focus:outline-none focus:border-primary resize-y disabled:opacity-60"
          />
          <div className="flex items-center justify-between mt-1">
            <span className="text-[12px] text-text-muted">
              Optional. Max {MAX_BIO_LENGTH} characters.
            </span>
            <span
              className={`text-[12px] ${overLimit ? 'text-error' : 'text-text-muted'}`}
            >
              {trimmed.length}/{MAX_BIO_LENGTH}
            </span>
          </div>

          {error && (
            <p className="text-[14px] text-error mt-3" role="alert">
              {error}
            </p>
          )}

          <div className="flex items-center justify-end gap-3 mt-5">
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
              onClick={handleSave}
              disabled={overLimit || submitting}
              className="bg-primary hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed text-white text-[14px] font-medium px-5 py-2.5 rounded-lg transition-colors"
            >
              {submitting ? 'Saving…' : 'Save'}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
