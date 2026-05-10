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
        public_users:user_id ( username, is_admin )
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

// Single post row used by space feed pages and post list cards.
// Contains everything PostCard needs to render without further
// fetches — author username + admin flag joined in, reply count
// computed via a separate query (see getSpacePosts).
export interface SpacePost {
  id: string
  space: CommunitySpaceSlug
  title: string
  body: string
  is_pinned: boolean
  created_at: string
  author_username: string | null
  author_is_admin: boolean
  reply_count: number
}

// Result shape for getSpacePosts — posts plus a flag indicating
// whether more pages exist beyond what was returned.
export interface SpacePostsPage {
  posts: SpacePost[]
  hasMore: boolean
}

// Fetch a paginated page of non-deleted posts in a single space.
//
// Ordering: pinned posts first (is_pinned DESC), then by
// created_at DESC. Reply counts come from a second query
// (community_replies grouped by post_id) — simpler than a
// LATERAL JOIN, the volume difference is irrelevant at launch.
//
// Pagination: 20 posts per page by default. Returns hasMore=TRUE
// if any post exists beyond the requested window.
export async function getSpacePosts(
  supabase: SupabaseClient,
  space: CommunitySpaceSlug,
  page: number = 0,
  pageSize: number = 20,
): Promise<SpacePostsPage> {
  const from = page * pageSize
  // Fetch one extra row to detect hasMore without a count query.
  const to = from + pageSize

  const { data: postRows, error: postsError } = await supabase
    .from('community_posts')
    .select(
      `
        id,
        space,
        title,
        body,
        is_pinned,
        created_at,
        public_users:user_id ( username, is_admin )
      `,
    )
    .eq('is_deleted', false)
    .eq('space', space)
    .order('is_pinned', { ascending: false })
    .order('created_at', { ascending: false })
    .range(from, to)

  if (postsError) throw postsError
  if (!postRows || postRows.length === 0) {
    return { posts: [], hasMore: false }
  }

  // Slice off the look-ahead row and detect hasMore.
  const hasMore = postRows.length > pageSize
  const visibleRows = hasMore ? postRows.slice(0, pageSize) : postRows

  // Reply counts in one query for the visible posts only.
  const visibleIds = visibleRows.map((r: any) => r.id)
  const { data: replyRows, error: repliesError } = await supabase
    .from('community_replies')
    .select('post_id')
    .eq('is_deleted', false)
    .in('post_id', visibleIds)

  if (repliesError) throw repliesError

  const replyCounts = new Map<string, number>()
  for (const row of replyRows ?? []) {
    const id = (row as any).post_id as string
    replyCounts.set(id, (replyCounts.get(id) ?? 0) + 1)
  }

  const posts: SpacePost[] = visibleRows.map((row: any) => ({
    id: row.id,
    space: row.space as CommunitySpaceSlug,
    title: row.title,
    body: row.body,
    is_pinned: row.is_pinned === true,
    created_at: row.created_at,
    author_username: row.users?.username ?? null,
    author_is_admin: row.users?.is_admin === true,
    reply_count: replyCounts.get(row.id) ?? 0,
  }))

  return { posts, hasMore }
}

// Single reply row used inside PostWithReplies. Joins author
// username + admin flag for inline rendering.
export interface PostReply {
  id: string
  body: string
  created_at: string
  author_username: string | null
  author_is_admin: boolean
  author_user_id: string
}

// Full post detail plus its non-deleted replies, ordered
// chronologically. Returned by getPostWithReplies.
export interface PostWithReplies {
  id: string
  space: CommunitySpaceSlug
  title: string
  body: string
  is_pinned: boolean
  created_at: string
  author_username: string | null
  author_is_admin: boolean
  author_user_id: string
  replies: PostReply[]
}

// Fetch a single post by id along with its non-deleted replies.
//
// Returns null when:
//   - post does not exist
//   - post is_deleted = TRUE
//   - post.space does not match expectedSpace (URL tampering)
//
// Replies are ordered created_at ASC — chronological thread
// per Doc 12 §11.6.
export async function getPostWithReplies(
  supabase: SupabaseClient,
  postId: string,
  expectedSpace: CommunitySpaceSlug,
): Promise<PostWithReplies | null> {
  const { data: postRow, error: postError } = await supabase
    .from('community_posts')
    .select(
      `
        id,
        space,
        title,
        body,
        is_pinned,
        created_at,
        user_id,
        public_users:user_id ( username, is_admin )
      `,
    )
    .eq('id', postId)
    .eq('is_deleted', false)
    .maybeSingle()

  if (postError) throw postError
  if (!postRow) return null
  if ((postRow as any).space !== expectedSpace) return null

  const { data: replyRows, error: repliesError } = await supabase
    .from('community_replies')
    .select(
      `
        id,
        body,
        created_at,
        user_id,
        public_users:user_id ( username, is_admin )
      `,
    )
    .eq('post_id', postId)
    .eq('is_deleted', false)
    .order('created_at', { ascending: true })

  if (repliesError) throw repliesError

  const replies: PostReply[] = (replyRows ?? []).map((row: any) => ({
    id: row.id,
    body: row.body,
    created_at: row.created_at,
    author_username: row.users?.username ?? null,
    author_is_admin: row.users?.is_admin === true,
    author_user_id: row.user_id,
  }))

  return {
    id: (postRow as any).id,
    space: (postRow as any).space as CommunitySpaceSlug,
    title: (postRow as any).title,
    body: (postRow as any).body,
    is_pinned: (postRow as any).is_pinned === true,
    created_at: (postRow as any).created_at,
    author_username: (postRow as any).users?.username ?? null,
    author_is_admin: (postRow as any).users?.is_admin === true,
    author_user_id: (postRow as any).user_id,
    replies,
  }
}

