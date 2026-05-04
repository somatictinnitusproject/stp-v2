import Link from 'next/link'
import { Plus } from 'lucide-react'

interface Props {
  spaceSlug: string
}

// Renders two visual treatments:
// - Inline primary button (visible md and up)
// - Floating action button bottom-right (mobile only)
//
// Both link to /community/[space-slug]/new. Spec from
// Doc 12 §11.5.
export default function NewPostButton({ spaceSlug }: Props) {
  const href = `/community/${spaceSlug}/new`

  return (
    <>
      <Link
        href={href}
        className="hidden md:inline-flex items-center gap-2 bg-primary hover:bg-primary-hover text-white text-[14px] font-medium px-4 py-2 rounded-lg transition-colors"
      >
        <Plus className="w-4 h-4" strokeWidth={2.25} />
        New post
      </Link>

      <Link
        href={href}
        aria-label="New post"
        className="md:hidden fixed bottom-20 right-4 z-20 w-14 h-14 rounded-full bg-primary hover:bg-primary-hover text-white flex items-center justify-center shadow-lg transition-colors"
      >
        <Plus className="w-6 h-6" strokeWidth={2.25} />
      </Link>
    </>
  )
}
