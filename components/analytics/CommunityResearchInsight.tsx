'use client'

import { COMMUNITY_RESEARCH_INSIGHT } from '@/content/static/community-research'

export default function CommunityResearchInsight() {
  return (
    <div className="bg-surface-raised border border-border rounded-xl p-5">
      <p className="text-[12px] font-medium tracking-wider uppercase text-text-muted mb-3">
        From the community
      </p>
      <p className="text-[14px] text-text-body leading-relaxed">
        {COMMUNITY_RESEARCH_INSIGHT}
      </p>
    </div>
  )
}
