import Link from 'next/link'
import type { LucideIcon } from 'lucide-react'
import type { CommunitySpace } from '@/content/community-spaces'
import { formatTimeAgo } from '@/lib/community/format-time-ago'

interface Props {
  space: CommunitySpace
  Icon: LucideIcon
  postCount: number
  lastActiveAt: string | null
}

// Standard space card. Used for spaces 2 through 5. Progress
// and Wins uses a distinct treatment in ProgressWinsCard.
export default function SpaceCard({
  space,
  Icon,
  postCount,
  lastActiveAt,
}: Props) {
  return (
    <Link
      href={`/community/${space.slug}`}
      className="block bg-surface border border-border rounded-xl p-5 hover:border-primary transition-colors min-h-[80px]"
    >
      <div className="flex items-start gap-3">
        <div className="bg-surface-raised rounded-lg p-2 flex-shrink-0">
          <Icon className="w-5 h-5 text-text-heading" strokeWidth={1.75} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-[18px] font-semibold leading-snug text-text-heading">
            {space.name}
          </h3>
          <p className="text-[14px] text-text-muted mt-1">
            {space.description}
          </p>
          <div className="flex items-center gap-2 text-[13px] text-text-muted mt-2">
            <span>
              {postCount} {postCount === 1 ? 'post' : 'posts'}
            </span>
            {lastActiveAt && (
              <>
                <span>·</span>
                <span>Active {formatTimeAgo(lastActiveAt)}</span>
              </>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}
