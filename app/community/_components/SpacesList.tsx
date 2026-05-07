import { Hand, MessageCircleQuestion, MessagesSquare, BookOpen } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import {
  COMMUNITY_SPACES,
  type CommunitySpaceSlug,
} from '@/content/community-spaces'
import type { SpaceMetadata } from '@/lib/community/queries'
import SpaceCard from './SpaceCard'
import ProgressWinsCard from './ProgressWinsCard'

interface Props {
  metadata: SpaceMetadata[]
}

// Map non-Progress-Wins space slugs to their lucide icon.
const SPACE_ICONS: Record<Exclude<CommunitySpaceSlug, 'progress-wins'>, LucideIcon> = {
  'your-journey': Hand,
  'questions-oliver': MessageCircleQuestion,
  'discussion': MessagesSquare,
  'research-resources': BookOpen,
}

export default function SpacesList({ metadata }: Props) {
  const metaBySlug = new Map(metadata.map((m) => [m.slug, m]))

  return (
    <div className="space-y-3">
      {COMMUNITY_SPACES.map((space) => {
        const meta = metaBySlug.get(space.slug) ?? {
          slug: space.slug,
          post_count: 0,
          last_active_at: null,
        }

        if (space.slug === 'progress-wins') {
          return (
            <ProgressWinsCard
              key={space.slug}
              space={space}
              postCount={meta.post_count}
              lastActiveAt={meta.last_active_at}
            />
          )
        }

        const Icon = SPACE_ICONS[space.slug]
        return (
          <SpaceCard
            key={space.slug}
            space={space}
            Icon={Icon}
            postCount={meta.post_count}
            lastActiveAt={meta.last_active_at}
          />
        )
      })}
    </div>
  )
}
