import Link from 'next/link'
import type { UserProfile } from '@/lib/community/queries'
import AvatarCircle from '@/app/community/_components/AvatarCircle'
import FounderBadge from '@/app/community/_components/FounderBadge'

interface Props {
  profile: UserProfile
  isOwnProfile: boolean
  onEditClick?: () => void
}

function formatMemberSince(iso: string): string {
  const date = new Date(iso)
  return date.toLocaleString('en-GB', { month: 'long', year: 'numeric' })
}

export default function ProfileHeader({
  profile,
  isOwnProfile,
  onEditClick,
}: Props) {
  return (
    <header className="bg-surface border border-border rounded-xl p-5 md:p-6 mb-6">
      <div className="flex items-start gap-4">
        <AvatarCircle username={profile.username} size="lg" />
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <h1 className="text-[20px] md:text-[22px] font-semibold text-text-heading">
              @{profile.username}
            </h1>
            {profile.is_admin && <FounderBadge />}
          </div>
          <p className="text-[13px] text-text-muted mb-3">
            Member since {formatMemberSince(profile.created_at)}
          </p>
          {profile.bio ? (
            <p className="text-[14px] text-text-body leading-relaxed whitespace-pre-line">
              {profile.bio}
            </p>
          ) : isOwnProfile ? (
            <button
              type="button"
              onClick={onEditClick}
              className="text-[14px] font-medium text-primary hover:text-primary-hover transition-colors"
            >
              Add a bio →
            </button>
          ) : null}
        </div>
        {isOwnProfile && profile.bio && (
          <button
            type="button"
            onClick={onEditClick}
            className="text-[13px] font-medium text-text-muted hover:text-text-body px-3 py-1.5 transition-colors"
          >
            Edit
          </button>
        )}
      </div>
    </header>
  )
}