// Public profile fields exposed on /profile/[username].
// Username is the canonical handle. Bio is optional.
// created_at is used for the "member since" display.
export interface UserProfile {
  id: string
  username: string
  bio: string | null
  is_admin: boolean
  created_at: string
}

// Fetch a user's public profile by username (case-insensitive).
// Returns null when the username is not found.
//
// Reads from public_users view which exposes only safe public columns
// (id, username, is_admin, bio, created_at). Works with either a
// standard authenticated client or a service-role client.
export async function getUserProfile(
  client: SupabaseClient,
  username: string,
): Promise<UserProfile | null> {
  const { data, error } = await client
    .from('public_users')
    .select('id, username, bio, is_admin, created_at')
    .ilike('username', username)
    .maybeSingle()

  if (error) throw error
  if (!data) return null

  return {
    id: (data as any).id,
    username: (data as any).username,
    bio: (data as any).bio ?? null,
    is_admin: (data as any).is_admin === true,
    created_at: (data as any).created_at,
  }
}

// Paginated posts by a given user. Mirrors getSpacePosts but
// filtered by user_id instead of space.
export async function getUserPosts(
  supabase: SupabaseClient,
  userId: string,
  page: number = 0,
  pageSize: number = 20,
): Promise<SpacePostsPage> {
  const from = page * pageSize
  const to = from + pageSize

  const { data: postRows, error: postsError } = await supabase
    .from('community_posts')
    .select(
      `
        id,
        space,
        title,
        body,
        is_pinned,
        created_at,
        public_users:user_id ( username, is_admin )
      `,
    )
    .eq('is_deleted', false)
    .eq('user_id', userId)
    .order('is_pinned', { ascending: false })
    .order('created_at', { ascending: false })
    .range(from, to)

  if (postsError) throw postsError
  if (!postRows || postRows.length === 0) {
    return { posts: [], hasMore: false }
  }

  const hasMore = postRows.length > pageSize
  const visibleRows = hasMore ? postRows.slice(0, pageSize) : postRows

  const visibleIds = visibleRows.map((r: any) => r.id)
  const { data: replyRows, error: repliesError } = await supabase
    .from('community_replies')
    .select('post_id')
    .eq('is_deleted', false)
    .in('post_id', visibleIds)

  if (repliesError) throw repliesError

  const replyCounts = new Map<string, number>()
  for (const row of replyRows ?? []) {
    const id = (row as any).post_id as string
    replyCounts.set(id, (replyCounts.get(id) ?? 0) + 1)
  }

  const posts: SpacePost[] = visibleRows.map((row: any) => ({
    id: row.id,
    space: row.space as CommunitySpaceSlug,
    title: row.title,
    body: row.body,
    is_pinned: row.is_pinned === true,
    created_at: row.created_at,
    author_username: row.users?.username ?? null,
    author_is_admin: row.users?.is_admin === true,
    reply_count: replyCounts.get(row.id) ?? 0,
  }))

  return { posts, hasMore }
}

// Single reply row enriched with parent post context, used on
// the profile replies tab.
export interface UserReply {
  id: string
  body: string
  created_at: string
  post_id: string
  post_space: CommunitySpaceSlug
  post_title: string
}

// Paginated page of replies by a given user, most-recent first.
export interface UserRepliesPage {
  replies: UserReply[]
  hasMore: boolean
}

// Fetch paginated replies by a user, joined with parent post
// metadata. Skips replies whose parent post is deleted.
export async function getUserReplies(
  supabase: SupabaseClient,
  userId: string,
  page: number = 0,
  pageSize: number = 20,
): Promise<UserRepliesPage> {
  const from = page * pageSize
  const to = from + pageSize

  const { data: rows, error } = await supabase
    .from('community_replies')
    .select(
      `
        id,
        body,
        created_at,
        post_id,
        community_posts!inner ( space, title, is_deleted )
      `,
    )
    .eq('is_deleted', false)
    .eq('user_id', userId)
    .eq('community_posts.is_deleted', false)
    .order('created_at', { ascending: false })
    .range(from, to)

  if (error) throw error
  if (!rows || rows.length === 0) {
    return { replies: [], hasMore: false }
  }

  const hasMore = rows.length > pageSize
  const visibleRows = hasMore ? rows.slice(0, pageSize) : rows

  const replies: UserReply[] = visibleRows.map((row: any) => ({
    id: row.id,
    body: row.body,
    created_at: row.created_at,
    post_id: row.post_id,
    post_space: row.community_posts.space as CommunitySpaceSlug,
    post_title: row.community_posts.title,
  }))

  return { replies, hasMore }
}
