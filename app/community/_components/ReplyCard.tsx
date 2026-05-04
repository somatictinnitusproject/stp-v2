import Link from 'next/link'
import type { PostReply } from '@/lib/community/queries'
import { formatTimeAgo } from '@/lib/community/format-time-ago'
import AvatarCircle from './AvatarCircle'
import FounderBadge from './FounderBadge'

interface Props {
  reply: PostReply
}

export default function ReplyCard({ reply }: Props) {
  const profileHref = reply.author_username
    ? `/profile/${reply.author_username}`
    : null

  // Founder replies get a tinted card background and primary
  // border so Oliver's answers are immediately identifiable
  // when scanning a thread.
  const cardClasses = reply.author_is_admin
    ? 'bg-founder-tint border-primary'
    : 'bg-surface border-border'

  return (
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
        </div>
      </div>
      <div className="text-[14px] text-text-body leading-relaxed whitespace-pre-line ml-[44px]">
        {reply.body}
      </div>
    </article>
  )
}
