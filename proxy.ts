import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

const PUBLIC_ROUTES = [
  '/',
  '/login',
  '/signup',
  '/reset-password',
  '/reset-password/confirm',
  '/terms',
  '/privacy',
  '/test',
]

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  const response = NextResponse.next({
    request: { headers: request.headers },
  })

  // 1. Static assets and API routes — pass through immediately
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.')
  ) {
    return response
  }

  // 2. Public routes — pass through
  if (PUBLIC_ROUTES.includes(pathname)) {
    return response
  }

  // Create Supabase client with cookie handling for session refresh
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value)
            response.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // 3. No session — redirect to login, store return URL for 5 minutes
  if (!user) {
    const loginUrl = new URL('/login', request.url)
    const redirectResponse = NextResponse.redirect(loginUrl)
    redirectResponse.cookies.set('redirectAfterLogin', pathname, {
      maxAge: 300,
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
    })
    return redirectResponse
  }

  // 4. /onboarding/* and /subscription — always allow authenticated users through
  if (pathname.startsWith('/onboarding') || pathname === '/subscription') {
    return response
  }

  // Fetch onboarding state
  const { data: userData } = await supabase
    .from('users')
    .select('onboarding_completed')
    .eq('id', user.id)
    .single()

  // 5. Onboarding not completed — redirect to /onboarding
  if (!userData?.onboarding_completed) {
    return NextResponse.redirect(new URL('/onboarding', request.url))
  }

  // Fetch membership
  const { data: membership } = await supabase
    .from('memberships')
    .select('status, is_founding_member')
    .eq('user_id', user.id)
    .single()

  // 6. Membership row missing — redirect to /onboarding
  if (!membership) {
    return NextResponse.redirect(new URL('/onboarding', request.url))
  }

  // 7. Cancelled and not a founding member — redirect to /subscription
  if (membership.status === 'cancelled' && !membership.is_founding_member) {
    return NextResponse.redirect(new URL('/subscription', request.url))
  }

  // 8. All other authenticated requests — allow through
  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
