import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import OnboardingShell from '@/components/shells/OnboardingShell'
import PaymentContinueButton from '@/components/onboarding/PaymentContinueButton'

export default async function OnboardingPaymentPage() {
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

  // Founding members never see this screen — they have lifetime access with no payment
  const { data: membership } = await supabase
    .from('memberships')
    .select('is_founding_member')
    .eq('user_id', user.id)
    .single()

  if (membership?.is_founding_member === true) {
    redirect('/onboarding/welcome')
  }

  return (
    <OnboardingShell>
      <div className="max-w-[560px] mx-auto">
        <p className="text-[13px] font-medium text-text-muted uppercase tracking-wide mb-2">
          Step 4 of 5
        </p>
        <h1 className="text-[28px] font-bold text-text-heading leading-tight mb-2">
          Start your membership
        </h1>
        <div className="bg-surface border border-border rounded-xl p-6 mb-6 text-[15px] text-text-body leading-relaxed">
          <p className="mb-4">
            The Somatic Tinnitus Project gives you a structured, five-phase programme built
            around identifying and addressing the specific physical drivers of your tinnitus —
            not a generic protocol, but a framework that starts with your assessment result and
            builds everything around your profile.
          </p>
          <p className="mb-4">
            You get full access to every phase of the framework personalised to your driver
            profile, the daily progress tracker with insights drawn from your own data, the
            complete exercise and resource library, and an active community of people working
            through the same process.
          </p>
          <p className="font-medium text-text-heading">
            £2.99 per month. Cancel any time. Your data is yours — exported or deleted on
            request.
          </p>
        </div>

        {/* Stripe Elements placeholder */}
        <div className="bg-surface-raised border border-border rounded-xl p-6 mb-4 opacity-60 select-none">
          <p className="text-[13px] font-medium text-text-muted uppercase tracking-wide mb-4">
            Payment details
          </p>
          <div className="flex flex-col gap-3">
            <div className="h-[46px] bg-border rounded-lg" />
            <div className="flex gap-3">
              <div className="h-[46px] bg-border rounded-lg flex-1" />
              <div className="h-[46px] bg-border rounded-lg flex-1" />
            </div>
          </div>
          <p className="text-[13px] text-text-muted text-center mt-4">
            Payment setup coming in a later phase
          </p>
        </div>

        <p className="text-[13px] text-text-muted text-center mb-6 flex items-center justify-center gap-1">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          Cancel any time. No hidden fees. Secure payment powered by Stripe.
        </p>

        <PaymentContinueButton />
      </div>
    </OnboardingShell>
  )
}
