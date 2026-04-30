// app/framework/phase-3/reading-[id]/page.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Server component. Standalone reading page for Phase 3 TMJ orientation
// sections (D.1, D.2, D.3). Accessible from /framework/phase-3 reading rows.
//
// Renders ReadingView in reviewMode — no acknowledge button. Members can
// re-read at any time regardless of acknowledgement state (M13l.1).
//
// Auth gate → /login. Phase gate → /dashboard (current_phase < 3).
// Unknown ID → 404 via notFound().
// ─────────────────────────────────────────────────────────────────────────────

import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import AuthShell from '@/components/shells/AuthShell'
import ReadingView from '@/components/exercise/reading-view'
import { getReadingSectionById } from '@/content/framework/phase-3/_lookup'
import { PHASE_3_READING_IDS } from '@/content/framework/phase-3'
import type { FrameworkProgressRow, Phase1AssessmentRow } from '@/lib/scoring/types'

export const dynamic = 'force-dynamic'

interface Props {
  params: Promise<{ id: string }>
}

export default async function ReadingPage({ params }: Props) {
  const { id } = await params

  console.log('[reading-page-v2]', JSON.stringify({
    id,
    idTypeOf: typeof id,
    hasFn: typeof PHASE_3_READING_IDS?.has,
    setSize: PHASE_3_READING_IDS?.size,
    setArray: PHASE_3_READING_IDS ? Array.from(PHASE_3_READING_IDS) : null,
    setHas: PHASE_3_READING_IDS?.has?.(id),
  }))

  if (!PHASE_3_READING_IDS.has(id)) notFound()

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: progressRaw } = await supabase
    .from('framework_progress')
    .select('current_phase, protocol_option')
    .eq('user_id', user.id)
    .single()

  if (!progressRaw || progressRaw.current_phase < 3) redirect('/dashboard')

  const { data: assessmentRaw } = await supabase
    .from('phase1_assessment')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (!assessmentRaw) redirect('/dashboard')

  const progress = progressRaw as unknown as Pick<FrameworkProgressRow, 'current_phase' | 'protocol_option'>
  const assessment = assessmentRaw as unknown as Phase1AssessmentRow

  const section = getReadingSectionById(id)

  return (
    <AuthShell>
      <div className="max-w-[720px] mx-auto py-8">
        <p className="text-[12px] font-medium text-primary uppercase tracking-wide mb-1">Phase 3</p>
        <h1 className="text-[28px] md:text-[36px] font-bold text-text-heading mb-6">
          {section.title}
        </h1>

        <ReadingView
          section={section}
          phase1={assessment}
          protocolOption={progress.protocol_option ?? null}
          reviewMode={true}
        />

        <div className="mt-6">
          <Link
            href="/framework/phase-3"
            className="text-primary hover:underline text-[14px]"
          >
            ← Back to Phase 3
          </Link>
        </div>
      </div>
    </AuthShell>
  )
}
