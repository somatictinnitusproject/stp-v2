'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Pin } from 'lucide-react'
import type { PostWithReplies } from '@/lib/community/queries'
import { formatTimeAgo } from '@/lib/community/format-time-ago'
import AvatarCircle from './AvatarCircle'
import FounderBadge from './FounderBadge'
import PostMenu from './PostMenu'
import DeleteConfirmModal from '@/components/community/DeleteConfirmModal'

interface Props {
  post: PostWithReplies
  currentUserId: string
  currentUserIsAdmin: boolean
}

export default function PostDetail({
  post: initialPost,
  currentUserId,
  currentUserIsAdmin,
}: Props) {
  const router = useRouter()

  const [post, setPost] = useState(initialPost)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [pinError, setPinError] = useState<string | null>(null)

  const isOwner = post.author_user_id === currentUserId
  const canDelete = isOwner || currentUserIsAdmin
  const canPin = currentUserIsAdmin

  const profileHref = post.author_username
    ? `/profile/${post.author_username}`
    : null

  async function handlePinToggle() {
    setPinError(null)
    const next = !post.is_pinned
    setPost((prev) => ({ ...prev, is_pinned: next }))
    try {
      const res = await fetch('/api/community/posts', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: post.id, is_pinned: next }),
      })
      if (!res.ok) throw new Error('pin_failed')
    } catch {
      setPost((prev) => ({ ...prev, is_pinned: !next }))
      setPinError("Couldn't update pin. Please try again.")
    }
  }

  async function handleDelete() {
    const res = await fetch('/api/community/posts', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: post.id }),
    })
    if (!res.ok) throw new Error('delete_failed')
    router.push(`/community/${post.space}`)
  }

  return (
    <>
      <article className="relative bg-surface border border-border rounded-xl p-5 md:p-6 mb-6">
        {post.is_pinned && (
          <div className="absolute top-4 right-12 flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide text-primary">
            <Pin className="w-3 h-3" strokeWidth={2.25} />
            Pinned
          </div>
        )}

        <div className="flex items-start gap-3 mb-4">
          <AvatarCircle username={post.author_username} />
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] text-text-muted">
              {profileHref ? (
                <Link
                  href={profileHref}
                  className="font-medium text-text-body hover:text-primary"
                >
                  @{post.author_username}
                </Link>
              ) : (
                <span className="font-medium text-text-body">unknown</span>
              )}
              {post.author_is_admin && <FounderBadge />}
              <span aria-hidden="true">·</span>
              <span>{formatTimeAgo(post.created_at)}</span>
            </div>
          </div>
          <div className="flex-shrink-0">
            <PostMenu
              canDelete={canDelete}
              canPin={canPin}
              isPinned={post.is_pinned}
              onPinToggle={handlePinToggle}
              onDeleteClick={() => setShowDeleteModal(true)}
            />
          </div>
        </div>

        <h1 className="text-[24px] md:text-[28px] font-semibold leading-tight text-text-heading mb-3">
          {post.title}
        </h1>
        <div className="text-[15px] text-text-body leading-relaxed whitespace-pre-line">
          {post.body}
        </div>

        {pinError && (
          <p className="text-[13px] text-error mt-3" role="alert">
            {pinError}
          </p>
        )}
      </article>

      {showDeleteModal && (
        <DeleteConfirmModal
          kind="post"
          onCancel={() => setShowDeleteModal(false)}
          onConfirm={handleDelete}
        />
      )}
    </>
  )
}
