'use client'

import { useState } from 'react'
import type { PostReply } from '@/lib/community/queries'

interface Props {
  postId: string
  // Called by the form on successful insert with the new reply
  // so the parent can append optimistically.
  onReplyPosted: (reply: PostReply) => void
}

const MAX_REPLY_LENGTH = 2000
const COUNTER_THRESHOLD = MAX_REPLY_LENGTH - 200

export default function ReplyForm({ postId, onReplyPosted }: Props) {
  const [body, setBody] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const trimmed = body.trim()
  const canSubmit = trimmed.length >= 1 && !submitting

  async function handleSubmit() {
    if (!canSubmit) return
    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch('/api/community/replies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ post_id: postId, body: trimmed }),
      })
      if (!res.ok) throw new Error('reply_failed')
      const data: { reply: PostReply } = await res.json()
      onReplyPosted(data.reply)
      setBody('')
      // Blur the textarea — closes the mobile keyboard. New
      // reply is the last item in the list and naturally
      // visible; we don't auto-scroll.
      const el = document.activeElement
      if (el instanceof HTMLElement) el.blur()
    } catch {
      setError('Something went wrong. Your reply was not posted. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const showCounter = body.length >= COUNTER_THRESHOLD
  const overLimit = body.length > MAX_REPLY_LENGTH

  return (
    <div className="bg-surface border-t md:border md:rounded-xl border-border p-4 md:p-5">
      <label htmlFor="reply-body" className="sr-only">
        Write a reply
      </label>
      <textarea
        id="reply-body"
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="Write a reply..."
        rows={3}
        maxLength={MAX_REPLY_LENGTH}
        className="w-full bg-background border border-border rounded-lg p-3 text-[16px] text-text-body placeholder:text-text-muted focus:outline-none focus:border-primary resize-y"
      />
      <div className="flex items-center justify-between mt-2 gap-3">
        <div className="text-[12px] text-text-muted">
          {showCounter && (
            <span className={overLimit ? 'text-error' : ''}>
              {body.length}/{MAX_REPLY_LENGTH}
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!canSubmit || overLimit}
          className="bg-primary hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed text-white text-[14px] font-medium px-4 py-2 rounded-lg transition-colors"
        >
          {submitting ? 'Posting…' : 'Post reply'}
        </button>
      </div>
      {error && (
        <p
          className="text-[14px] text-error mt-3"
          role="alert"
        >
          {error}
        </p>
      )}
    </div>
  )
}
