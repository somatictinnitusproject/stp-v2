import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { canAccessPlatform } from '@/lib/auth/access'

const MAX_BIO_LENGTH = 300

// PATCH /api/profile
//
// Body: { bio: string | null }
// Updates the authenticated user's bio. Bio is trimmed; empty
// string treated as null (clears the bio).

export async function PATCH(request: Request) {
  let payload: { bio?: string | null }
  try {
    payload = await request.json()
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 })
  }

  let bio: string | null
  if (payload.bio === null || payload.bio === undefined) {
    bio = null
  } else if (typeof payload.bio === 'string') {
    const trimmed = payload.bio.trim()
    if (trimmed.length === 0) {
      bio = null
    } else if (trimmed.length > MAX_BIO_LENGTH) {
      return NextResponse.json({ error: 'bio_too_long' }, { status: 400 })
    } else {
      bio = trimmed
    }
  } else {
    return NextResponse.json({ error: 'invalid_bio' }, { status: 400 })
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
    .select('status, is_founding_member, is_free_for_life')
    .eq('user_id', user.id)
    .maybeSingle()

  if (!membership || !canAccessPlatform(membership)) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 })
  }

  // Service-role for the UPDATE — same reason as community
  // soft-delete: anon-key UPDATE on users gets rejected by
  // RLS even on own row in some configurations. Ownership
  // is already enforced (we update WHERE id = user.id).
  const serviceClient = createServiceClient()
  const { data: updated, error: updateError } = await serviceClient
    .from('users')
    .update({ bio })
    .eq('id', user.id)
    .select('id, bio')
    .single()

  if (updateError || !updated) {
    return NextResponse.json({ error: 'update_failed' }, { status: 500 })
  }

  return NextResponse.json({
    user: { id: (updated as any).id, bio: (updated as any).bio },
  })
}
