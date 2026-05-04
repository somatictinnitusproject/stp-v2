'use client'

import { useState } from 'react'
import type { SpacePost } from '@/lib/community/queries'
import type { CommunitySpaceSlug } from '@/content/community-spaces'
import PostCard from './PostCard'
import SpaceEmptyState from './SpaceEmptyState'

interface Props {
  spaceSlug: CommunitySpaceSlug
  initialPosts: SpacePost[]
  initialHasMore: boolean
}

// Client component that holds the paginated post list. First
// page is rendered server-side and passed in. Subsequent pages
// fetched via /api/community/posts.
export default function PostList({
  spaceSlug,
  initialPosts,
  initialHasMore,
}: Props) {
  const [posts, setPosts] = useState<SpacePost[]>(initialPosts)
  const [hasMore, setHasMore] = useState(initialHasMore)
  const [page, setPage] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (posts.length === 0) {
    return <SpaceEmptyState spaceSlug={spaceSlug} />
  }

  async function handleLoadMore() {
    setLoading(true)
    setError(null)
    try {
      const nextPage = page + 1
      const res = await fetch(
        `/api/community/posts?space=${spaceSlug}&page=${nextPage}`,
      )
      if (!res.ok) throw new Error('fetch_failed')
      const data: { posts: SpacePost[]; hasMore: boolean } =
        await res.json()
      setPosts((prev) => [...prev, ...data.posts])
      setHasMore(data.hasMore)
      setPage(nextPage)
    } catch {
      setError('Couldn’t load more posts. Try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <ul className="space-y-3">
        {posts.map((post) => (
          <li key={post.id}>
            <PostCard post={post} />
          </li>
        ))}
      </ul>

      {error && (
        <p className="text-[14px] text-error mt-4 text-center" role="alert">
          {error}
        </p>
      )}

      {hasMore && (
        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={handleLoadMore}
            disabled={loading}
            className="inline-block bg-surface border border-border hover:border-primary text-text-body text-[14px] font-medium px-5 py-2.5 rounded-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? 'Loading…' : 'Load more'}
          </button>
        </div>
      )}
    </div>
  )
}
