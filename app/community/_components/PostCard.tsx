import Link from 'next/link'
import { Pin } from 'lucide-react'
import type { SpacePost } from '@/lib/community/queries'
import { formatTimeAgo } from '@/lib/community/format-time-ago'
import { getBodyPreview } from '@/lib/community/preview'
import AvatarCircle from './AvatarCircle'
import FounderBadge from './FounderBadge'

interface Props {
  post: SpacePost
}

// Single post card on a space feed. Avatar + author + founder
// badge + time ago header, title, 120-char body preview, reply
// count footer. Pinned label top-right when is_pinned=TRUE.
export default function PostCard({ post }: Props) {
  const postHref = `/community/${post.space}/${post.id}`
  const profileHref = post.author_username
    ? `/profile/${post.author_username}`
    : null

  return (
    <article className="relative bg-surface border border-border rounded-xl p-5 hover:border-primary transition-colors">
      {post.is_pinned && (
        <div className="absolute top-3 right-3 flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide text-primary">
          <Pin className="w-3 h-3" strokeWidth={2.25} />
          Pinned
        </div>
      )}

      <div className="flex items-start gap-3 mb-3">
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
        </div>
      </div>

      <Link href={postHref} className="block">
        <h2 className="text-[18px] font-semibold leading-snug text-text-heading mb-2">
          {post.title}
        </h2>
        <p className="text-[14px] text-text-muted leading-relaxed">
          {getBodyPreview(post.body)}
        </p>
        <p className="text-[13px] text-text-muted mt-3">
          {post.reply_count}{' '}
          {post.reply_count === 1 ? 'reply' : 'replies'}
        </p>
      </Link>
    </article>
  )
}
