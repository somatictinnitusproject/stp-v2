'use client'

import { useState } from 'react'
import type {
  UserProfile,
  SpacePost,
  UserReply,
} from '@/lib/community/queries'
import ProfileHeader from './ProfileHeader'
import ProfileTabs from './ProfileTabs'
import ProfilePostList from './ProfilePostList'
import ProfileReplyList from './ProfileReplyList'
import EditProfileModal from '@/components/profile/EditProfileModal'
import ResearchConsentToggle from '@/components/profile/ResearchConsentToggle'

interface Props {
  profile: UserProfile
  isOwnProfile: boolean
  initialPosts: SpacePost[]
  initialPostsHasMore: boolean
  initialReplies: UserReply[]
  initialRepliesHasMore: boolean
  researchConsent: boolean | null
}

export default function ProfilePageClient({
  profile: initialProfile,
  isOwnProfile,
  initialPosts,
  initialPostsHasMore,
  initialReplies,
  initialRepliesHasMore,
  researchConsent,
}: Props) {
  const [profile, setProfile] = useState(initialProfile)
  const [tab, setTab] = useState<'posts' | 'replies'>('posts')
  const [showEditModal, setShowEditModal] = useState(false)

  const postsEmpty = isOwnProfile
    ? 'No posts yet.'
    : `@${profile.username} hasn't posted yet.`
  const repliesEmpty = isOwnProfile
    ? 'No replies yet.'
    : `@${profile.username} hasn't replied yet.`

  return (
    <>
      <ProfileHeader
        profile={profile}
        isOwnProfile={isOwnProfile}
        onEditClick={() => setShowEditModal(true)}
      />

      <ProfileTabs active={tab} onChange={setTab} />

      {tab === 'posts' ? (
        <ProfilePostList
          username={profile.username}
          initialPosts={initialPosts}
          initialHasMore={initialPostsHasMore}
          emptyMessage={postsEmpty}
        />
      ) : (
        <ProfileReplyList
          username={profile.username}
          initialReplies={initialReplies}
          initialHasMore={initialRepliesHasMore}
          emptyMessage={repliesEmpty}
        />
      )}

      {isOwnProfile && (
        <div className="bg-surface border border-border rounded-xl p-5 mt-6">
          <h3 className="text-[15px] font-semibold text-text-heading mb-1">Research consent</h3>
          <p className="text-[13px] text-text-muted mb-4">
            Your progress data may be used anonymously to support tinnitus research. You can withdraw this at any time.
          </p>
          <ResearchConsentToggle initialValue={researchConsent} />
        </div>
      )}

      {showEditModal && (
        <EditProfileModal
          initialBio={profile.bio}
          onCancel={() => setShowEditModal(false)}
          onSaved={(newBio) => {
            setProfile((prev) => ({ ...prev, bio: newBio }))
            setShowEditModal(false)
          }}
        />
      )}
    </>
  )
}
