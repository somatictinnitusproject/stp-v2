import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  canAccessPlatform,
  canAccessCommunity,
} from '@/lib/auth/access'

const MAX_REPLY_LENGTH = 2000

export async function POST(request: Request) {
  let payload: { post_id?: string; body?: string }
  try {
    payload = await request.json()
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 })
  }

  const postId = typeof payload.post_id === 'string' ? payload.post_id : null
  const body =
    typeof payload.body === 'string' ? payload.body.trim() : ''

  if (!postId) {
    return NextResponse.json({ error: 'missing_post_id' }, { status: 400 })
  }
  if (body.length < 1 || body.length > MAX_REPLY_LENGTH) {
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

  // Confirm the post exists and is not deleted before inserting
  // a reply against it.
  const { data: postRow, error: postError } = await supabase
    .from('community_posts')
    .select('id')
    .eq('id', postId)
    .eq('is_deleted', false)
    .maybeSingle()

  if (postError) {
    return NextResponse.json({ error: 'lookup_failed' }, { status: 500 })
  }
  if (!postRow) {
    return NextResponse.json({ error: 'post_not_found' }, { status: 404 })
  }

  const { data: inserted, error: insertError } = await supabase
    .from('community_replies')
    .insert({ post_id: postId, user_id: user.id, body })
    .select(
      `
        id,
        body,
        created_at,
        user_id,
        users:user_id ( username, is_admin )
      `,
    )
    .single()

  if (insertError || !inserted) {
    return NextResponse.json({ error: 'insert_failed' }, { status: 500 })
  }

  const reply = {
    id: (inserted as any).id,
    body: (inserted as any).body,
    created_at: (inserted as any).created_at,
    author_username: (inserted as any).users?.username ?? null,
    author_is_admin: (inserted as any).users?.is_admin === true,
    author_user_id: (inserted as any).user_id,
  }

  return NextResponse.json({ reply })
}

// PATCH /api/community/replies
//
// Body: { id, body }
// Author or admin can update body. edited_at = NOW() always
// (body is the only mutable field).

export async function PATCH(request: Request) {
  let payload: { id?: string; body?: string }
  try {
    payload = await request.json()
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 })
  }

  const id = typeof payload.id === 'string' ? payload.id : null
  const body =
    typeof payload.body === 'string' ? payload.body.trim() : ''

  if (!id) {
    return NextResponse.json({ error: 'missing_id' }, { status: 400 })
  }
  if (body.length < 1 || body.length > MAX_REPLY_LENGTH) {
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

  const { data: userRow } = await supabase
    .from('users')
    .select('is_admin')
    .eq('id', user.id)
    .maybeSingle()
  const isAdmin = userRow?.is_admin === true

  const { data: replyRow, error: replyError } = await supabase
    .from('community_replies')
    .select('id, user_id, is_deleted')
    .eq('id', id)
    .maybeSingle()

  if (replyError) {
    return NextResponse.json({ error: 'lookup_failed' }, { status: 500 })
  }
  if (!replyRow || (replyRow as any).is_deleted) {
    return NextResponse.json({ error: 'reply_not_found' }, { status: 404 })
  }

  const isOwner = (replyRow as any).user_id === user.id
  if (!isOwner && !isAdmin) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 })
  }

  const now = new Date().toISOString()
  const { data: updated, error: updateError } = await supabase
    .from('community_replies')
    .update({ body, edited_at: now, updated_at: now })
    .eq('id', id)
    .select('id, body, edited_at')
    .single()

  if (updateError || !updated) {
    return NextResponse.json({ error: 'update_failed' }, { status: 500 })
  }

  return NextResponse.json({
    reply: {
      id: (updated as any).id,
      body: (updated as any).body,
      edited_at: (updated as any).edited_at,
    },
  })
}

// DELETE /api/community/replies
//
// Body: { id }
// Soft-deletes by setting is_deleted = TRUE. Author or admin.

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

  const { data: replyRow, error: replyError } = await supabase
    .from('community_replies')
    .select('id, user_id')
    .eq('id', id)
    .maybeSingle()

  if (replyError) {
    return NextResponse.json({ error: 'lookup_failed' }, { status: 500 })
  }
  if (!replyRow) {
    return NextResponse.json({ error: 'reply_not_found' }, { status: 404 })
  }

  const isOwner = (replyRow as any).user_id === user.id
  if (!isOwner && !isAdmin) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 })
  }

  const { error: deleteError } = await supabase
    .from('community_replies')
    .update({ is_deleted: true, updated_at: new Date().toISOString() })
    .eq('id', id)

  if (deleteError) {
    return NextResponse.json({ error: 'delete_failed' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
