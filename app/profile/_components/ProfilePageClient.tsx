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

interface Props {
  profile: UserProfile
  isOwnProfile: boolean
  initialPosts: SpacePost[]
  initialPostsHasMore: boolean
  initialReplies: UserReply[]
  initialRepliesHasMore: boolean
}

export default function ProfilePageClient({
  profile: initialProfile,
  isOwnProfile,
  initialPosts,
  initialPostsHasMore,
  initialReplies,
  initialRepliesHasMore,
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
