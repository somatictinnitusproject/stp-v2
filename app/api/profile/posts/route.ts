import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import {
  canAccessPlatform,
  canAccessCommunity,
} from '@/lib/auth/access'
import {
  getUserPosts,
  getUserProfile,
} from '@/lib/community/queries'

// GET /api/profile/posts?username=X&page=N
//
// Auth + access gate. Resolves username → user_id via
// service-role profile fetch, then loads paginated posts
// via the standard anon client (joins work fine through RLS).

export async function GET(request: Request) {
  const url = new URL(request.url)
  const username = url.searchParams.get('username')
  const pageParam = url.searchParams.get('page')

  if (!username || !/^[a-z0-9_]{2,30}$/.test(username)) {
    return NextResponse.json({ error: 'invalid_username' }, { status: 400 })
  }

  const page = pageParam
    ? Math.max(0, parseInt(pageParam, 10) || 0)
    : 0

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

  const serviceClient = createServiceClient()
  const profile = await getUserProfile(serviceClient, username)
  if (!profile) {
    return NextResponse.json({ error: 'not_found' }, { status: 404 })
  }

  const result = await getUserPosts(supabase, profile.id, page, 20)
  return NextResponse.json(result)
}
