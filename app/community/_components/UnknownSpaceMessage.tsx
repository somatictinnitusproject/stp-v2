import Link from 'next/link'

interface Props {
  slug: string
}

// Inline 404 for /community/[unknown-slug]. Per Doc 14 §4.8:
// "This space doesn't exist. Link back to /community."
export default function UnknownSpaceMessage({ slug }: Props) {
  return (
    <div className="max-w-[560px] mx-auto py-12 text-center">
      <h1 className="text-[20px] font-semibold leading-tight text-text-heading mb-3">
        This space doesn&#8217;t exist
      </h1>
      <p className="text-[14px] text-text-muted mb-6">
        We couldn&#8217;t find a community space called{' '}
        <span className="font-mono">{slug}</span>.
      </p>
      <Link
        href="/community"
        className="text-primary hover:text-primary-hover underline text-[15px]"
      >
        ← Back to Community
      </Link>
    </div>
  )
}
