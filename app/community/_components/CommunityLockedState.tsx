import Link from 'next/link'
import { Lock } from 'lucide-react'

// Rendered inside AuthShell on /community when the member fails
// canAccessCommunity. Soft gate — the member stays on the route
// and sees the reason rather than a redirect.
export default function CommunityLockedState() {
  return (
    <div className="max-w-[560px] mx-auto py-12 text-center">
      <div className="inline-flex items-center justify-center w-12 h-12 bg-surface-raised rounded-full mb-4">
        <Lock className="w-5 h-5 text-text-muted" strokeWidth={1.75} />
      </div>
      <h1 className="text-[24px] font-semibold leading-tight text-text-heading mb-3">
        Community unlocks at the end of Phase 1
      </h1>
      <p className="text-[15px] text-text-muted mb-6 leading-relaxed">
        The community space opens up when you complete Phase 1; once you
        have your profile and know which protocol applies to you, your
        contributions are far more useful to other members.
      </p>
      <Link
        href="/framework/phase-1"
        className="inline-block bg-primary hover:bg-primary-hover text-white text-[15px] font-medium px-5 py-2.5 rounded-lg transition-colors"
      >
        Continue Phase 1
      </Link>
    </div>
  )
}
