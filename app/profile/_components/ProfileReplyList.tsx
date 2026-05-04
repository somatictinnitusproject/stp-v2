'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { UserReply } from '@/lib/community/queries'
import { formatTimeAgo } from '@/lib/community/format-time-ago'
import { getCommunitySpace } from '@/content/community-spaces'

interface Props {
  username: string
  initialReplies: UserReply[]
  initialHasMore: boolean
  emptyMessage: string
}

export default function ProfileReplyList({
  username,
  initialReplies,
  initialHasMore,
  emptyMessage,
}: Props) {
  const [replies, setReplies] = useState<UserReply[]>(initialReplies)
  const [hasMore, setHasMore] = useState(initialHasMore)
  const [page, setPage] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function loadMore() {
    if (loading || !hasMore) return
    setLoading(true)
    setError(null)
    try {
      const nextPage = page + 1
      const res = await fetch(
        `/api/profile/replies?username=${encodeURIComponent(username)}&page=${nextPage}`,
      )
      if (!res.ok) throw new Error('load_failed')
      const data: { replies: UserReply[]; hasMore: boolean } = await res.json()
      setReplies((prev) => [...prev, ...data.replies])
      setHasMore(data.hasMore)
      setPage(nextPage)
    } catch {
      setError("Couldn’t load more. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  if (replies.length === 0) {
    return (
      <p className="text-[14px] text-text-muted">{emptyMessage}</p>
    )
  }

  return (
    <div className="space-y-3">
      <ul className="space-y-3">
        {replies.map((reply) => {
          const space = getCommunitySpace(reply.post_space)
          return (
            <li key={reply.id}>
              <Link
                href={`/community/${reply.post_space}/${reply.post_id}`}
                className="block bg-surface border border-border rounded-xl p-4 hover:border-primary transition-colors"
              >
                <div className="flex items-center gap-2 mb-1 text-[13px] text-text-muted">
                  <span>Replied in {space.name} ·</span>
                  <span>{formatTimeAgo(reply.created_at)}</span>
                </div>
                <h3 className="text-[15px] font-medium text-text-heading mb-2">
                  {reply.post_title}
                </h3>
                <p className="text-[14px] text-text-body leading-relaxed line-clamp-3">
                  {reply.body}
                </p>
              </Link>
            </li>
          )
        })}
      </ul>

      {error && (
        <p className="text-[14px] text-error" role="alert">
          {error}
        </p>
      )}

      {hasMore && (
        <button
          type="button"
          onClick={loadMore}
          disabled={loading}
          className="bg-primary hover:bg-primary-hover disabled:opacity-60 disabled:cursor-not-allowed text-white text-[14px] font-medium px-5 py-2.5 rounded-lg transition-colors"
        >
          {loading ? 'Loading…' : 'Load more'}
        </button>
      )}
    </div>
  )
}
