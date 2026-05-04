import { redirect } from 'next/navigation'
import AuthShell from '@/components/shells/AuthShell'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import {
  canAccessPlatform,
  canAccessCommunity,
} from '@/lib/auth/access'
import {
  getUserProfile,
  getUserPosts,
  getUserReplies,
} from '@/lib/community/queries'
import CommunityLockedState from '../../community/_components/CommunityLockedState'
import ProfilePageClient from '../_components/ProfilePageClient'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ username: string }>
}

function UnknownProfileMessage({ username }: { username: string }) {
  return (
    <div className="max-w-[640px] mx-auto py-10 text-center">
      <h1 className="text-[20px] font-semibold text-text-heading mb-2">
        Profile not found
      </h1>
      <p className="text-[14px] text-text-muted">
        @{username} isn't a member here.
      </p>
    </div>
  )
}

export default async function ProfilePage({ params }: PageProps) {
  const { username: rawUsername } = await params
  const username = rawUsername.toLowerCase()

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

  if (!/^[a-z0-9_]{2,30}$/.test(username)) {
    return (
      <AuthShell>
        <UnknownProfileMessage username={rawUsername} />
      </AuthShell>
    )
  }

  // Service-role for the profile fetch (RLS only allows
  // own-row reads on users).
  const serviceClient = createServiceClient()
  const profile = await getUserProfile(serviceClient, username)
  if (!profile) {
    return (
      <AuthShell>
        <UnknownProfileMessage username={rawUsername} />
      </AuthShell>
    )
  }

  const isOwnProfile = profile.id === user.id

  const [postsPage, repliesPage] = await Promise.all([
    getUserPosts(supabase, profile.id, 0, 20),
    getUserReplies(supabase, profile.id, 0, 20),
  ])

  return (
    <AuthShell>
      <div className="max-w-[760px] mx-auto py-6">
        <ProfilePageClient
          profile={profile}
          isOwnProfile={isOwnProfile}
          initialPosts={postsPage.posts}
          initialPostsHasMore={postsPage.hasMore}
          initialReplies={repliesPage.replies}
          initialRepliesHasMore={repliesPage.hasMore}
        />
      </div>
    </AuthShell>
  )
}
