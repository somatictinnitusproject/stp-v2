// Community space definitions. Single source of truth for slugs,
// display names, descriptions, and ordering. Both the DB CHECK
// constraint on community_posts.space and every UI surface
// reference these values.
//
// Slugs are URL paths, hyphenated, lowercase. The DB stores the
// hyphenated form verbatim.

export type CommunitySpaceSlug =
  | 'progress-wins'
  | 'introduce-yourself'
  | 'questions-oliver'
  | 'discussion'
  | 'research-resources'

export interface CommunitySpace {
  slug: CommunitySpaceSlug
  name: string
  description: string
  position: number
}

export const COMMUNITY_SPACES: readonly CommunitySpace[] = [
  {
    slug: 'progress-wins',
    name: 'Progress and Wins',
    description: 'Share your wins, big and small. This is what it is all about.',
    position: 1,
  },
  {
    slug: 'introduce-yourself',
    name: 'Introduce Yourself',
    description: 'New here? Tell us about yourself and your journey.',
    position: 2,
  },
  {
    slug: 'questions-oliver',
    name: 'Questions for Oliver',
    description: 'Ask Oliver anything. All answers visible to the community.',
    position: 3,
  },
  {
    slug: 'discussion',
    name: 'Discussion',
    description: 'Jaw, cervical, posture, nervous system: everything in one place.',
    position: 4,
  },
  {
    slug: 'research-resources',
    name: 'Research and Resources',
    description: 'New findings, studies, and resources. Oliver posts updates here.',
    position: 5,
  },
] as const

export const COMMUNITY_SPACE_SLUGS: readonly CommunitySpaceSlug[] =
  COMMUNITY_SPACES.map((s) => s.slug)

export function isCommunitySpaceSlug(value: string): value is CommunitySpaceSlug {
  return (COMMUNITY_SPACE_SLUGS as readonly string[]).includes(value)
}

export function getCommunitySpace(slug: CommunitySpaceSlug): CommunitySpace {
  const space = COMMUNITY_SPACES.find((s) => s.slug === slug)
  if (!space) {
    // Unreachable given the type guard, but kept for runtime safety.
    throw new Error(`Unknown community space slug: ${slug}`)
  }
  return space
}
