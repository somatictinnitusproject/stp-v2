'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  COMMUNITY_SPACES,
  type CommunitySpaceSlug,
} from '@/content/community-spaces'

interface Props {
  initialSpace: CommunitySpaceSlug
}

const MAX_TITLE_LENGTH = 200
const MAX_BODY_LENGTH = 5000
const BODY_COUNTER_THRESHOLD = MAX_BODY_LENGTH - 500

export default function NewPostForm({ initialSpace }: Props) {
  const router = useRouter()

  const [space, setSpace] = useState<CommunitySpaceSlug>(initialSpace)
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const trimmedTitle = title.trim()
  const trimmedBody = body.trim()

  const titleValid =
    trimmedTitle.length >= 1 && trimmedTitle.length <= MAX_TITLE_LENGTH
  const bodyValid =
    trimmedBody.length >= 1 && trimmedBody.length <= MAX_BODY_LENGTH

  const canSubmit = titleValid && bodyValid && !submitting
  const showBodyCounter = body.length >= BODY_COUNTER_THRESHOLD
  const bodyOverLimit = body.length > MAX_BODY_LENGTH

  async function handleSubmit() {
    if (!canSubmit) return
    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch('/api/community/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          space,
          title: trimmedTitle,
          body: trimmedBody,
        }),
      })
      if (!res.ok) throw new Error('post_failed')
      const data: { post: { id: string; space: CommunitySpaceSlug } } =
        await res.json()
      router.push(`/community/${data.post.space}/${data.post.id}`)
    } catch {
      setError(
        'Something went wrong. Your post was not saved. Please try again.',
      )
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-5">
      {/* Space selector */}
      <div>
        <label
          htmlFor="post-space"
          className="block text-[14px] font-medium text-text-body mb-2"
        >
          Space
        </label>
        <select
          id="post-space"
          value={space}
          onChange={(e) =>
            setSpace(e.target.value as CommunitySpaceSlug)
          }
          disabled={submitting}
          className="w-full bg-surface border border-border rounded-lg px-4 py-3 text-[16px] text-text-body focus:outline-none focus:border-primary focus:shadow-input-focus disabled:opacity-60"
        >
          {COMMUNITY_SPACES.map((s) => (
            <option key={s.slug} value={s.slug}>
              {s.name}
            </option>
          ))}
        </select>
      </div>

      {/* Title */}
      <div>
        <label
          htmlFor="post-title"
          className="block text-[14px] font-medium text-text-body mb-2"
        >
          Title
        </label>
        <input
          id="post-title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="What&#8217;s on your mind?"
          maxLength={MAX_TITLE_LENGTH}
          disabled={submitting}
          className="w-full bg-surface border border-border rounded-lg px-4 py-3 text-[16px] text-text-body placeholder:text-text-muted focus:outline-none focus:border-primary focus:shadow-input-focus disabled:opacity-60"
        />
      </div>

      {/* Body */}
      <div>
        <label
          htmlFor="post-body"
          className="block text-[14px] font-medium text-text-body mb-2"
        >
          Post
        </label>
        <textarea
          id="post-body"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Share your experience, question, or update..."
          rows={8}
          maxLength={MAX_BODY_LENGTH}
          disabled={submitting}
          className="w-full bg-background border border-border rounded-lg p-3 text-[16px] text-text-body placeholder:text-text-muted focus:outline-none focus:border-primary resize-y disabled:opacity-60"
        />
        {showBodyCounter && (
          <div className="text-[12px] text-text-muted mt-1 text-right">
            <span className={bodyOverLimit ? 'text-error' : ''}>
              {body.length}/{MAX_BODY_LENGTH}
            </span>
          </div>
        )}
      </div>

      {error && (
        <p
          className="text-[14px] text-error"
          role="alert"
        >
          {error}
        </p>
      )}

      {/* Buttons */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <Link
          href={`/community/${initialSpace}`}
          className="text-[14px] font-medium text-text-muted hover:text-text-body px-4 py-2 transition-colors"
          aria-disabled={submitting}
        >
          Cancel
        </Link>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!canSubmit || bodyOverLimit}
          className="bg-primary hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed text-white text-[14px] font-medium px-5 py-2.5 rounded-lg transition-colors"
        >
          {submitting ? 'Posting…' : 'Post'}
        </button>
      </div>
    </div>
  )
}
