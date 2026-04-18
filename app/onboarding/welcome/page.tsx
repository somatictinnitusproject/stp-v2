import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import OnboardingShell from '@/components/shells/OnboardingShell'
import WelcomeDashboardButton from '@/components/onboarding/WelcomeDashboardButton'
import Link from 'next/link'

export default async function OnboardingWelcomePage() {
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

  const { data: userData } = await supabase
    .from('users')
    .select('display_name')
    .eq('id', user.id)
    .single()

  const { data: membership } = await supabase
    .from('memberships')
    .select('is_founding_member')
    .eq('user_id', user.id)
    .single()

  const displayName = userData?.display_name ?? 'there'
  const isFoundingMember = membership?.is_founding_member === true

  return (
    <OnboardingShell>
      <div className="max-w-[560px] mx-auto">
        <p className="text-[13px] font-medium text-text-muted uppercase tracking-wide mb-2">
          Step 5 of 5
        </p>
        <h1 className="text-[28px] font-bold text-text-heading leading-tight mb-6">
          Welcome to the Somatic Tinnitus Project, {displayName}.
        </h1>

        <div className="flex flex-col gap-4 text-[16px] text-text-body leading-relaxed mb-10">
          <p>
            Your account is set up and your programme is ready. Start with Phase 1 — it
            builds the foundation everything else depends on.
          </p>
          <p>
            The framework typically takes three to four months to work through fully,
            though you set the pace. Most members see meaningful change within the first
            few weeks.
          </p>
          <p>
            The progress tracker is your daily companion throughout. Even on days when you
            don&apos;t have time for a full session, logging takes under a minute.
          </p>
          {isFoundingMember && (
            <p>
              As a founding member you have free lifetime access to everything on the
              platform. Thank you for being here from the beginning.
            </p>
          )}
        </div>

        <WelcomeDashboardButton />

        <p className="text-[13px] text-text-muted mt-4 text-center">
          <Link
            href="/programme-overview"
            className="text-primary hover:text-primary-hover font-medium"
          >
            View the full programme
          </Link>
        </p>
      </div>
    </OnboardingShell>
  )
}
