import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'

export default async function OnboardingIndexPage() {
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

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) redirect('/login')

  const [{ data: userData }, { data: membership }] = await Promise.all([
    supabase.from('users').select('onboarding_completed, onboarding_step').eq('id', user.id).single(),
    supabase.from('memberships').select('is_founding_member').eq('user_id', user.id).single(),
  ])

  // Fully completed — always goes to dashboard regardless of step value
  if (userData?.onboarding_completed === true) redirect('/dashboard')

  const step = userData?.onboarding_step ?? 1
  const isFoundingMember = membership?.is_founding_member === true

  switch (step) {
    case 2:
      redirect('/onboarding/consent')
    case 3:
      redirect('/onboarding/test-result')
    case 4:
      redirect('/onboarding/welcome')
    case 5:
      // Step 5 is the payment position marker — founding members skip payment
      redirect(isFoundingMember ? '/onboarding/welcome' : '/onboarding/payment')
    default:
      // step 1 or any unexpected value → start of onboarding
      redirect('/onboarding/terms')
  }
}
