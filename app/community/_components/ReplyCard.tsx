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
  // Notifies parent so it can update its replies list state
  // when the reply is edited or deleted.
  onEdited: (updated: PostReply) => void
  onDeleted: (replyId: string) => void
}

const MAX_REPLY_LENGTH = 2000

export default function ReplyCard({
  reply,
  currentUserId,
  currentUserIsAdmin,
  onEdited,
  onDeleted,
}: Props) {
  const [editing, setEditing] = useState(false)
  const [editBody, setEditBody] = useState(reply.body)
  const [saving, setSaving] = useState(false)
  const [editError, setEditError] = useState<string | null>(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  const isOwner = reply.author_user_id === currentUserId
  const canEdit = isOwner || currentUserIsAdmin
  const canDelete = isOwner || currentUserIsAdmin

  const profileHref = reply.author_username
    ? `/profile/${reply.author_username}`
    : null

  const cardClasses = reply.author_is_admin
    ? 'bg-founder-tint border-primary'
    : 'bg-surface border-border'

  const trimmed = editBody.trim()
  const editValid = trimmed.length >= 1 && trimmed.length <= MAX_REPLY_LENGTH

  async function handleSave() {
    if (!editValid || saving) return
    setSaving(true)
    setEditError(null)
    try {
      const res = await fetch('/api/community/replies', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: reply.id, body: trimmed }),
      })
      if (!res.ok) throw new Error('save_failed')
      const data: {
        reply: { body: string; edited_at: string }
      } = await res.json()
      onEdited({
        ...reply,
        body: data.reply.body,
        edited_at: data.reply.edited_at,
      })
      setEditing(false)
    } catch {
      setEditError('Something went wrong. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  function handleCancelEdit() {
    setEditBody(reply.body)
    setEditError(null)
    setEditing(false)
  }

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
      <article
        className={`${cardClasses} border rounded-xl p-4`}
      >
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
            {reply.edited_at && (
              <>
                <span aria-hidden="true">·</span>
                <span className="italic">
                  edited {formatTimeAgo(reply.edited_at)}
                </span>
              </>
            )}
          </div>
        </div>

        {editing ? (
          <div className="ml-[44px] space-y-2">
            <textarea
              value={editBody}
              onChange={(e) => setEditBody(e.target.value)}
              rows={3}
              maxLength={MAX_REPLY_LENGTH}
              disabled={saving}
              className="w-full bg-background border border-border rounded-lg p-3 text-[16px] text-text-body focus:outline-none focus:border-primary resize-y disabled:opacity-60"
            />
            {editError && (
              <p className="text-[14px] text-error" role="alert">
                {editError}
              </p>
            )}
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={handleCancelEdit}
                disabled={saving}
                className="text-[13px] font-medium text-text-muted hover:text-text-body px-3 py-1.5 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={!editValid || saving}
                className="bg-primary hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed text-white text-[13px] font-medium px-4 py-1.5 rounded-lg transition-colors"
              >
                {saving ? 'Saving…' : 'Save'}
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="text-[14px] text-text-body leading-relaxed whitespace-pre-line ml-[44px]">
              {reply.body}
            </div>

            {(canEdit || canDelete) && (
              <div className="flex items-center gap-3 mt-3 ml-[44px]">
                {canEdit && (
                  <button
                    type="button"
                    onClick={() => setEditing(true)}
                    className="text-[12px] font-medium text-text-muted hover:text-primary transition-colors"
                  >
                    Edit
                  </button>
                )}
                {canDelete && (
                  <button
                    type="button"
                    onClick={() => setShowDeleteModal(true)}
                    className="text-[12px] font-medium text-text-muted hover:text-error transition-colors"
                  >
                    Delete
                  </button>
                )}
              </div>
            )}
          </>
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
