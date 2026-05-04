import Link from 'next/link'

interface Props {
  spaceSlug: string
}

// Inline 404 when /community/[space-slug]/[post-id] does not
// resolve to a non-deleted post in the expected space. Per
// Doc 14 §4.8.
export default function UnknownPostMessage({ spaceSlug }: Props) {
  return (
    <div className="max-w-[560px] mx-auto py-12 text-center">
      <h1 className="text-[20px] font-semibold leading-tight text-text-heading mb-3">
        This post doesn&#8217;t exist
      </h1>
      <p className="text-[14px] text-text-muted mb-6">
        It may have been removed, or the link is wrong.
      </p>
      <Link
        href={`/community/${spaceSlug}`}
        className="text-primary hover:text-primary-hover underline text-[15px]"
      >
        ← Back to space
      </Link>
    </div>
  )
}
