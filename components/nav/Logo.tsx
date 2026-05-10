import Link from 'next/link'
import Image from 'next/image'

export default function Logo({ href = '/' }: { href?: string }) {
  return (
    <Link href={href} className="flex items-center no-underline flex-shrink-0">
      <Image
        src="/logo.png"
        alt="Somatic Tinnitus Project"
        width={36}
        height={36}
        priority
      />
    </Link>
  )
}
