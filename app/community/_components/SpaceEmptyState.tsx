import Link from 'next/link'

interface Props {
  spaceSlug: string
}

// Shown when a space has zero non-deleted posts. Centred message
// + primary CTA into the new post flow.
export default function SpaceEmptyState({ spaceSlug }: Props) {
  return (
    <div className="bg-surface border border-border border-dashed rounded-xl p-8 text-center">
      <p className="text-[15px] text-text-body mb-1">
        No posts here yet.
      </p>
      <p className="text-[14px] text-text-muted mb-5">
        Be the first to post.
      </p>
      <Link
        href={`/community/${spaceSlug}/new`}
        className="inline-block bg-primary hover:bg-primary-hover text-white text-[14px] font-medium px-5 py-2.5 rounded-lg transition-colors"
      >
        New post
      </Link>
    </div>
  )
}
