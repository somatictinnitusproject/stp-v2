import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import OnboardingShell from '@/components/shells/OnboardingShell'
import TestResultClient from '@/components/onboarding/TestResultClient'

type Classification = 'A' | 'B' | 'C'

function normaliseParam(raw: string | string[] | undefined): Classification | null {
  if (!raw) return null
  const val = (Array.isArray(raw) ? raw[0] : raw).toUpperCase()
  if (val === 'A' || val === 'B' || val === 'C') return val as Classification
  return null
}

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function OnboardingTestResultPage({ searchParams }: PageProps) {
  const { result: rawResult } = await searchParams
  const preselected = normaliseParam(rawResult)

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

  return (
    <OnboardingShell>
      <TestResultClient preselected={preselected} />
    </OnboardingShell>
  )
}
