import { describe, it, expect } from 'vitest'
import { getRecentActivity, getSpaceMetadata, getSpacePosts } from '../queries'
import { COMMUNITY_SPACES } from '@/content/community-spaces'

// Build a mock supabase client whose .from(...) chain captures
// the calls so we can assert the query builder was called
// correctly, and returns a fixed dataset per table.
function buildMockSupabase(
  tableResponses: Record<string, any[]>,
) {
  const calls = {
    from: [] as string[],
    select: [] as string[],
    eq: [] as Array<[string, unknown]>,
    in: [] as Array<[string, unknown[]]>,
    order: [] as Array<[string, { ascending: boolean }]>,
    limit: null as number | null,
    range: null as [number, number] | null,
  }

  function makeBuilder(table: string) {
    const builder: any = {
      select(query: string) {
        calls.select.push(query)
        return builder
      },
      eq(col: string, val: unknown) {
        calls.eq.push([col, val])
        return builder
      },
      in(col: string, vals: unknown[]) {
        calls.in.push([col, vals])
        return builder
      },
      order(col: string, opts: { ascending: boolean }) {
        calls.order.push([col, opts])
        return builder
      },
      limit(n: number) {
        calls.limit = n
        return builder
      },
      range(from: number, to: number) {
        calls.range = [from, to]
        return builder
      },
      then(resolve: (value: { data: any; error: null }) => void) {
        resolve({ data: tableResponses[table] ?? [], error: null })
      },
    }
    return builder
  }

  const supabase: any = {
    from(table: string) {
      calls.from.push(table)
      return makeBuilder(table)
    },
  }

  return { supabase, calls }
}

describe('getRecentActivity', () => {
  it('queries community_posts with is_deleted=false and ordering', async () => {
    const { supabase, calls } = buildMockSupabase({ community_posts: [] })
    await getRecentActivity(supabase, 4)

    expect(calls.from).toContain('community_posts')
    expect(calls.eq).toContainEqual(['is_deleted', false])
    expect(calls.order).toContainEqual([
      'created_at',
      { ascending: false },
    ])
    expect(calls.limit).toBe(4)
  })

  it('uses default limit of 4 when none provided', async () => {
    const { supabase, calls } = buildMockSupabase({ community_posts: [] })
    await getRecentActivity(supabase)
    expect(calls.limit).toBe(4)
  })

  it('maps rows including author_username and admin flag', async () => {
    const fakeRows = [
      {
        id: 'post-1',
        space: 'progress-wins',
        title: 'My win',
        created_at: '2026-05-01T10:00:00Z',
        users: { username: 'oliver', is_admin: true },
      },
      {
        id: 'post-2',
        space: 'discussion',
        title: 'A question',
        created_at: '2026-04-30T08:00:00Z',
        users: { username: 'alice', is_admin: false },
      },
    ]
    const { supabase } = buildMockSupabase({ community_posts: fakeRows })
    const result = await getRecentActivity(supabase)

    expect(result).toHaveLength(2)
    expect(result[0]).toEqual({
      id: 'post-1',
      space: 'progress-wins',
      title: 'My win',
      created_at: '2026-05-01T10:00:00Z',
      author_username: 'oliver',
      author_is_admin: true,
    })
    expect(result[1].author_is_admin).toBe(false)
  })

  it('returns empty array when no rows', async () => {
    const { supabase } = buildMockSupabase({ community_posts: [] })
    const result = await getRecentActivity(supabase)
    expect(result).toEqual([])
  })

  it('handles missing user join gracefully', async () => {
    const fakeRows = [
      {
        id: 'post-1',
        space: 'discussion',
        title: 'Orphan',
        created_at: '2026-05-01T10:00:00Z',
        users: null,
      },
    ]
    const { supabase } = buildMockSupabase({ community_posts: fakeRows })
    const result = await getRecentActivity(supabase)
    expect(result[0].author_username).toBeNull()
    expect(result[0].author_is_admin).toBe(false)
  })
})

