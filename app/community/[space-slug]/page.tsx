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
import { getSpacePosts } from '@/lib/community/queries'
import CommunityLockedState from '../_components/CommunityLockedState'
import UnknownSpaceMessage from '../_components/UnknownSpaceMessage'
import CharterGate from '@/components/community/CharterGate'
import PostList from '../_components/PostList'
import NewPostButton from '../_components/NewPostButton'

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

  if (!isCommunitySpaceSlug(rawSlug)) {
    return (
      <AuthShell>
        <UnknownSpaceMessage slug={rawSlug} />
      </AuthShell>
    )
  }

  const space = getCommunitySpace(rawSlug)

  const [{ data: userRow }, postsPage] = await Promise.all([
    supabase
      .from('users')
      .select('community_charter_acknowledged_at')
      .eq('id', user.id)
      .maybeSingle(),
    getSpacePosts(supabase, rawSlug, 0, 20),
  ])

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
          <div className="flex items-start justify-between gap-4 mb-2">
            <h1 className="text-[28px] font-semibold leading-tight text-text-heading">
              {space.name}
            </h1>
            <NewPostButton spaceSlug={rawSlug} />
          </div>
          <p className="text-[15px] text-text-muted mb-6">
            {space.description}
          </p>
          <PostList
            spaceSlug={rawSlug}
            initialPosts={postsPage.posts}
            initialHasMore={postsPage.hasMore}
          />
        </div>
      </CharterGate>
    </AuthShell>
  )
}
