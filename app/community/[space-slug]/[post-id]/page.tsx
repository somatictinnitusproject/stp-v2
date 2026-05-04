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
import { getPostWithReplies } from '@/lib/community/queries'
import CharterGate from '@/components/community/CharterGate'
import CommunityLockedState from '../../_components/CommunityLockedState'
import UnknownSpaceMessage from '../../_components/UnknownSpaceMessage'
import UnknownPostMessage from '../../_components/UnknownPostMessage'
import PostDetail from '../../_components/PostDetail'
import ReplyThread from '../../_components/ReplyThread'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ 'space-slug': string; 'post-id': string }>
}

export default async function SinglePostPage({ params }: PageProps) {
  const { 'space-slug': rawSlug, 'post-id': postId } = await params

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

  const [{ data: userRow }, post] = await Promise.all([
    supabase
      .from('users')
      .select('community_charter_acknowledged_at, is_admin')
      .eq('id', user.id)
      .maybeSingle(),
    getPostWithReplies(supabase, postId, rawSlug),
  ])

  const acknowledged =
    userRow?.community_charter_acknowledged_at !== null &&
    userRow?.community_charter_acknowledged_at !== undefined

  const currentUserIsAdmin = userRow?.is_admin === true

  if (!post) {
    return (
      <AuthShell>
        <CharterGate initiallyAcknowledged={acknowledged}>
          <UnknownPostMessage spaceSlug={rawSlug} />
        </CharterGate>
      </AuthShell>
    )
  }

  return (
    <AuthShell>
      <CharterGate initiallyAcknowledged={acknowledged}>
        <div className="max-w-[760px] mx-auto py-6">
          <Link
            href={`/community/${rawSlug}`}
            className="text-[14px] text-text-muted hover:text-text-body inline-block mb-4"
          >
            ← {space.name}
          </Link>

          <PostDetail
            post={post}
            currentUserId={user.id}
            currentUserIsAdmin={currentUserIsAdmin}
          />

          <ReplyThread
            postId={post.id}
            initialReplies={post.replies}
            currentUserId={user.id}
            currentUserIsAdmin={currentUserIsAdmin}
          />
        </div>
      </CharterGate>
    </AuthShell>
  )
}
