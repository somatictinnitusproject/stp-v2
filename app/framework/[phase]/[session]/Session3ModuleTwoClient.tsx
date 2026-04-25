'use client'

// B.3 — Module 2: Cervical Driver client component.
// G4 Framework Content Form View layout (Doc 11 G4):
//   max-width reading (680px) · space-5 top / space-6 bottom · section label →
//   h1 → mechanism education section (heading-2) → assessment question cards →
//   history section → context section → submit button.
//
// ERRATA E13: M3/M4/M5 sourced from live Phase 1 fields (not intake fallback).
// ERRATA E16: Floor lying relief test removed from Module 2 scope entirely.
//
// New inputKinds beyond Session2ModuleOneClient.tsx:
//   'yes-no-asymmetric'      — Q2 M4 head rotation: primary yes/no + secondary asymmetric yes/no
//   'yes-no-asymmetric-side' — Q4 suboccipital: primary yes/no + secondary asymmetric yes/no + tertiary side left/right

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { B3Module2Cerv } from '@/content/framework/phase-1/b3-module-2-cervical'
import VideoSlot from '@/components/ui/VideoSlot'
import ScrollProgressBar from '@/components/ui/ScrollProgressBar'

type PrimaryAnswer = 'yes' | 'no' | null
type DirectionAnswer = 'left' | 'right' | null
type TriAnswer = 'yes' | 'sometimes' | 'no' | null

