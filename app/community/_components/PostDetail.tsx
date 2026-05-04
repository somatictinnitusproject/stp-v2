'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Pin } from 'lucide-react'
import type { PostWithReplies } from '@/lib/community/queries'
import { formatTimeAgo } from '@/lib/community/format-time-ago'
import AvatarCircle from './AvatarCircle'
import FounderBadge from './FounderBadge'
import DeleteConfirmModal from '@/components/community/DeleteConfirmModal'

interface Props {
  post: PostWithReplies
  currentUserId: string
  currentUserIsAdmin: boolean
}

const MAX_TITLE_LENGTH = 200
const MAX_POST_BODY_LENGTH = 5000

export default function PostDetail({
  post: initialPost,
  currentUserId,
  currentUserIsAdmin,
}: Props) {
  const router = useRouter()

  const [post, setPost] = useState(initialPost)
  const [editing, setEditing] = useState(false)
  const [editTitle, setEditTitle] = useState(post.title)
  const [editBody, setEditBody] = useState(post.body)
  const [saving, setSaving] = useState(false)
  const [editError, setEditError] = useState<string | null>(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  const isOwner = post.author_user_id === currentUserId
  const canEdit = isOwner || currentUserIsAdmin
  const canDelete = isOwner || currentUserIsAdmin

  const profileHref = post.author_username
    ? `/profile/${post.author_username}`
    : null

  const trimmedTitle = editTitle.trim()
  const trimmedBody = editBody.trim()
  const editValid =
    trimmedTitle.length >= 1 &&
    trimmedTitle.length <= MAX_TITLE_LENGTH &&
    trimmedBody.length >= 1 &&
    trimmedBody.length <= MAX_POST_BODY_LENGTH

  async function handleSave() {
    if (!editValid || saving) return
    setSaving(true)
    setEditError(null)
    try {
      const res = await fetch('/api/community/posts', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: post.id,
          title: trimmedTitle,
          body: trimmedBody,
        }),
      })
      if (!res.ok) throw new Error('save_failed')
      const data: {
        post: { title: string; body: string; edited_at: string }
      } = await res.json()
      setPost((prev) => ({
        ...prev,
        title: data.post.title,
        body: data.post.body,
        edited_at: data.post.edited_at,
      }))
      setEditing(false)
    } catch {
      setEditError('Something went wrong. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  function handleCancelEdit() {
    setEditTitle(post.title)
    setEditBody(post.body)
    setEditError(null)
    setEditing(false)
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
          <div className="absolute top-4 right-4 flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide text-primary">
            <Pin className="w-3 h-3" strokeWidth={2.25} />
            Pinned
          </div>
        )}

        <div className="flex items-start gap-3 mb-4">
          <AvatarCircle username={post.author_username} />
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
            {post.edited_at && (
              <>
                <span aria-hidden="true">·</span>
                <span className="italic">
                  edited {formatTimeAgo(post.edited_at)}
                </span>
              </>
            )}
          </div>
        </div>

        {editing ? (
          <div className="space-y-3">
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              maxLength={MAX_TITLE_LENGTH}
              disabled={saving}
              className="w-full bg-surface border border-border rounded-lg px-4 py-3 text-[16px] text-text-body focus:outline-none focus:border-primary disabled:opacity-60"
            />
            <textarea
              value={editBody}
              onChange={(e) => setEditBody(e.target.value)}
              rows={8}
              maxLength={MAX_POST_BODY_LENGTH}
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
                className="text-[14px] font-medium text-text-muted hover:text-text-body px-4 py-2 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={!editValid || saving}
                className="bg-primary hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed text-white text-[14px] font-medium px-5 py-2 rounded-lg transition-colors"
              >
                {saving ? 'Saving…' : 'Save'}
              </button>
            </div>
          </div>
        ) : (
          <>
            <h1 className="text-[24px] md:text-[28px] font-semibold leading-tight text-text-heading mb-3">
              {post.title}
            </h1>
            <div className="text-[15px] text-text-body leading-relaxed whitespace-pre-line">
              {post.body}
            </div>

            {(canEdit || canDelete) && (
              <div className="flex items-center gap-3 mt-5 pt-4 border-t border-border">
                {canEdit && (
                  <button
                    type="button"
                    onClick={() => setEditing(true)}
                    className="text-[13px] font-medium text-text-muted hover:text-primary transition-colors"
                  >
                    Edit
                  </button>
                )}
                {canDelete && (
                  <button
                    type="button"
                    onClick={() => setShowDeleteModal(true)}
                    className="text-[13px] font-medium text-text-muted hover:text-error transition-colors"
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
          kind="post"
          onCancel={() => setShowDeleteModal(false)}
          onConfirm={handleDelete}
        />
      )}
    </>
  )
}
