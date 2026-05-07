import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { canAccessPlatform } from '@/lib/auth/access'

// PATCH /api/profile/research-consent
//
// Body: { research_consent: boolean }
// Updates research_consent on the authenticated user's consents row.
// Sets research_consent_updated_at = NOW().

export async function PATCH(request: Request) {
  let payload: { research_consent?: boolean }
  try {
    payload = await request.json()
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 })
  }

  if (typeof payload.research_consent !== 'boolean') {
    return NextResponse.json({ error: 'invalid_value' }, { status: 400 })
  }

  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const { data: membership } = await supabase
    .from('memberships')
    .select('status, is_founding_member, is_free_for_life')
    .eq('user_id', user.id)
    .maybeSingle()

  if (!membership || !canAccessPlatform(membership)) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 })
  }

  const { error } = await supabase
    .from('consents')
    .update({
      research_consent: payload.research_consent,
      research_consent_updated_at: new Date().toISOString(),
    })
    .eq('user_id', user.id)

  if (error) {
    console.error('[research-consent] update failed', error)
    return NextResponse.json({ error: 'update_failed' }, { status: 500 })
  }

  return NextResponse.json({ research_consent: payload.research_consent })
}
