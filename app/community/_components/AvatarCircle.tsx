import {
  getAvatarBgClass,
  getAvatarInitials,
} from '@/lib/community/avatar'

interface Props {
  username: string | null | undefined
  size?: 'sm' | 'md'
}

// Small reusable avatar circle. Initials on a deterministic
// colour derived from the username.
export default function AvatarCircle({ username, size = 'md' }: Props) {
  const sizeClasses =
    size === 'sm'
      ? 'w-7 h-7 text-[11px]'
      : 'w-9 h-9 text-[13px]'

  return (
    <div
      className={`${sizeClasses} ${getAvatarBgClass(username)} rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0`}
      aria-hidden="true"
    >
      {getAvatarInitials(username)}
    </div>
  )
}
