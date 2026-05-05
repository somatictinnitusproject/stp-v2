export const dynamic = 'force-dynamic'

/**
 * app/tfi/page.tsx
 *
 * /tfi?capture_point=intake|completion
 *
 * Server component. Validates auth, membership, and capture-point
 * eligibility before rendering TfiClient.
 *
 * Redirect rules:
 *   - Missing or invalid capture_point → /tracker
 *   - follow_up_6m → /tracker (deferred to post-launch)
 *   - Member already has a tfi_responses row for this capture_point → /tracker
 *   - intake: phase1_assessment.created_at IS NULL → /tracker
 *   - completion: framework_progress.phase5_completed_at IS NULL → /tracker
 */

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import AuthShell from '@/components/shells/AuthShell'
import { canAccessPlatform } from '@/lib/auth/access'
import TfiClient from './TfiClient'

type CapturePoint = 'intake' | 'completion'

const VALID_CAPTURE_POINTS: readonly CapturePoint[] = ['intake', 'completion']

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function TfiPage({ searchParams }: PageProps) {
  const { capture_point: rawCapturePoint } = await searchParams

  // Validate capture_point param.
  const capturePoint = typeof rawCapturePoint === 'string' ? rawCapturePoint : null
  if (
    !capturePoint ||
    !VALID_CAPTURE_POINTS.includes(capturePoint as CapturePoint)
  ) {
    redirect('/tracker')
  }
  const capture = capturePoint as CapturePoint

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: membership } = await supabase
    .from('memberships')
    .select('status, is_founding_member, is_free_for_life')
    .eq('user_id', user.id)
    .maybeSingle()

  if (!membership || !canAccessPlatform(membership)) redirect('/subscription')

  // Check for existing response at this capture point — prevent re-submission.
  const { data: existingResponse } = await supabase
    .from('tfi_responses')
    .select('id')
    .eq('user_id', user.id)
    .eq('capture_point', capture)
    .maybeSingle()

  if (existingResponse) redirect('/tracker')

  // Fetch eligibility data.
  const [{ data: phase1 }, { data: framework }] = await Promise.all([
    supabase
      .from('phase1_assessment')
      .select('created_at')
      .eq('user_id', user.id)
      .maybeSingle(),
    supabase
      .from('framework_progress')
      .select('phase5_completed_at')
      .eq('user_id', user.id)
      .maybeSingle(),
  ])

  // Eligibility checks per capture point.
  if (capture === 'intake') {
    if (!phase1?.created_at) redirect('/tracker')
  }

  if (capture === 'completion') {
    if (!framework?.phase5_completed_at) redirect('/tracker')
  }

  return (
    <AuthShell>
      <TfiClient capturePoint={capture} />
    </AuthShell>
  )
}
