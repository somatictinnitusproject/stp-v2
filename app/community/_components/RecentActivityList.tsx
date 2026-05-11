import Link from 'next/link'
import type { RecentActivityItem } from '@/lib/community/queries'
import { formatTimeAgo } from '@/lib/community/format-time-ago'
import { getCommunitySpace } from '@/content/community-spaces'
import FounderBadge from './FounderBadge'

interface Props {
  items: RecentActivityItem[]
}

// Recent activity strip on /community. Up to 4 most recent
// non-deleted posts. Empty state CTA points members at
// Progress and Wins, the load-bearing space.
export default function RecentActivityList({ items }: Props) {
  if (items.length === 0) {
    return (
      <div className="mb-8">
        <h2 className="text-[13px] font-medium uppercase tracking-wide text-text-muted mb-3">
          Recent activity
        </h2>
        <p className="text-[14px] text-text-muted">
          No activity yet —{' '}
          <Link
            href="/community/progress-wins"
            className="text-primary hover:text-primary-hover underline"
          >
            be the first to post in Progress and Wins
          </Link>
          .
        </p>
      </div>
    )
  }

  return (
    <div className="mb-8">
      <h2 className="text-[13px] font-medium uppercase tracking-wide text-text-muted mb-3">
        Recent activity
      </h2>
      <ul className="space-y-2">
        {items.map((item) => {
          const space = getCommunitySpace(item.space)
          return (
            <li
              key={item.id}
              className="bg-surface border border-border rounded-lg p-3 hover:border-primary transition-colors"
            >
              <Link
                href={`/community/${item.space}/${item.post_id}`}
                className="block"
              >
                <div className="flex items-center gap-2 text-[12px] text-text-muted mb-1">
                  <span className="bg-surface-raised px-2 py-0.5 rounded-full">
                    {space.name}
                  </span>
                  <span>·</span>
                  <span>
                    {item.author_username
                      ? `@${item.author_username}`
                      : 'unknown'}
                  </span>
                  {item.author_is_admin && <FounderBadge />}
                  <span>·</span>
                  <span>{formatTimeAgo(item.created_at)}</span>
                </div>
                <div className="text-[15px] font-medium text-text-heading">
                  {item.type === 'reply' ? `Re: ${item.title}` : item.title}
                </div>
              </Link>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
