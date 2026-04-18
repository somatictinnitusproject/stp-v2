import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function POST(request: Request) {
  const { email, password } = await request.json()

  if (!email?.trim() || !password) {
    return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 })
  }

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

  const { error } = await supabase.auth.signInWithPassword({
    email: email.trim().toLowerCase(),
    password,
  })

  if (error) {
    // Use a generic message — never reveal whether email or password was wrong
    return NextResponse.json(
      { error: 'Incorrect email or password.' },
      { status: 401 }
    )
  }

  // Read and clear the post-login redirect cookie
  const redirectTo = cookieStore.get('redirectAfterLogin')?.value || '/dashboard'

  const response = NextResponse.json({ success: true, redirectTo })
  response.cookies.delete('redirectAfterLogin')
  return response
}
