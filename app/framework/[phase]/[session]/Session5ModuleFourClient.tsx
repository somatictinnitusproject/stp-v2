'use client'

// B.5 — Module 4: Nervous System & Stress client component.
// G4 Framework Content Form View layout (Doc 11 G4) per M8/M9a pattern.
// Module produces NO score — four ns_* flag columns persisted via /api/framework/phase-1/module-4.
// Q5 (tension_triple) and Q6 (yes_sometimes_no) are UI-only — captured for member self-awareness
// and NOT sent in submit payload. Doc 13 §4.4 step 5 reads only the four primary NS columns
// (ns_stress_tinnitus_correlation, ns_hypervigilance, ns_sleep_disruption, ns_anxiety_loop)
// for the high-NS modifier (3+ flags = significant NS involvement).
//
// ScrollProgressBar mounted per ERRATA E11.
// No VideoSlot — M4 has no physical assessment video questions.

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { B5Module4Ns } from '@/content/framework/phase-1/types'
import ScrollProgressBar from '@/components/ui/ScrollProgressBar'

type TriAnswer = 'yes' | 'sometimes' | 'no' | null
type BinaryAnswer = 'yes' | 'no' | null

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

export default function Session5ModuleFourClient({ content }: { content: B5Module4Ns }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Q1 — Stress-Tinnitus Correlation (yes_sometimes_no, persisted)
  const [q1Stress, setQ1Stress] = useState<TriAnswer>(null)

  // Q2 — Hypervigilance Pattern (yes_sometimes_no, persisted)
  const [q2Hyper, setQ2Hyper] = useState<TriAnswer>(null)

  // Q3 — Sleep Disruption (sleep_triple, persisted via composite)
  const [q3, setQ3] = useState<Record<string, TriAnswer>>({
    sleep_falling_asleep: null,
    sleep_night_waking: null,
    sleep_morning_louder: null,
  })

  // Q4 — Anxiety-Tinnitus Loop (yes_sometimes_no, persisted)
  const [q4Anxiety, setQ4Anxiety] = useState<TriAnswer>(null)

  // Q5 — Unconscious Tension Patterns (tension_triple, UI-only — NOT persisted)
  // Typed as Record<string, TriAnswer | BinaryAnswer> to accommodate the heterogeneous
  // answerType across sub-questions (tension_visible is yes/no only per Doc 8).
  // Option (b) from spec — looser than the typed object shape but avoids tsc errors
  // with the computed setter into a heterogeneous state shape.
  const [q5Tension, setQ5Tension] = useState<Record<string, TriAnswer | BinaryAnswer>>({
    tension_concentration: null,
    tension_effort: null,
    tension_visible: null,
  })

  // Q6 — Tinnitus Variability with Relaxation (yes_sometimes_no, UI-only — NOT persisted)
  const [q6Relax, setQ6Relax] = useState<TriAnswer>(null)

  const isComplete =
    q1Stress !== null &&
    q2Hyper !== null &&
    Object.values(q3).every(v => v !== null) &&
    q4Anxiety !== null &&
    q5Tension['tension_concentration'] !== null &&
    q5Tension['tension_effort'] !== null &&
    q5Tension['tension_visible'] !== null &&
    q6Relax !== null

  async function handleSubmit() {
    if (loading) return
    setLoading(true)
    setError(null)

    // Q5 and Q6 are UI-only — not included in submit payload.
    // Route maps semantic keys to ns_* boolean columns server-side.
    const payload = {
      q1_stress: q1Stress,
      q2_hypervigilance: q2Hyper,
      q3_falling_asleep: q3.sleep_falling_asleep,
      q3_night_waking: q3.sleep_night_waking,
      q3_morning_louder: q3.sleep_morning_louder,
      q4_anxiety: q4Anxiety,
    }

    try {
      const res = await fetch('/api/framework/phase-1/module-4', {
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
      router.push('/framework/phase-1/session-6')
    } catch {
      setError('Network error. Please check your connection and try again.')
      setLoading(false)
    }
  }

  const blocks = content.blocks

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

      {/* ── Framing ───────────────────────────────────────────────────────────── */}
      <section className="mb-10">
        <div className="space-y-5">
          {content.framing.map((para, i) => (
            <p key={i} className="text-body text-text-body">{para}</p>
          ))}
        </div>
      </section>

      {/* ── Self-Assessment ───────────────────────────────────────────────────── */}
      <section className="mb-10">
        <div className="space-y-6">

          {/* Q1 — Stress-Tinnitus Correlation (yes_sometimes_no) */}
          <div className="bg-surface border border-border rounded-xl p-6 shadow-card">
            <h3 className="text-heading-3 text-text-heading mb-4">{blocks[0].title}</h3>
            {blocks[0].prose.length > 0 && (
              <div className="space-y-4 mb-5">
                {blocks[0].prose.map((p, i) => (
                  <p key={i} className="text-body text-text-body">{p}</p>
                ))}
              </div>
            )}
            <div className="bg-surface-raised rounded-[8px] p-4 mb-5">
              <p className="text-body-sm text-text-muted">{blocks[0].mechanism}</p>
            </div>
            <p className="text-body-sm text-text-muted mb-3">{blocks[0].recordLabel}</p>
            <div className="flex flex-wrap gap-2">
              {(['yes', 'sometimes', 'no'] as const).map(opt => (
                <OptionBtn
                  key={opt}
                  label={opt === 'sometimes' ? 'Sometimes' : opt.charAt(0).toUpperCase() + opt.slice(1)}
                  selected={q1Stress === opt}
                  onClick={() => setQ1Stress(opt)}
                />
              ))}
            </div>
          </div>

          {/* Q2 — Hypervigilance Pattern (yes_sometimes_no) */}
          <div className="bg-surface border border-border rounded-xl p-6 shadow-card">
            <h3 className="text-heading-3 text-text-heading mb-4">{blocks[1].title}</h3>
            {blocks[1].prose.length > 0 && (
              <div className="space-y-4 mb-5">
                {blocks[1].prose.map((p, i) => (
                  <p key={i} className="text-body text-text-body">{p}</p>
                ))}
              </div>
            )}
            <div className="bg-surface-raised rounded-[8px] p-4 mb-5">
              <p className="text-body-sm text-text-muted">{blocks[1].mechanism}</p>
            </div>
            <p className="text-body-sm text-text-muted mb-3">{blocks[1].recordLabel}</p>
            <div className="flex flex-wrap gap-2">
              {(['yes', 'sometimes', 'no'] as const).map(opt => (
                <OptionBtn
                  key={opt}
                  label={opt === 'sometimes' ? 'Sometimes' : opt.charAt(0).toUpperCase() + opt.slice(1)}
                  selected={q2Hyper === opt}
                  onClick={() => setQ2Hyper(opt)}
                />
              ))}
            </div>
          </div>

          {/* Q3 — Sleep Disruption (sleep_triple) */}
          <div className="bg-surface border border-border rounded-xl p-6 shadow-card">
            <h3 className="text-heading-3 text-text-heading mb-4">{blocks[2].title}</h3>
            {/* No prose for Q3 — Doc 8 goes directly to sub-questions */}
            <div className="bg-surface-raised rounded-[8px] p-4 mb-5">
              <p className="text-body-sm text-text-muted">{blocks[2].mechanism}</p>
            </div>
            <p className="text-body-sm text-text-muted mb-4">{blocks[2].recordLabel}</p>
            <div>
              {blocks[2].subQuestions!.map((subq, i) => (
                <div key={subq.id} className={`py-4 ${i === 0 ? '' : 'border-t border-border'}`}>
                  <p className="text-body text-text-body mb-3">{subq.label}</p>
                  <div className="flex flex-wrap gap-2">
                    {(['yes', 'sometimes', 'no'] as const).map(opt => (
                      <OptionBtn
                        key={opt}
                        label={opt === 'sometimes' ? 'Sometimes' : opt.charAt(0).toUpperCase() + opt.slice(1)}
                        selected={q3[subq.id] === opt}
                        onClick={() => setQ3(s => ({ ...s, [subq.id]: opt }))}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Q4 — Anxiety-Tinnitus Loop (yes_sometimes_no) */}
          <div className="bg-surface border border-border rounded-xl p-6 shadow-card">
            <h3 className="text-heading-3 text-text-heading mb-4">{blocks[3].title}</h3>
            {blocks[3].prose.length > 0 && (
              <div className="space-y-4 mb-5">
                {blocks[3].prose.map((p, i) => (
                  <p key={i} className="text-body text-text-body">{p}</p>
                ))}
              </div>
            )}
            <div className="bg-surface-raised rounded-[8px] p-4 mb-5">
              <p className="text-body-sm text-text-muted">{blocks[3].mechanism}</p>
            </div>
            <p className="text-body-sm text-text-muted mb-3">{blocks[3].recordLabel}</p>
            <div className="flex flex-wrap gap-2">
              {(['yes', 'sometimes', 'no'] as const).map(opt => (
                <OptionBtn
                  key={opt}
                  label={opt === 'sometimes' ? 'Sometimes' : opt.charAt(0).toUpperCase() + opt.slice(1)}
                  selected={q4Anxiety === opt}
                  onClick={() => setQ4Anxiety(opt)}
                />
              ))}
            </div>
          </div>

          {/* Q5 — Unconscious Tension Patterns (tension_triple, UI-only) */}
          <div className="bg-surface border border-border rounded-xl p-6 shadow-card">
            <h3 className="text-heading-3 text-text-heading mb-4">{blocks[4].title}</h3>
            {/* No prose for Q5 — Doc 8 goes directly to sub-questions */}
            <div className="bg-surface-raised rounded-[8px] p-4 mb-5">
              <p className="text-body-sm text-text-muted">{blocks[4].mechanism}</p>
            </div>
            <p className="text-body-sm text-text-muted mb-4">{blocks[4].recordLabel}</p>
            <div>
              {blocks[4].subQuestions!.map((subq, i) => (
                <div key={subq.id} className={`py-4 ${i === 0 ? '' : 'border-t border-border'}`}>
                  <p className="text-body text-text-body mb-3">{subq.label}</p>
                  <div className="flex flex-wrap gap-2">
                    {subq.answerType === 'yes_sometimes_no' ? (
                      (['yes', 'sometimes', 'no'] as const).map(opt => (
                        <OptionBtn
                          key={opt}
                          label={opt === 'sometimes' ? 'Sometimes' : opt.charAt(0).toUpperCase() + opt.slice(1)}
                          selected={q5Tension[subq.id] === opt}
                          onClick={() => setQ5Tension(s => ({ ...s, [subq.id]: opt }))}
                        />
                      ))
                    ) : (
                      (['yes', 'no'] as const).map(opt => (
                        <OptionBtn
                          key={opt}
                          label={opt.charAt(0).toUpperCase() + opt.slice(1)}
                          selected={q5Tension[subq.id] === opt}
                          onClick={() => setQ5Tension(s => ({ ...s, [subq.id]: opt }))}
                        />
                      ))
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Q6 — Tinnitus Variability with Relaxation (yes_sometimes_no, UI-only) */}
          <div className="bg-surface border border-border rounded-xl p-6 shadow-card">
            <h3 className="text-heading-3 text-text-heading mb-4">{blocks[5].title}</h3>
            {blocks[5].prose.length > 0 && (
              <div className="space-y-4 mb-5">
                {blocks[5].prose.map((p, i) => (
                  <p key={i} className="text-body text-text-body">{p}</p>
                ))}
              </div>
            )}
            <div className="bg-surface-raised rounded-[8px] p-4 mb-5">
              <p className="text-body-sm text-text-muted">{blocks[5].mechanism}</p>
            </div>
            <p className="text-body-sm text-text-muted mb-3">{blocks[5].recordLabel}</p>
            <div className="flex flex-wrap gap-2">
              {(['yes', 'sometimes', 'no'] as const).map(opt => (
                <OptionBtn
                  key={opt}
                  label={opt === 'sometimes' ? 'Sometimes' : opt.charAt(0).toUpperCase() + opt.slice(1)}
                  selected={q6Relax === opt}
                  onClick={() => setQ6Relax(opt)}
                />
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* Inline error — body-sm (14px / 400 / 1.5) */}
      {error && (
        <div className="mb-6 p-4 bg-error-tint border border-error rounded-[8px]">
          <p className="text-body-sm text-error">{error}</p>
        </div>
      )}

      {/* Submit button — Doc 11 G4: primary, full width mobile / auto desktop. */}
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
        <p className="text-muted text-text-muted text-center mt-3">Section 5 of 7</p>
      </div>

    </div>
  )
}