function OptionBtn({
  label,
  selected,
  onClick,
}: {
  label: string
  selected: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-4 h-11 rounded-[8px] text-body-sm border transition-colors ${
        selected
          ? 'bg-wins-bg border-primary text-primary font-medium'
          : 'bg-surface border-border text-text-body hover:border-primary'
      }`}
    >
      {label}
    </button>
  )
}

export default function Session3ModuleTwoClient({ content }: { content: B3Module2Cerv }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Q1 — M3 Neck Flexion: yes/no
  const [q1M3, setQ1M3] = useState<PrimaryAnswer>(null)

  // Q2 — M4 Head Rotation: primary yes/no + conditional asymmetric yes/no
  const [q2M4Primary, setQ2M4Primary] = useState<PrimaryAnswer>(null)
  const [q2M4Asymmetric, setQ2M4Asymmetric] = useState<PrimaryAnswer>(null)

  // Q3 — M5 Chin Retraction: yes/no
  const [q3M5, setQ3M5] = useState<PrimaryAnswer>(null)

  // Q4 — Suboccipital Palpation: primary yes/no + secondary asymmetric yes/no + tertiary side left/right
  const [q4SuboccPrimary, setQ4SuboccPrimary] = useState<PrimaryAnswer>(null)
  const [q4SuboccAsym, setQ4SuboccAsym] = useState<PrimaryAnswer>(null)
  const [q4SuboccSide, setQ4SuboccSide] = useState<DirectionAnswer>(null)

  // Q5 — SCM Palpation: primary yes/no + conditional dominant side left/right
  const [q5ScmPrimary, setQ5ScmPrimary] = useState<PrimaryAnswer>(null)
  const [q5ScmSide, setQ5ScmSide] = useState<DirectionAnswer>(null)

  // Q6 — Upper Trapezius Palpation: primary yes/no + conditional dominant side left/right
  const [q6TrapPrimary, setQ6TrapPrimary] = useState<PrimaryAnswer>(null)
  const [q6TrapSide, setQ6TrapSide] = useState<DirectionAnswer>(null)

  // Q7 — Rotation Range: primary yes/no + conditional restricted side left/right
  const [q7RotPrimary, setQ7RotPrimary] = useState<PrimaryAnswer>(null)
  const [q7RotSide, setQ7RotSide] = useState<DirectionAnswer>(null)

  // Q8 — Forward Head Posture: yes/no
  const [q8Fhp, setQ8Fhp] = useState<PrimaryAnswer>(null)

  // History questions — Yes/Sometimes/No (3 questions)
  const [history, setHistory] = useState<Record<string, TriAnswer>>({
    cerv_neck_pain: null,
    cerv_cervicogenic_headaches: null,
    cerv_worse_desk_work: null,
  })

  // Context questions — Yes/No (3 questions)
  const [ctx, setCtx] = useState<Record<string, PrimaryAnswer>>({
    ctx_whiplash_history: null,
    ctx_sedentary_occupation: null,
    ctx_one_sided_sport: null,
  })

  // All primary answers must be set. Conditional secondaries/tertiaries required when primary === 'yes'.
  // Suboccipital tertiary (side) only required when both primary and secondary are 'yes'.
  const isComplete =
    q1M3 !== null &&
    q2M4Primary !== null &&
    (q2M4Primary !== 'yes' || q2M4Asymmetric !== null) &&
    q3M5 !== null &&
    q4SuboccPrimary !== null &&
    (q4SuboccPrimary !== 'yes' || q4SuboccAsym !== null) &&
    (q4SuboccAsym !== 'yes' || q4SuboccSide !== null) &&
    q5ScmPrimary !== null &&
    (q5ScmPrimary !== 'yes' || q5ScmSide !== null) &&
    q6TrapPrimary !== null &&
    (q6TrapPrimary !== 'yes' || q6TrapSide !== null) &&
    q7RotPrimary !== null &&
    (q7RotPrimary !== 'yes' || q7RotSide !== null) &&
    q8Fhp !== null &&
    Object.values(history).every(v => v !== null) &&
    Object.values(ctx).every(v => v !== null)

  async function handleSubmit() {
    if (loading) return
    setLoading(true)
    setError(null)

    const payload = {
      cerv_m3_neck_curl: q1M3,
      cerv_m4_head_rotation: q2M4Primary,
      cerv_m4_asymmetric_side: q2M4Primary === 'yes' ? q2M4Asymmetric : null,
      cerv_m5_chin_tuck: q3M5,
      cerv_suboccipital_tenderness: q4SuboccPrimary,
      cerv_suboccipital_asymmetric: q4SuboccPrimary === 'yes' ? q4SuboccAsym : null,
      cerv_suboccipital_tender_side: (q4SuboccPrimary === 'yes' && q4SuboccAsym === 'yes') ? q4SuboccSide : null,
      cerv_scm_asymmetry: q5ScmPrimary,
      cerv_scm_dominant_side: q5ScmPrimary === 'yes' ? q5ScmSide : null,
      cerv_trap_asymmetry: q6TrapPrimary,
      cerv_trap_dominant_side: q6TrapPrimary === 'yes' ? q6TrapSide : null,
      cerv_rotation_restriction: q7RotPrimary,
      cerv_restricted_side: q7RotPrimary === 'yes' ? q7RotSide : null,
      cerv_forward_head_posture: q8Fhp,
      ...history,
      ...ctx,
    }

    // TODO 8.5: route /api/framework/phase-1/module-2 built in sub-step 8.5
    try {
      const res = await fetch('/api/framework/phase-1/module-2', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (res.status === 401) {
        router.push('/login')
        return
      }
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        setError((body as { message?: string }).message ?? 'Something went wrong. Please try again.')
        setLoading(false)
        return
      }
      router.refresh()
      router.push('/framework/phase-1/session-4')
    } catch {
      setError('Network error. Please check your connection and try again.')
      setLoading(false)
    }
  }

  // content.questions index map:
  // 0=Q1 M3 neck curl, 1=Q2 M4 head rotation, 2=Q3 M5 chin tuck,
  // 3=Q4 suboccipital, 4=Q5 SCM, 5=Q6 upper trap, 6=Q7 rotation range, 7=Q8 FHP
  const q = content.questions

  return (
    <div className="max-w-[680px] mx-auto pt-10 pb-16">

      <ScrollProgressBar />

      {/* Section label — phase-label type: 12px / 600 / uppercase / 0.06em tracking (Doc 11 §2.4) */}
      <p className="text-phase-label text-primary uppercase tracking-[0.06em] mb-3">
        {content.sectionLabel}
      </p>

      {/* Section heading — heading-1: 28px mobile / 36px desktop per Doc 11 §2.3 */}
      <h1 className="text-[28px] md:text-[36px] font-bold leading-[1.2] text-text-heading mb-8">
        {content.sectionTitle}
      </h1>

      {/* ── Mechanism Education ───────────────────────────────────────────────── */}
      <section className="mb-10">
        <h2 className="text-heading-2 text-text-heading mb-5">
          {content.mechanismHeading}
        </h2>
        <div className="space-y-5">
          {content.mechanismParagraphs.map((para, i) => (
            <p key={i} className="text-body text-text-body">
              {para}
            </p>
          ))}
        </div>
      </section>

      {/* ── Self-Assessment Questions ─────────────────────────────────────────── */}
      <section className="mb-10">
        <p className="text-body text-text-body mb-6">
          {content.assessmentIntro}
        </p>

        <div className="space-y-6">

          {/* ── Movement Tests sub-heading */}
          <h3 className="text-heading-3 text-primary mt-4">Movement Tests</h3>

          {/* Q1 — M3 Neck Flexion (yes-no) */}
          <div className="bg-surface border border-border rounded-xl p-6 shadow-card">
            <h3 className="text-heading-3 text-text-heading mb-4">{q[0].heading}</h3>
            <div className="space-y-4 mb-5">
              {q[0].instructions.map((para, i) => (
                <p key={i} className="text-body text-text-body">{para}</p>
              ))}
            </div>
            <VideoSlot videoId={q[0].videoId} />
            <div className="bg-surface-raised rounded-[8px] p-4 mb-5">
              <p className="text-body-sm text-text-muted">{q[0].mechanism}</p>
            </div>
            <p className="text-body-sm text-text-muted mb-3">{q[0].recordLabel}</p>
            <div className="flex flex-wrap gap-2">
              {(['yes', 'no'] as const).map(opt => (
                <OptionBtn
                  key={opt}
                  label={opt.charAt(0).toUpperCase() + opt.slice(1)}
                  selected={q1M3 === opt}
                  onClick={() => setQ1M3(opt)}
                />
              ))}
            </div>
          </div>

          {/* Q2 — M4 Head Rotation (yes-no-asymmetric) */}
          <div className="bg-surface border border-border rounded-xl p-6 shadow-card">
            <h3 className="text-heading-3 text-text-heading mb-4">{q[1].heading}</h3>
            <div className="space-y-4 mb-5">
              {q[1].instructions.map((para, i) => (
                <p key={i} className="text-body text-text-body">{para}</p>
              ))}
            </div>
            <VideoSlot videoId={q[1].videoId} />
            <div className="bg-surface-raised rounded-[8px] p-4 mb-5">
              <p className="text-body-sm text-text-muted">{q[1].mechanism}</p>
            </div>
            <p className="text-body-sm text-text-muted mb-3">{q[1].recordLabel}</p>
            <div className="flex flex-wrap gap-2">
              {(['yes', 'no'] as const).map(opt => (
                <OptionBtn
                  key={opt}
                  label={opt.charAt(0).toUpperCase() + opt.slice(1)}
                  selected={q2M4Primary === opt}
                  onClick={() => {
                    setQ2M4Primary(opt)
                    if (opt !== 'yes') setQ2M4Asymmetric(null)
                  }}
                />
              ))}
            </div>
            {q2M4Primary === 'yes' && (
              <div className="mt-4">
                <p className="text-body-sm text-text-muted mb-2">Was the response stronger on one side than the other?</p>
                <div className="flex flex-wrap gap-2">
                  {(['yes', 'no'] as const).map(opt => (
                    <OptionBtn
                      key={opt}
                      label={opt.charAt(0).toUpperCase() + opt.slice(1)}
                      selected={q2M4Asymmetric === opt}
                      onClick={() => setQ2M4Asymmetric(opt)}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Q3 — M5 Chin Retraction (yes-no) */}
          <div className="bg-surface border border-border rounded-xl p-6 shadow-card">
            <h3 className="text-heading-3 text-text-heading mb-4">{q[2].heading}</h3>
            <div className="space-y-4 mb-5">
              {q[2].instructions.map((para, i) => (
                <p key={i} className="text-body text-text-body">{para}</p>
              ))}
            </div>
            <VideoSlot videoId={q[2].videoId} />
            <div className="bg-surface-raised rounded-[8px] p-4 mb-5">
              <p className="text-body-sm text-text-muted">{q[2].mechanism}</p>
            </div>
            <p className="text-body-sm text-text-muted mb-3">{q[2].recordLabel}</p>
            <div className="flex flex-wrap gap-2">
              {(['yes', 'no'] as const).map(opt => (
                <OptionBtn
                  key={opt}
                  label={opt.charAt(0).toUpperCase() + opt.slice(1)}
                  selected={q3M5 === opt}
                  onClick={() => setQ3M5(opt)}
                />
              ))}
            </div>
          </div>

          {/* ── Physical Assessment sub-heading */}
          <h3 className="text-heading-3 text-primary mt-4">Physical Assessment</h3>

          {/* Q4 — Suboccipital Palpation (yes-no-asymmetric-side) */}
          <div className="bg-surface border border-border rounded-xl p-6 shadow-card">
            <h3 className="text-heading-3 text-text-heading mb-4">{q[3].heading}</h3>
            <div className="space-y-4 mb-5">
              {q[3].instructions.map((para, i) => (
                <p key={i} className="text-body text-text-body">{para}</p>
              ))}
            </div>
            <VideoSlot videoId={q[3].videoId} />
            <div className="bg-surface-raised rounded-[8px] p-4 mb-5">
              <p className="text-body-sm text-text-muted">{q[3].mechanism}</p>
            </div>
            <p className="text-body-sm text-text-muted mb-3">{q[3].recordLabel}</p>
            <div className="flex flex-wrap gap-2">
              {(['yes', 'no'] as const).map(opt => (
                <OptionBtn
                  key={opt}
                  label={opt.charAt(0).toUpperCase() + opt.slice(1)}
                  selected={q4SuboccPrimary === opt}
                  onClick={() => {
                    setQ4SuboccPrimary(opt)
                    if (opt !== 'yes') {
                      setQ4SuboccAsym(null)
                      setQ4SuboccSide(null)
                    }
                  }}
                />
              ))}
            </div>
            {q4SuboccPrimary === 'yes' && (
              <div className="mt-4">
                <p className="text-body-sm text-text-muted mb-2">Was it noticeably asymmetric?</p>
                <div className="flex flex-wrap gap-2">
                  {(['yes', 'no'] as const).map(opt => (
                    <OptionBtn
                      key={opt}
                      label={opt.charAt(0).toUpperCase() + opt.slice(1)}
                      selected={q4SuboccAsym === opt}
                      onClick={() => {
                        setQ4SuboccAsym(opt)
                        if (opt !== 'yes') setQ4SuboccSide(null)
                      }}
                    />
                  ))}
                </div>
              </div>
            )}
            {q4SuboccPrimary === 'yes' && q4SuboccAsym === 'yes' && (
              <div className="mt-4">
                <p className="text-body-sm text-text-muted mb-2">Which side was more tender?</p>
                <div className="flex flex-wrap gap-2">
                  {(['left', 'right'] as const).map(side => (
                    <OptionBtn
                      key={side}
                      label={side.charAt(0).toUpperCase() + side.slice(1)}
                      selected={q4SuboccSide === side}
                      onClick={() => setQ4SuboccSide(side)}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Q5 — SCM Palpation (yes-no-direction) */}
          <div className="bg-surface border border-border rounded-xl p-6 shadow-card">
            <h3 className="text-heading-3 text-text-heading mb-4">{q[4].heading}</h3>
            <div className="space-y-4 mb-5">
              {q[4].instructions.map((para, i) => (
                <p key={i} className="text-body text-text-body">{para}</p>
              ))}
            </div>
            <VideoSlot videoId={q[4].videoId} />
            <div className="bg-surface-raised rounded-[8px] p-4 mb-5">
              <p className="text-body-sm text-text-muted">{q[4].mechanism}</p>
            </div>
            <p className="text-body-sm text-text-muted mb-3">{q[4].recordLabel}</p>
            <div className="flex flex-wrap gap-2">
              {(['yes', 'no'] as const).map(opt => (
                <OptionBtn
                  key={opt}
                  label={opt.charAt(0).toUpperCase() + opt.slice(1)}
                  selected={q5ScmPrimary === opt}
                  onClick={() => {
                    setQ5ScmPrimary(opt)
                    if (opt !== 'yes') setQ5ScmSide(null)
                  }}
                />
              ))}
            </div>
            {q5ScmPrimary === 'yes' && (
              <div className="mt-4">
                <p className="text-body-sm text-text-muted mb-2">Dominant side:</p>
                <div className="flex flex-wrap gap-2">
                  {(['left', 'right'] as const).map(side => (
                    <OptionBtn
                      key={side}
                      label={side.charAt(0).toUpperCase() + side.slice(1)}
                      selected={q5ScmSide === side}
                      onClick={() => setQ5ScmSide(side)}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Q6 — Upper Trapezius Palpation (yes-no-direction) */}
          <div className="bg-surface border border-border rounded-xl p-6 shadow-card">
            <h3 className="text-heading-3 text-text-heading mb-4">{q[5].heading}</h3>
            <div className="space-y-4 mb-5">
              {q[5].instructions.map((para, i) => (
                <p key={i} className="text-body text-text-body">{para}</p>
              ))}
            </div>
            <VideoSlot videoId={q[5].videoId} />
            <div className="bg-surface-raised rounded-[8px] p-4 mb-5">
              <p className="text-body-sm text-text-muted">{q[5].mechanism}</p>
            </div>
            <p className="text-body-sm text-text-muted mb-3">{q[5].recordLabel}</p>
            <div className="flex flex-wrap gap-2">
              {(['yes', 'no'] as const).map(opt => (
                <OptionBtn
                  key={opt}
                  label={opt.charAt(0).toUpperCase() + opt.slice(1)}
                  selected={q6TrapPrimary === opt}
                  onClick={() => {
                    setQ6TrapPrimary(opt)
                    if (opt !== 'yes') setQ6TrapSide(null)
                  }}
                />
              ))}
            </div>
            {q6TrapPrimary === 'yes' && (
              <div className="mt-4">
                <p className="text-body-sm text-text-muted mb-2">Dominant side:</p>
                <div className="flex flex-wrap gap-2">
                  {(['left', 'right'] as const).map(side => (
                    <OptionBtn
                      key={side}
                      label={side.charAt(0).toUpperCase() + side.slice(1)}
                      selected={q6TrapSide === side}
                      onClick={() => setQ6TrapSide(side)}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Q7 — Rotation Range Assessment (yes-no-direction) */}
          <div className="bg-surface border border-border rounded-xl p-6 shadow-card">
            <h3 className="text-heading-3 text-text-heading mb-4">{q[6].heading}</h3>
            <div className="space-y-4 mb-5">
              {q[6].instructions.map((para, i) => (
                <p key={i} className="text-body text-text-body">{para}</p>
              ))}
            </div>
            <VideoSlot videoId={q[6].videoId} />
            <div className="bg-surface-raised rounded-[8px] p-4 mb-5">
              <p className="text-body-sm text-text-muted">{q[6].mechanism}</p>
            </div>
            <p className="text-body-sm text-text-muted mb-3">{q[6].recordLabel}</p>
            <div className="flex flex-wrap gap-2">
              {(['yes', 'no'] as const).map(opt => (
                <OptionBtn
                  key={opt}
                  label={opt.charAt(0).toUpperCase() + opt.slice(1)}
                  selected={q7RotPrimary === opt}
                  onClick={() => {
                    setQ7RotPrimary(opt)
                    if (opt !== 'yes') setQ7RotSide(null)
                  }}
                />
              ))}
            </div>
            {q7RotPrimary === 'yes' && (
              <div className="mt-4">
                <p className="text-body-sm text-text-muted mb-2">More restricted side:</p>
                <div className="flex flex-wrap gap-2">
                  {(['left', 'right'] as const).map(side => (
                    <OptionBtn
                      key={side}
                      label={side.charAt(0).toUpperCase() + side.slice(1)}
                      selected={q7RotSide === side}
                      onClick={() => setQ7RotSide(side)}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Q8 — Forward Head Posture Assessment (yes-no) */}
          <div className="bg-surface border border-border rounded-xl p-6 shadow-card">
            <h3 className="text-heading-3 text-text-heading mb-4">{q[7].heading}</h3>
            <div className="space-y-4 mb-5">
              {q[7].instructions.map((para, i) => (
                <p key={i} className="text-body text-text-body">{para}</p>
              ))}
            </div>
            <VideoSlot videoId={q[7].videoId} />
            <div className="bg-surface-raised rounded-[8px] p-4 mb-5">
              <p className="text-body-sm text-text-muted">{q[7].mechanism}</p>
            </div>
            <p className="text-body-sm text-text-muted mb-3">{q[7].recordLabel}</p>
            <div className="flex flex-wrap gap-2">
              {(['yes', 'no'] as const).map(opt => (
                <OptionBtn
                  key={opt}
                  label={opt.charAt(0).toUpperCase() + opt.slice(1)}
                  selected={q8Fhp === opt}
                  onClick={() => setQ8Fhp(opt)}
                />
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* ── History Questions ─────────────────────────────────────────────────── */}
      <section className="mb-10">
        <h2 className="text-heading-2 text-text-heading mb-3">
          {content.historyHeading}
        </h2>
        <p className="text-body text-text-body mb-6">
          {content.historyIntro}
        </p>
        <div className="bg-surface border border-border rounded-xl shadow-card divide-y divide-border">
          {content.historyQuestions.map((hq, i) => (
            <div key={i} className="p-6">
              <p className="text-body text-text-body mb-4">{hq.text}</p>
              <div className="flex flex-wrap gap-2">
                {(['yes', 'sometimes', 'no'] as const).map(opt => (
                  <OptionBtn
                    key={opt}
                    label={opt === 'sometimes' ? 'Sometimes' : opt.charAt(0).toUpperCase() + opt.slice(1)}
                    selected={history[hq.dbField] === opt}
                    onClick={() => setHistory(h => ({ ...h, [hq.dbField]: opt }))}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Context Questions ─────────────────────────────────────────────────── */}
      <section className="mb-10">
        <h2 className="text-heading-2 text-text-heading mb-3">
          {content.contextHeading}
        </h2>
        {content.contextIntro && (
          <p className="text-body text-text-body mb-6">
            {content.contextIntro}
          </p>
        )}
        <div className="bg-surface border border-border rounded-xl shadow-card divide-y divide-border">
          {content.contextQuestions.map((cq, i) => (
            <div key={i} className="p-6">
              <p className="text-body text-text-body mb-4">{cq.text}</p>
              <div className="flex flex-wrap gap-2">
                {(['yes', 'no'] as const).map(opt => (
                  <OptionBtn
                    key={opt}
                    label={opt.charAt(0).toUpperCase() + opt.slice(1)}
                    selected={ctx[cq.dbField] === opt}
                    onClick={() => setCtx(c => ({ ...c, [cq.dbField]: opt }))}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Inline error — body-sm (14px / 400 / 1.5) */}
      {error && (
        <div className="mb-6 p-4 bg-error-tint border border-error rounded-[8px]">
          <p className="text-body-sm text-error">{error}</p>
        </div>
      )}

      {/* Submit button — Doc 11 G4: primary, full width mobile / auto desktop.
          btn-primary type (15px / 500) from --text-btn-primary token. */}
      <div>
        <button
          onClick={handleSubmit}
          disabled={!isComplete || loading}
          className={`w-full md:w-auto md:px-8 h-11 rounded-[8px] text-btn-primary transition-colors ${
            !isComplete || loading
              ? 'bg-primary-disabled text-white cursor-not-allowed'
              : 'bg-primary text-white hover:bg-primary-hover'
          }`}
        >
          {loading ? 'Saving\u2026' : content.submitLabel}
        </button>
        {/* "Section N of 7" — muted type (13px / 400 / 1.4) */}
        <p className="text-muted text-text-muted text-center mt-3">Section 3 of 7</p>
      </div>

    </div>
  )
}
