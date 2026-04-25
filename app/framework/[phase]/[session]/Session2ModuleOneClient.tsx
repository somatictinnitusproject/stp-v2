'use client'

// B.2 — Module 1: Jaw Driver client component.
// G4 Framework Content Form View layout (Doc 11 G4):
//   max-width reading (680px) · space-5 top / space-6 bottom · section label →
//   h1 → mechanism education section (heading-2) → assessment question cards →
//   history section → context section → submit button.
//
// Token reference — Doc 11 §2 + §2.4:
//   text-phase-label  12px / 600 / uppercase / tracking-[0.06em]
//   text-heading-2    24px / 600 / 1.3
//   text-heading-3    18px / 600 / 1.4
//   text-body         16px / 400 / 1.6
//   text-body-sm      14px / 400 / 1.5
//   text-muted        13px / 400 / 1.4
//   text-btn-primary  15px / 500 / 1
//   heading-1 mobile: 28px — Doc 11 §2.3 specifies text-[28px] md:text-[36px] font-bold
//
// ERRATA E7 — Yes/Sometimes/No → BOOLEAN collapse happens in the API route, not here.
// D3 — movement tests (Q1/Q2) first, then physical assessment (Q3-Q7).
// D4 — VideoSlot rendered in every question card.
// D5 — ScrollProgressBar fixed at top.

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { B2Module1Tmj } from '@/content/framework/phase-1/b2-module-1-tmj'
import VideoSlot from '@/components/ui/VideoSlot'
import ScrollProgressBar from '@/components/ui/ScrollProgressBar'

type PrimaryAnswer = 'yes' | 'no' | null
type PrimaryWithUnsure = 'yes' | 'no' | 'unsure' | null
type DirectionAnswer = 'left' | 'right' | null
type SideAnswer = 'left' | 'right' | 'bilateral' | null
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

