import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  canAccessPlatform,
  canAccessCommunity,
} from '@/lib/auth/access'
import {
  getSpacePosts,
} from '@/lib/community/queries'
import { isCommunitySpaceSlug } from '@/content/community-spaces'

// GET /api/community/posts?space=discussion&page=1
//
// Returns { posts, hasMore } for the requested page. Auth +
// access gate identical to the page-level checks.

export async function GET(request: Request) {
  const url = new URL(request.url)
  const space = url.searchParams.get('space')
  const pageParam = url.searchParams.get('page')

  if (!space || !isCommunitySpaceSlug(space)) {
    return NextResponse.json({ error: 'invalid_space' }, { status: 400 })
  }

  const page = pageParam ? Math.max(0, parseInt(pageParam, 10) || 0) : 0

  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const { data: membership } = await supabase
    .from('memberships')
    .select('status, is_founding_member')
    .eq('user_id', user.id)
    .maybeSingle()

  if (!membership || !canAccessPlatform(membership)) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 })
  }

  const { data: frameworkProgress } = await supabase
    .from('framework_progress')
    .select('phase1_completed_at')
    .eq('user_id', user.id)
    .maybeSingle()

  if (!canAccessCommunity(membership, frameworkProgress)) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 })
  }

  const result = await getSpacePosts(supabase, space, page, 20)
  return NextResponse.json(result)
}
