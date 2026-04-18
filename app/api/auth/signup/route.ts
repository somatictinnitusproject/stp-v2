import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

export async function POST(request: Request) {
  const { username, email, password } = await request.json()

  // Validate username
  if (!username?.trim()) {
    return NextResponse.json({ error: 'Username is required.' }, { status: 400 })
  }
  if (!/^[a-zA-Z0-9_]{2,30}$/.test(username.trim())) {
    return NextResponse.json(
      { error: 'Username must be 2–30 characters and contain only letters, numbers, and underscores.' },
      { status: 400 }
    )
  }
  if (!email?.trim() || !password) {
    return NextResponse.json({ error: 'All fields are required.' }, { status: 400 })
  }
  if (password.length < 8) {
    return NextResponse.json({ error: 'Password must be at least 8 characters.' }, { status: 400 })
  }

  const cleanEmail = email.trim().toLowerCase()
  const cleanUsername = username.trim()

  // Service role client — for founding member check and all DB inserts
  const serviceClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // Check founding member list — .maybeSingle() returns null (not error) when not found
  const { data: foundingRow } = await serviceClient
    .from('founding_member_emails')
    .select('id, claimed')
    .eq('email', cleanEmail)
    .maybeSingle()

  if (foundingRow?.claimed === true) {
    return NextResponse.json(
      { error: 'An account with this email already exists.' },
      { status: 409 }
    )
  }

  const isFoundingMember = foundingRow !== null

  // Anon key client — signUp() respects Supabase Auth email verification settings
  // and sends the verification email automatically
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            try { cookieStore.set(name, value, options) } catch {}
          })
        },
      },
    }
  )

  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: cleanEmail,
    password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
    },
  })

  if (authError) {
    return NextResponse.json(
      { error: 'Could not create account. Please try again.' },
      { status: 500 }
    )
  }

  // When email verification is on, Supabase returns a fake success with empty identities
  // if the email is already registered — prevents email enumeration
  if (!authData.user || authData.user.identities?.length === 0) {
    return NextResponse.json(
      { error: 'An account with this email already exists.' },
      { status: 409 }
    )
  }

  const userId = authData.user.id

  // All DB inserts use service role — client cannot write these tables directly
  await serviceClient.from('users').insert({
    id: userId,
    email: cleanEmail,
    display_name: cleanUsername,
  })

  await serviceClient.from('memberships').insert({
    user_id: userId,
    status: 'active',
    is_founding_member: isFoundingMember,
    plan_type: isFoundingMember ? 'founding' : 'paid',
  })

  await serviceClient.from('framework_progress').insert({
    user_id: userId,
  })

  // Mark founding member email as claimed
  if (isFoundingMember) {
    await serviceClient
      .from('founding_member_emails')
      .update({ claimed: true, claimed_at: new Date().toISOString() })
      .eq('email', cleanEmail)
  }

  return NextResponse.json({ success: true })
}
