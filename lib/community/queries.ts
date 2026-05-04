import type { SupabaseClient } from '@supabase/supabase-js'
import {
  COMMUNITY_SPACES,
  type CommunitySpaceSlug,
} from '@/content/community-spaces'

// Each row returned for the recent activity section.
export interface RecentActivityItem {
  id: string
  space: CommunitySpaceSlug
  title: string
  created_at: string
  author_username: string | null
  author_is_admin: boolean
}

// Aggregated metadata per space for the spaces list cards.
export interface SpaceMetadata {
  slug: CommunitySpaceSlug
  post_count: number
  last_active_at: string | null
}

// Fetch the N most recent non-deleted posts across all spaces.
// Joins users for the author username and admin flag.
//
// Every query against community_posts MUST include
// is_deleted = FALSE per CLAUDE.md ALL1.
export async function getRecentActivity(
  supabase: SupabaseClient,
  limit: number = 4,
): Promise<RecentActivityItem[]> {
  const { data, error } = await supabase
    .from('community_posts')
    .select(
      `
        id,
        space,
        title,
        created_at,
        users:user_id ( username, is_admin )
      `,
    )
    .eq('is_deleted', false)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) throw error
  if (!data) return []

  return data.map((row: any) => ({
    id: row.id,
    space: row.space as CommunitySpaceSlug,
    title: row.title,
    created_at: row.created_at,
    author_username: row.users?.username ?? null,
    author_is_admin: row.users?.is_admin === true,
  }))
}

// Fetch post counts and last-active timestamps for every space.
// Returns one entry per space, even if the space has no posts —
// missing spaces filled with zero count and null timestamp.
//
// Implementation: one query that returns all non-deleted posts'
// space + created_at, aggregated client-side. Acceptable for
// the volume expected at launch (under 1,000 posts realistically
// for years). If volume grows past 10k posts a Postgres function
// is the next step.
export async function getSpaceMetadata(
  supabase: SupabaseClient,
): Promise<SpaceMetadata[]> {
  const { data, error } = await supabase
    .from('community_posts')
    .select('space, created_at')
    .eq('is_deleted', false)

  if (error) throw error

  // Build a map: slug -> { count, latest_created_at }
  const buckets = new Map<
    CommunitySpaceSlug,
    { count: number; last_active_at: string | null }
  >()

  for (const space of COMMUNITY_SPACES) {
    buckets.set(space.slug, { count: 0, last_active_at: null })
  }

  for (const row of data ?? []) {
    const slug = row.space as CommunitySpaceSlug
    const bucket = buckets.get(slug)
    if (!bucket) continue
    bucket.count += 1
    if (
      bucket.last_active_at === null ||
      row.created_at > bucket.last_active_at
    ) {
      bucket.last_active_at = row.created_at
    }
  }

  return COMMUNITY_SPACES.map((space) => {
    const bucket = buckets.get(space.slug)!
    return {
      slug: space.slug,
      post_count: bucket.count,
      last_active_at: bucket.last_active_at,
    }
  })
}
