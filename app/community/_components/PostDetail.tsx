import Link from 'next/link'
import { Pin } from 'lucide-react'
import type { PostWithReplies } from '@/lib/community/queries'
import { formatTimeAgo } from '@/lib/community/format-time-ago'
import AvatarCircle from './AvatarCircle'
import FounderBadge from './FounderBadge'

interface Props {
  post: PostWithReplies
}

// Full post detail rendered above the reply list. Mirrors
// PostCard's header treatment but renders the full body
// (line breaks preserved) without truncation.
export default function PostDetail({ post }: Props) {
  const profileHref = post.author_username
    ? `/profile/${post.author_username}`
    : null

  return (
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
        </div>
      </div>

      <h1 className="text-[24px] md:text-[28px] font-semibold leading-tight text-text-heading mb-3">
        {post.title}
      </h1>

      {/* Body: preserve line breaks without rendering markdown.
          whitespace-pre-line collapses runs of whitespace but
          keeps single \n line breaks. */}
      <div className="text-[15px] text-text-body leading-relaxed whitespace-pre-line">
        {post.body}
      </div>
    </article>
  )
}
