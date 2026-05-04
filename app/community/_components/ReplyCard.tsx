'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { PostReply } from '@/lib/community/queries'
import { formatTimeAgo } from '@/lib/community/format-time-ago'
import AvatarCircle from './AvatarCircle'
import FounderBadge from './FounderBadge'
import DeleteConfirmModal from '@/components/community/DeleteConfirmModal'

interface Props {
  reply: PostReply
  currentUserId: string
  currentUserIsAdmin: boolean
  onDeleted: (replyId: string) => void
}

export default function ReplyCard({
  reply,
  currentUserId,
  currentUserIsAdmin,
  onDeleted,
}: Props) {
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  const isOwner = reply.author_user_id === currentUserId
  const canDelete = isOwner || currentUserIsAdmin

  const profileHref = reply.author_username
    ? `/profile/${reply.author_username}`
    : null

  const cardClasses = reply.author_is_admin
    ? 'bg-founder-tint border-primary'
    : 'bg-surface border-border'

  async function handleDelete() {
    const res = await fetch('/api/community/replies', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: reply.id }),
    })
    if (!res.ok) throw new Error('delete_failed')
    onDeleted(reply.id)
  }

  return (
    <>
      <article className={`${cardClasses} border rounded-xl p-4`}>
        <div className="flex items-start gap-3 mb-2">
          <AvatarCircle username={reply.author_username} size="sm" />
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] text-text-muted">
            {profileHref ? (
              <Link
                href={profileHref}
                className="font-medium text-text-body hover:text-primary"
              >
                @{reply.author_username}
              </Link>
            ) : (
              <span className="font-medium text-text-body">unknown</span>
            )}
            {reply.author_is_admin && <FounderBadge />}
            <span aria-hidden="true">·</span>
            <span>{formatTimeAgo(reply.created_at)}</span>
          </div>
        </div>

        <div className="text-[14px] text-text-body leading-relaxed whitespace-pre-line ml-[44px]">
          {reply.body}
        </div>

        {canDelete && (
          <div className="flex items-center gap-3 mt-3 ml-[44px]">
            <button
              type="button"
              onClick={() => setShowDeleteModal(true)}
              className="text-[12px] font-medium text-text-muted hover:text-error transition-colors"
            >
              Delete
            </button>
          </div>
        )}
      </article>

      {showDeleteModal && (
        <DeleteConfirmModal
          kind="reply"
          onCancel={() => setShowDeleteModal(false)}
          onConfirm={handleDelete}
        />
      )}
    </>
  )
}
