'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Pin } from 'lucide-react'
import type { SpacePost } from '@/lib/community/queries'
import { formatTimeAgo } from '@/lib/community/format-time-ago'
import { getBodyPreview } from '@/lib/community/preview'
import { getCommunitySpace } from '@/content/community-spaces'

interface Props {
  username: string
  initialPosts: SpacePost[]
  initialHasMore: boolean
  emptyMessage: string
}

export default function ProfilePostList({
  username,
  initialPosts,
  initialHasMore,
  emptyMessage,
}: Props) {
  const [posts, setPosts] = useState<SpacePost[]>(initialPosts)
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
        `/api/profile/posts?username=${encodeURIComponent(username)}&page=${nextPage}`,
      )
      if (!res.ok) throw new Error('load_failed')
      const data: { posts: SpacePost[]; hasMore: boolean } = await res.json()
      setPosts((prev) => [...prev, ...data.posts])
      setHasMore(data.hasMore)
      setPage(nextPage)
    } catch {
      setError("Couldn’t load more. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  if (posts.length === 0) {
    return (
      <p className="text-[14px] text-text-muted">{emptyMessage}</p>
    )
  }

  return (
    <div className="space-y-3">
      <ul className="space-y-3">
        {posts.map((post) => {
          const space = getCommunitySpace(post.space)
          return (
            <li key={post.id}>
              <Link
                href={`/community/${post.space}/${post.id}`}
                className="block bg-surface border border-border rounded-xl p-5 hover:border-primary transition-colors"
              >
                <div className="flex items-center gap-2 mb-2 text-[13px] text-text-muted">
                  <span className="font-medium text-text-body">
                    {space.name}
                  </span>
                  {post.is_pinned && (
                    <span className="flex items-center gap-1 text-primary">
                      <Pin className="w-3 h-3" strokeWidth={2.25} />
                      Pinned
                    </span>
                  )}
                  <span aria-hidden="true">·</span>
                  <span>{formatTimeAgo(post.created_at)}</span>
                </div>
                <h3 className="text-[18px] font-semibold text-text-heading leading-snug mb-1">
                  {post.title}
                </h3>
                <p className="text-[14px] text-text-muted leading-relaxed mb-2">
                  {getBodyPreview(post.body)}
                </p>
                <p className="text-[13px] text-text-muted">
                  {post.reply_count}{' '}
                  {post.reply_count === 1 ? 'reply' : 'replies'}
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
