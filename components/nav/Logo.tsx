import Link from 'next/link'

export default function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2 no-underline">
      <span className="text-[15px] font-semibold text-text-heading tracking-tight">
        Somatic Tinnitus Project
      </span>
    </Link>
  )
}