export default function Session2ModuleOneClient({ content }: { content: B2Module1Tmj }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Q1 — M1 Jaw Opening: yes/no
  const [q1M1, setQ1M1] = useState<PrimaryAnswer>(null)

  // Q2 — M2 Jaw Protrusion: yes/no
  const [q2M2, setQ2M2] = useState<PrimaryAnswer>(null)

  // Q3 — Jaw Drift: primary yes/no/unsure + conditional direction left/right
  const [q3Primary, setQ3Primary] = useState<PrimaryWithUnsure>(null)
  const [q3Direction, setQ3Direction] = useState<DirectionAnswer>(null)

  // Q4 — Masseter Asymmetry: primary yes/no + conditional dominant side left/right
  const [q4Primary, setQ4Primary] = useState<PrimaryAnswer>(null)
  const [q4Side, setQ4Side] = useState<DirectionAnswer>(null)

  // Q5 — Lateral Pterygoid: primary yes/no + conditional side left/right/bilateral
  const [q5Primary, setQ5Primary] = useState<PrimaryAnswer>(null)
  const [q5Side, setQ5Side] = useState<SideAnswer>(null)

  // Q6 — Joint Sounds: yes/no boolean
  const [q6, setQ6] = useState<PrimaryAnswer>(null)

  // Q7 — Maximum Opening Range: yes/no boolean
  const [q7, setQ7] = useState<PrimaryAnswer>(null)

  // History questions — Yes/Sometimes/No (4 questions)
  const [history, setHistory] = useState<Record<string, TriAnswer>>({
    tmj_morning_soreness: null,
    tmj_daytime_clenching: null,
    tmj_pain_eating: null,
    tmj_worse_after_chewing: null,
  })

  // Context questions — Yes/No (4 questions)
  const [ctx, setCtx] = useState<Record<string, PrimaryAnswer>>({
    ctx_orthodontic_history: null,
    ctx_dental_extractions: null,
    ctx_jaw_surgery: null,
    ctx_jaw_injury: null,
  })

  // All primary answers must be set. Conditional side/direction required when primary === 'yes'.
  const isComplete =
    q1M1 !== null &&
    q2M2 !== null &&
    q3Primary !== null &&
    (q3Primary !== 'yes' || q3Direction !== null) &&
    q4Primary !== null &&
    (q4Primary !== 'yes' || q4Side !== null) &&
    q5Primary !== null &&
    (q5Primary !== 'yes' || q5Side !== null) &&
    q6 !== null &&
    q7 !== null &&
    Object.values(history).every(v => v !== null) &&
    Object.values(ctx).every(v => v !== null)

  async function handleSubmit() {
    if (loading) return
    setLoading(true)
    setError(null)

    const payload = {
      tmj_m1_jaw_opening: q1M1,
      tmj_m2_jaw_protrusion: q2M2,
      tmj_jaw_drift: q3Primary,
      tmj_jaw_drift_direction: q3Primary === 'yes' ? q3Direction : null,
      tmj_masseter_asymmetry: q4Primary,
      tmj_masseter_dominant_side: q4Primary === 'yes' ? q4Side : null,
      tmj_pterygoid_tenderness: q5Primary,
      tmj_pterygoid_tender_side: q5Primary === 'yes' ? q5Side : null,
      tmj_joint_sounds: q6,
      tmj_opening_restriction: q7,
      ...history,
      ...ctx,
    }

    try {
      const res = await fetch('/api/framework/phase-1/module-1', {
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
      router.push('/framework/phase-1/session-3')
    } catch {
      setError('Network error. Please check your connection and try again.')
      setLoading(false)
    }
  }

  // content.questions index map: 0=Q1 M1, 1=Q2 M2, 2=Q3 drift, 3=Q4 masseter, 4=Q5 pterygoid, 5=Q6 sounds, 6=Q7 range
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

          {/* ── Movement Tests sub-heading — D3 */}
          <h3 className="text-heading-3 text-primary mt-4">Movement Tests</h3>

          {/* Q1 — M1 Jaw Opening */}
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
                  selected={q1M1 === opt}
                  onClick={() => setQ1M1(opt)}
                />
              ))}
            </div>
          </div>

          {/* Q2 — M2 Jaw Protrusion */}
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
                  selected={q2M2 === opt}
                  onClick={() => setQ2M2(opt)}
                />
              ))}
            </div>
          </div>

          {/* ── Physical Assessment sub-heading — D3 */}
          <h3 className="text-heading-3 text-primary mt-4">Physical Assessment</h3>

          {/* Q3 — Jaw Drift on Opening */}
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
              {(['yes', 'no', 'unsure'] as const).map(opt => (
                <OptionBtn
                  key={opt}
                  label={opt.charAt(0).toUpperCase() + opt.slice(1)}
                  selected={q3Primary === opt}
                  onClick={() => {
                    setQ3Primary(opt)
                    if (opt !== 'yes') setQ3Direction(null)
                  }}
                />
              ))}
            </div>
            {q3Primary === 'yes' && (
              <div className="mt-4">
                <p className="text-body-sm text-text-muted mb-2">Direction:</p>
                <div className="flex flex-wrap gap-2">
                  {(['left', 'right'] as const).map(dir => (
                    <OptionBtn
                      key={dir}
                      label={dir.charAt(0).toUpperCase() + dir.slice(1)}
                      selected={q3Direction === dir}
                      onClick={() => setQ3Direction(dir)}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Q4 — Masseter Asymmetry */}
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
                  selected={q4Primary === opt}
                  onClick={() => {
                    setQ4Primary(opt)
                    if (opt !== 'yes') setQ4Side(null)
                  }}
                />
              ))}
            </div>
            {q4Primary === 'yes' && (
              <div className="mt-4">
                <p className="text-body-sm text-text-muted mb-2">Dominant side:</p>
                <div className="flex flex-wrap gap-2">
                  {(['left', 'right'] as const).map(side => (
                    <OptionBtn
                      key={side}
                      label={side.charAt(0).toUpperCase() + side.slice(1)}
                      selected={q4Side === side}
                      onClick={() => setQ4Side(side)}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Q5 — Lateral Pterygoid Palpation */}
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
                  selected={q5Primary === opt}
                  onClick={() => {
                    setQ5Primary(opt)
                    if (opt !== 'yes') setQ5Side(null)
                  }}
                />
              ))}
            </div>
            {q5Primary === 'yes' && (
              <div className="mt-4">
                <p className="text-body-sm text-text-muted mb-2">Side:</p>
                <div className="flex flex-wrap gap-2">
                  {(
                    [
                      { value: 'left', label: 'Left' },
                      { value: 'right', label: 'Right' },
                      { value: 'bilateral', label: 'Both sides' },
                    ] as { value: SideAnswer; label: string }[]
                  ).map(({ value, label }) => (
                    <OptionBtn
                      key={value!}
                      label={label}
                      selected={q5Side === value}
                      onClick={() => setQ5Side(value)}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Q6 — Joint Sounds Assessment */}
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
                  selected={q6 === opt}
                  onClick={() => setQ6(opt)}
                />
              ))}
            </div>
          </div>

          {/* Q7 — Maximum Opening Range */}
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
                  selected={q7 === opt}
                  onClick={() => setQ7(opt)}
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
        <p className="text-body text-text-body mb-6">
          {content.contextIntro}
        </p>
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
        <p className="text-muted text-text-muted text-center mt-3">Section 2 of 7</p>
      </div>

    </div>
  )
}
