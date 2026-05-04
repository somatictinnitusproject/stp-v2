import Link from 'next/link'
import { Trophy } from 'lucide-react'
import type { CommunitySpace } from '@/content/community-spaces'
import { formatTimeAgo } from '@/lib/community/format-time-ago'

interface Props {
  space: CommunitySpace
  postCount: number
  lastActiveAt: string | null
}

// Progress and Wins is the most important space on the platform.
// Visually distinct: wins-bg background, primary border, larger
// min-height, always positioned first.
export default function ProgressWinsCard({
  space,
  postCount,
  lastActiveAt,
}: Props) {
  return (
    <Link
      href={`/community/${space.slug}`}
      className="block bg-wins-bg border-[1.5px] border-primary rounded-xl p-5 hover:bg-founder-tint transition-colors min-h-[96px]"
    >
      <div className="flex items-start gap-3">
        <div className="bg-primary rounded-lg p-2 flex-shrink-0">
          <Trophy className="w-5 h-5 text-white" strokeWidth={1.75} />
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
