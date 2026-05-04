'use client'

import { useState } from 'react'
import type { PostReply } from '@/lib/community/queries'
import ReplyCard from './ReplyCard'
import ReplyForm from './ReplyForm'

interface Props {
  postId: string
  initialReplies: PostReply[]
}

export default function ReplyThread({ postId, initialReplies }: Props) {
  const [replies, setReplies] = useState<PostReply[]>(initialReplies)

  function handleReplyPosted(reply: PostReply) {
    setReplies((prev) => [...prev, reply])
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
              <ReplyCard reply={reply} />
            </li>
          ))}
        </ul>
      )}

      {/* Mobile: fixed bottom bar. Desktop: inline below list. */}
      <div className="hidden md:block">
        <ReplyForm postId={postId} onReplyPosted={handleReplyPosted} />
      </div>
      <div className="md:hidden fixed bottom-16 left-0 right-0 z-20">
        <ReplyForm postId={postId} onReplyPosted={handleReplyPosted} />
      </div>
      {/* Spacer so the last reply isn't hidden behind the
          fixed bar on mobile. Approximate textarea height. */}
      <div className="md:hidden h-32" aria-hidden="true" />
    </>
  )
}