describe('getSpaceMetadata', () => {
  it('returns one entry per space even when no posts', async () => {
    const { supabase, calls } = buildMockSupabase({ community_posts: [] })
    const result = await getSpaceMetadata(supabase)

    expect(calls.from).toContain('community_posts')
    expect(calls.eq).toContainEqual(['is_deleted', false])
    expect(result).toHaveLength(COMMUNITY_SPACES.length)
    for (const meta of result) {
      expect(meta.post_count).toBe(0)
      expect(meta.last_active_at).toBeNull()
    }
  })

  it('aggregates counts and tracks the latest created_at per space', async () => {
    const rows = [
      { space: 'progress-wins', created_at: '2026-05-01T10:00:00Z' },
      { space: 'progress-wins', created_at: '2026-05-02T10:00:00Z' },
      { space: 'discussion', created_at: '2026-04-15T10:00:00Z' },
    ]
    const { supabase } = buildMockSupabase({ community_posts: rows })
    const result = await getSpaceMetadata(supabase)

    const wins = result.find((s) => s.slug === 'progress-wins')!
    expect(wins.post_count).toBe(2)
    expect(wins.last_active_at).toBe('2026-05-02T10:00:00Z')

    const disc = result.find((s) => s.slug === 'discussion')!
    expect(disc.post_count).toBe(1)
    expect(disc.last_active_at).toBe('2026-04-15T10:00:00Z')

    const intro = result.find((s) => s.slug === 'introduce-yourself')!
    expect(intro.post_count).toBe(0)
    expect(intro.last_active_at).toBeNull()
  })

  it('preserves the canonical space ordering from COMMUNITY_SPACES', async () => {
    const { supabase } = buildMockSupabase({ community_posts: [] })
    const result = await getSpaceMetadata(supabase)
    expect(result.map((s) => s.slug)).toEqual(
      COMMUNITY_SPACES.map((s) => s.slug),
    )
  })
})

