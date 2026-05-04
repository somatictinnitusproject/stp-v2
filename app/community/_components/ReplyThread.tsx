'use client'

import { useState } from 'react'
import type { PostReply } from '@/lib/community/queries'
import ReplyCard from './ReplyCard'
import ReplyForm from './ReplyForm'

interface Props {
  postId: string
  initialReplies: PostReply[]
  currentUserId: string
  currentUserIsAdmin: boolean
}

export default function ReplyThread({
  postId,
  initialReplies,
  currentUserId,
  currentUserIsAdmin,
}: Props) {
  const [replies, setReplies] = useState<PostReply[]>(initialReplies)

  function handleReplyPosted(reply: PostReply) {
    setReplies((prev) => [...prev, reply])
  }

  function handleReplyEdited(updated: PostReply) {
    setReplies((prev) =>
      prev.map((r) => (r.id === updated.id ? updated : r)),
    )
  }

  function handleReplyDeleted(replyId: string) {
    setReplies((prev) => prev.filter((r) => r.id !== replyId))
  }

  return (
    <>
      <h2 className="text-[15px] font-medium text-text-muted mb-3">
        {replies.length}{' '}
        {replies.length === 1 ? 'reply' : 'replies'}
      </h2>

      {replies.length > 0 && (
        <ul className="space-y-3 mb-6">
          {replies.map((reply) => (
            <li key={reply.id}>
              <ReplyCard
                reply={reply}
                currentUserId={currentUserId}
                currentUserIsAdmin={currentUserIsAdmin}
                onEdited={handleReplyEdited}
                onDeleted={handleReplyDeleted}
              />
            </li>
          ))}
        </ul>
      )}

      <div className="hidden md:block">
        <ReplyForm postId={postId} onReplyPosted={handleReplyPosted} />
      </div>
      <div className="md:hidden fixed bottom-16 left-0 right-0 z-20">
        <ReplyForm postId={postId} onReplyPosted={handleReplyPosted} />
      </div>
      <div className="md:hidden h-32" aria-hidden="true" />
    </>
  )
}
