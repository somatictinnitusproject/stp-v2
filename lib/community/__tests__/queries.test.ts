import { describe, it, expect } from 'vitest'
import { getRecentActivity, getSpaceMetadata } from '../queries'
import { COMMUNITY_SPACES } from '@/content/community-spaces'

// Build a mock supabase client whose .from(...) chain captures
// the calls so we can assert the query builder was called
// correctly, and returns a fixed dataset for the result mapping.
function buildMockSupabase(returnedData: any[]) {
  const calls = {
    from: '' as string,
    select: '' as string,
    eq: [] as Array<[string, unknown]>,
    order: [] as Array<[string, { ascending: boolean }]>,
    limit: null as number | null,
  }

  const builder: any = {
    select(query: string) {
      calls.select = query
      return builder
    },
    eq(col: string, val: unknown) {
      calls.eq.push([col, val])
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
    then(resolve: (value: { data: any; error: null }) => void) {
      resolve({ data: returnedData, error: null })
    },
  }

  const supabase: any = {
    from(table: string) {
      calls.from = table
      return builder
    },
  }

  return { supabase, calls }
}

describe('getRecentActivity', () => {
  it('queries community_posts with is_deleted=false and ordering', async () => {
    const { supabase, calls } = buildMockSupabase([])
    await getRecentActivity(supabase, 4)

    expect(calls.from).toBe('community_posts')
    expect(calls.eq).toContainEqual(['is_deleted', false])
    expect(calls.order).toContainEqual([
      'created_at',
      { ascending: false },
    ])
    expect(calls.limit).toBe(4)
  })

  it('uses default limit of 4 when none provided', async () => {
    const { supabase, calls } = buildMockSupabase([])
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
    const { supabase } = buildMockSupabase(fakeRows)
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
    const { supabase } = buildMockSupabase([])
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
    const { supabase } = buildMockSupabase(fakeRows)
    const result = await getRecentActivity(supabase)
    expect(result[0].author_username).toBeNull()
    expect(result[0].author_is_admin).toBe(false)
  })
})

describe('getSpaceMetadata', () => {
  it('returns one entry per space even when no posts', async () => {
    const { supabase, calls } = buildMockSupabase([])
    const result = await getSpaceMetadata(supabase)

    expect(calls.from).toBe('community_posts')
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
    const { supabase } = buildMockSupabase(rows)
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
    const { supabase } = buildMockSupabase([])
    const result = await getSpaceMetadata(supabase)
    expect(result.map((s) => s.slug)).toEqual(
      COMMUNITY_SPACES.map((s) => s.slug),
    )
  })
})