describe('getSpacePosts', () => {
  it('queries community_posts filtered by is_deleted=false and space, ordered pinned-first then by created_at DESC, with range pagination', async () => {
    const { supabase, calls } = buildMockSupabase({
      community_posts: [],
      community_replies: [],
    })
    await getSpacePosts(supabase, 'discussion', 0, 20)

    expect(calls.from).toContain('community_posts')
    expect(calls.eq).toContainEqual(['is_deleted', false])
    expect(calls.eq).toContainEqual(['space', 'discussion'])
    expect(calls.order).toContainEqual([
      'is_pinned',
      { ascending: false },
    ])
    expect(calls.order).toContainEqual([
      'created_at',
      { ascending: false },
    ])
    // page 0, pageSize 20 → range(0, 20). 21 rows fetched to
    // detect hasMore via look-ahead.
    expect(calls.range).toEqual([0, 20])
  })

  it('uses the correct range for non-zero pages', async () => {
    const { supabase, calls } = buildMockSupabase({
      community_posts: [],
      community_replies: [],
    })
    await getSpacePosts(supabase, 'discussion', 2, 20)
    // page 2 → from = 40, to = 60
    expect(calls.range).toEqual([40, 60])
  })

  it('returns empty page with hasMore=false when no posts', async () => {
    const { supabase } = buildMockSupabase({
      community_posts: [],
      community_replies: [],
    })
    const result = await getSpacePosts(supabase, 'discussion', 0, 20)
    expect(result.posts).toEqual([])
    expect(result.hasMore).toBe(false)
  })

  it('detects hasMore when result count exceeds pageSize', async () => {
    // Build 21 rows; pageSize 20 → hasMore should be true and
    // posts.length should be 20.
    const rows = Array.from({ length: 21 }, (_, i) => ({
      id: `post-${i}`,
      space: 'discussion',
      title: `Title ${i}`,
      body: 'body',
      is_pinned: false,
      created_at: '2026-05-01T10:00:00Z',
      users: { username: 'alice', is_admin: false },
    }))
    const { supabase } = buildMockSupabase({
      community_posts: rows,
      community_replies: [],
    })
    const result = await getSpacePosts(supabase, 'discussion', 0, 20)
    expect(result.posts).toHaveLength(20)
    expect(result.hasMore).toBe(true)
  })

  it('returns hasMore=false when result count equals or is less than pageSize', async () => {
    const rows = Array.from({ length: 20 }, (_, i) => ({
      id: `post-${i}`,
      space: 'discussion',
      title: `Title ${i}`,
      body: 'body',
      is_pinned: false,
      created_at: '2026-05-01T10:00:00Z',
      users: { username: 'alice', is_admin: false },
    }))
    const { supabase } = buildMockSupabase({
      community_posts: rows,
      community_replies: [],
    })
    const result = await getSpacePosts(supabase, 'discussion', 0, 20)
    expect(result.posts).toHaveLength(20)
    expect(result.hasMore).toBe(false)
  })

  it('joins reply counts onto each post', async () => {
    const postRows = [
      {
        id: 'p1',
        space: 'discussion',
        title: 'Post 1',
        body: 'b',
        is_pinned: false,
        created_at: '2026-05-01T10:00:00Z',
        users: { username: 'alice', is_admin: false },
      },
      {
        id: 'p2',
        space: 'discussion',
        title: 'Post 2',
        body: 'b',
        is_pinned: false,
        created_at: '2026-04-30T10:00:00Z',
        users: { username: 'bob', is_admin: false },
      },
    ]
    const replyRows = [
      { post_id: 'p1' },
      { post_id: 'p1' },
      { post_id: 'p1' },
      { post_id: 'p2' },
    ]
    const { supabase } = buildMockSupabase({
      community_posts: postRows,
      community_replies: replyRows,
    })
    const result = await getSpacePosts(supabase, 'discussion', 0, 20)
    const p1 = result.posts.find((p) => p.id === 'p1')!
    const p2 = result.posts.find((p) => p.id === 'p2')!
    expect(p1.reply_count).toBe(3)
    expect(p2.reply_count).toBe(1)
  })

  it('returns reply_count=0 for posts with no replies', async () => {
    const postRows = [
      {
        id: 'p1',
        space: 'discussion',
        title: 'Lonely',
        body: 'b',
        is_pinned: false,
        created_at: '2026-05-01T10:00:00Z',
        users: { username: 'alice', is_admin: false },
      },
    ]
    const { supabase } = buildMockSupabase({
      community_posts: postRows,
      community_replies: [],
    })
    const result = await getSpacePosts(supabase, 'discussion', 0, 20)
    expect(result.posts[0].reply_count).toBe(0)
  })

  it('maps pinned and admin flags correctly', async () => {
    const postRows = [
      {
        id: 'p1',
        space: 'discussion',
        title: 'Pinned',
        body: 'b',
        is_pinned: true,
        created_at: '2026-05-01T10:00:00Z',
        users: { username: 'oliver', is_admin: true },
      },
    ]
    const { supabase } = buildMockSupabase({
      community_posts: postRows,
      community_replies: [],
    })
    const result = await getSpacePosts(supabase, 'discussion', 0, 20)
    expect(result.posts[0].is_pinned).toBe(true)
    expect(result.posts[0].author_is_admin).toBe(true)
    expect(result.posts[0].author_username).toBe('oliver')
  })

  it('handles missing user join with null username and false admin', async () => {
    const postRows = [
      {
        id: 'p1',
        space: 'discussion',
        title: 'Orphan',
        body: 'b',
        is_pinned: false,
        created_at: '2026-05-01T10:00:00Z',
        users: null,
      },
    ]
    const { supabase } = buildMockSupabase({
      community_posts: postRows,
      community_replies: [],
    })
    const result = await getSpacePosts(supabase, 'discussion', 0, 20)
    expect(result.posts[0].author_username).toBeNull()
    expect(result.posts[0].author_is_admin).toBe(false)
  })
})
