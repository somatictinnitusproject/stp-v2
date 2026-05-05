import { redirect } from 'next/navigation'
import AuthShell from '@/components/shells/AuthShell'
import { createClient } from '@/lib/supabase/server'
import {
  canAccessPlatform,
  canAccessCommunity,
} from '@/lib/auth/access'
import {
  getRecentActivity,
  getSpaceMetadata,
} from '@/lib/community/queries'
import RecentActivityList from './_components/RecentActivityList'
import SpacesList from './_components/SpacesList'
import CommunityLockedState from './_components/CommunityLockedState'
import CharterGate from '@/components/community/CharterGate'

export const dynamic = 'force-dynamic'

export default async function CommunityHomePage() {
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

  // Fetch charter ack timestamp + community data in parallel.
  const [userRow, recentActivity, spaceMetadata] = await Promise.all([
    supabase
      .from('users')
      .select('community_charter_acknowledged_at')
      .eq('id', user.id)
      .maybeSingle(),
    getRecentActivity(supabase, 4),
    getSpaceMetadata(supabase),
  ])

  const acknowledged =
    userRow.data?.community_charter_acknowledged_at !== null &&
    userRow.data?.community_charter_acknowledged_at !== undefined

  return (
    <AuthShell>
      <CharterGate initiallyAcknowledged={acknowledged}>
        <div className="max-w-[760px] mx-auto py-6">
          <h1 className="text-[28px] font-semibold leading-tight text-text-heading mb-6">
            Community
          </h1>
          <RecentActivityList items={recentActivity} />
          <SpacesList metadata={spaceMetadata} />
        </div>
      </CharterGate>
    </AuthShell>
  )
}
