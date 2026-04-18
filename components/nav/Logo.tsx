import Link from 'next/link'

export default function Logo({ href = '/' }: { href?: string }) {
  return (
    <Link href={href} className="flex items-center gap-[10px] no-underline flex-shrink-0">
      <div className="w-8 h-8 rounded-[6px] bg-primary flex items-center justify-center">
        <span className="text-[11px] font-bold text-white leading-none">STP</span>
      </div>
      <span className="text-[15px] font-semibold leading-none">
        <span className="text-text-heading">Somatic Tinnitus</span>
        {' '}
        <span className="text-primary">Project</span>
      </span>
    </Link>
  )
}
