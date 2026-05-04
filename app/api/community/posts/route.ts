import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
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

const MAX_TITLE_LENGTH = 200
const MAX_POST_BODY_LENGTH = 5000

// POST /api/community/posts
//
// Body: { space: CommunitySpaceSlug, title: string, body: string }
// Auth + access + community gates. Validates title and body
// length against the same bounds enforced by the DB CHECK
// constraints. Returns the new post's id and space so the
// client can redirect to /community/[space]/[id].

export async function POST(request: Request) {
  let payload: { space?: string; title?: string; body?: string }
  try {
    payload = await request.json()
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 })
  }

  const space = typeof payload.space === 'string' ? payload.space : null
  const title =
    typeof payload.title === 'string' ? payload.title.trim() : ''
  const body =
    typeof payload.body === 'string' ? payload.body.trim() : ''

  if (!space || !isCommunitySpaceSlug(space)) {
    return NextResponse.json({ error: 'invalid_space' }, { status: 400 })
  }
  if (title.length < 1 || title.length > MAX_TITLE_LENGTH) {
    return NextResponse.json({ error: 'invalid_title' }, { status: 400 })
  }
  if (body.length < 1 || body.length > MAX_POST_BODY_LENGTH) {
    return NextResponse.json({ error: 'invalid_body' }, { status: 400 })
  }

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

  const { data: inserted, error: insertError } = await supabase
    .from('community_posts')
    .insert({ user_id: user.id, space, title, body })
    .select('id, space')
    .single()

  if (insertError || !inserted) {
    return NextResponse.json({ error: 'insert_failed' }, { status: 500 })
  }

  return NextResponse.json({
    post: { id: (inserted as any).id, space: (inserted as any).space },
  })
}

// DELETE /api/community/posts
//
// Body: { id }
// Soft-deletes by setting is_deleted = TRUE. Idempotent.
// Author or admin only.

export async function DELETE(request: Request) {
  let payload: { id?: string }
  try {
    payload = await request.json()
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 })
  }

  const id = typeof payload.id === 'string' ? payload.id : null
  if (!id) {
    return NextResponse.json({ error: 'missing_id' }, { status: 400 })
  }

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

  const { data: userRow } = await supabase
    .from('users')
    .select('is_admin')
    .eq('id', user.id)
    .maybeSingle()
  const isAdmin = userRow?.is_admin === true

  const { data: postRow, error: postError } = await supabase
    .from('community_posts')
    .select('id, user_id')
    .eq('id', id)
    .maybeSingle()

  if (postError) {
    return NextResponse.json({ error: 'lookup_failed' }, { status: 500 })
  }
  if (!postRow) {
    return NextResponse.json({ error: 'post_not_found' }, { status: 404 })
  }

  const isOwner = (postRow as any).user_id === user.id
  if (!isOwner && !isAdmin) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 })
  }

  // Switch to service-role for the actual UPDATE — bypasses RLS.
  // Ownership and access were already enforced above.
  const serviceClient = createServiceClient()
  const { error: deleteError } = await serviceClient
    .from('community_posts')
    .update({ is_deleted: true, updated_at: new Date().toISOString() })
    .eq('id', id)

  if (deleteError) {
    return NextResponse.json({ error: 'delete_failed' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
