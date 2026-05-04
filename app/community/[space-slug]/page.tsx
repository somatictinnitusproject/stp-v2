import Link from 'next/link'
import { redirect } from 'next/navigation'
import AuthShell from '@/components/shells/AuthShell'
import { createClient } from '@/lib/supabase/server'
import {
  canAccessPlatform,
  canAccessCommunity,
} from '@/lib/auth/access'
import {
  isCommunitySpaceSlug,
  getCommunitySpace,
} from '@/content/community-spaces'
import CommunityLockedState from '../_components/CommunityLockedState'
import UnknownSpaceMessage from '../_components/UnknownSpaceMessage'
import CharterGate from '@/components/community/CharterGate'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ 'space-slug': string }>
}

export default async function SpaceFeedPage({ params }: PageProps) {
  const { 'space-slug': rawSlug } = await params

  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: membership } = await supabase
    .from('memberships')
    .select('status, is_founding_member')
    .eq('user_id', user.id)
    .maybeSingle()

  if (!membership || !canAccessPlatform(membership)) {
    redirect('/subscription')
  }

  const { data: frameworkProgress } = await supabase
    .from('framework_progress')
    .select('phase1_completed_at')
    .eq('user_id', user.id)
    .maybeSingle()

  if (!canAccessCommunity(membership, frameworkProgress)) {
    return (
      <AuthShell>
        <CommunityLockedState />
      </AuthShell>
    )
  }

  if (!isCommunitySpaceSlug(rawSlug)) {
    return (
      <AuthShell>
        <UnknownSpaceMessage slug={rawSlug} />
      </AuthShell>
    )
  }

  const space = getCommunitySpace(rawSlug)

  const { data: userRow } = await supabase
    .from('users')
    .select('community_charter_acknowledged_at')
    .eq('id', user.id)
    .maybeSingle()

  const acknowledged =
    userRow?.community_charter_acknowledged_at !== null &&
    userRow?.community_charter_acknowledged_at !== undefined

  return (
    <AuthShell>
      <CharterGate initiallyAcknowledged={acknowledged}>
        <div className="max-w-[760px] mx-auto py-6">
          <Link
            href="/community"
            className="text-[14px] text-text-muted hover:text-text-body inline-block mb-4"
          >
            ← Community
          </Link>
          <h1 className="text-[28px] font-semibold leading-tight text-text-heading mb-2">
            {space.name}
          </h1>
          <p className="text-[15px] text-text-muted mb-8">
            {space.description}
          </p>
          <div className="bg-surface border border-border rounded-lg p-6 text-center">
            <p className="text-[14px] text-text-muted">
              Posts in this space appear here. The feed lands in the next
              build phase.
            </p>
          </div>
        </div>
      </CharterGate>
    </AuthShell>
  )
}
