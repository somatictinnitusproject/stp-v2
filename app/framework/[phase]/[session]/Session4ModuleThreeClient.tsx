'use client'

// B.4 — Module 3: Postural & Muscular Maintaining Factors client component.
// G4 Framework Content Form View layout (Doc 11 G4) per M8 pattern.
// Module produces NO score — five flag columns persisted via /api/framework/phase-1/module-3.
// Block 3 inputs (Daily Posture Patterns) are UI-only — captured for member self-awareness
// and NOT sent in submit payload. Doc 13 §4.3 maintaining findings reads only the five
// derived columns: post_shoulder_asymmetry, post_elevated_side, post_dominant_chewing_side,
// post_sustained_desk_load, post_asymmetric_exercise.
//
// ScrollProgressBar mounted per ERRATA E11.
// No VideoSlot — M3 has no physical assessment video questions.

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { B4Module3Postural } from '@/content/framework/phase-1/types'
import ScrollProgressBar from '@/components/ui/ScrollProgressBar'

type PrimaryAnswer = 'yes' | 'no' | null
type DirectionAnswer = 'left' | 'right' | null
type ChewingAnswer = 'left' | 'right' | 'no_preference' | null
type FourBandAnswer = 'Less than 2' | '2\u20134 hours' | '4\u20136 hours' | 'More than 6 hours' | null
type WorkPatternAnswer = 'yes' | 'no' | 'sometimes' | null

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

export default function Session4ModuleThreeClient({ content }: { content: B4Module3Postural }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Block 1 — Shoulder Height at Rest
  const [b1Asym, setB1Asym] = useState<PrimaryAnswer>(null)
  const [b1Side, setB1Side] = useState<DirectionAnswer>(null)

  // Block 2 — Dominant Chewing Side
  const [b2Chew, setB2Chew] = useState<ChewingAnswer>(null)

  // Block 3 — Daily Posture Patterns (UI-only — not included in submit payload)
  const [b3, setB3] = useState<Record<string, PrimaryAnswer>>({
    ui_desk_screen_hours: null,
    ui_screen_below_eye: null,
    ui_laptop_no_keyboard: null,
    ui_phone_downward: null,
    ui_stomach_sleep: null,
    ui_side_sleep_arm: null,
    ui_one_shoulder_bag: null,
    ui_chin_hand_rest: null,
    ui_jaw_tension_effort: null,
    ui_movement_breaks: null,
  })

  // Block 4 — Occupational and Activity Load
  const [b4Sitting, setB4Sitting] = useState<FourBandAnswer>(null)
  const [b4Work, setB4Work] = useState<WorkPatternAnswer>(null)
  const [b4Sport, setB4Sport] = useState<PrimaryAnswer>(null)

  const isComplete =
    b1Asym !== null &&
    (b1Asym !== 'yes' || b1Side !== null) &&
    b2Chew !== null &&
    Object.values(b3).every(v => v !== null) &&
    b4Sitting !== null &&
    b4Work !== null &&
    b4Sport !== null

  async function handleSubmit() {
    if (loading) return
    setLoading(true)
    setError(null)

    const payload = {
      post_shoulder_asymmetry: b1Asym,
      post_elevated_side: b1Asym === 'yes' ? b1Side : null,
      post_dominant_chewing_side: b2Chew,
      ui_sustained_sitting: b4Sitting,
      ui_one_sided_work: b4Work,
      ui_one_sided_sport: b4Sport,
    }

    try {
      const res = await fetch('/api/framework/phase-1/module-3', {
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
      router.push('/framework/phase-1/session-5')
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

          {/* Block 1 — Shoulder Height at Rest */}
          <div className="bg-surface border border-border rounded-xl p-6 shadow-card">
            <h3 className="text-heading-3 text-text-heading mb-4">{blocks[0].title}</h3>
            {blocks[0].prose.length > 0 && (
              <div className="space-y-4 mb-5">
                {blocks[0].prose.map((p, i) => (
                  <p key={i} className="text-body text-text-body">{p}</p>
                ))}
              </div>
            )}
            {blocks[0].mechanism && (
              <div className="bg-surface-raised rounded-[8px] p-4 mb-5">
                <p className="text-body-sm text-text-muted">{blocks[0].mechanism}</p>
              </div>
            )}
            <p className="text-body-sm text-text-muted mb-3">{blocks[0].recordLabel}</p>
            <div className="flex flex-wrap gap-2">
              {(['yes', 'no'] as const).map(opt => (
                <OptionBtn
                  key={opt}
                  label={opt.charAt(0).toUpperCase() + opt.slice(1)}
                  selected={b1Asym === opt}
                  onClick={() => {
                    setB1Asym(opt)
                    if (opt !== 'yes') setB1Side(null)
                  }}
                />
              ))}
            </div>
            {b1Asym === 'yes' && (
              <div className="mt-4">
                <p className="text-body-sm text-text-muted mb-2">Elevated side:</p>
                <div className="flex flex-wrap gap-2">
                  {(['left', 'right'] as const).map(side => (
                    <OptionBtn
                      key={side}
                      label={side.charAt(0).toUpperCase() + side.slice(1)}
                      selected={b1Side === side}
                      onClick={() => setB1Side(side)}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Block 2 — Dominant Chewing Side */}
          <div className="bg-surface border border-border rounded-xl p-6 shadow-card">
            <h3 className="text-heading-3 text-text-heading mb-4">{blocks[1].title}</h3>
            {blocks[1].prose.length > 0 && (
              <div className="space-y-4 mb-5">
                {blocks[1].prose.map((p, i) => (
                  <p key={i} className="text-body text-text-body">{p}</p>
                ))}
              </div>
            )}
            {blocks[1].mechanism && (
              <div className="bg-surface-raised rounded-[8px] p-4 mb-5">
                <p className="text-body-sm text-text-muted">{blocks[1].mechanism}</p>
              </div>
            )}
            <p className="text-body-sm text-text-muted mb-3">{blocks[1].recordLabel}</p>
            <div className="flex flex-wrap gap-2">
              <OptionBtn
                label="Left"
                selected={b2Chew === 'left'}
                onClick={() => setB2Chew('left')}
              />
              <OptionBtn
                label="Right"
                selected={b2Chew === 'right'}
                onClick={() => setB2Chew('right')}
              />
              <OptionBtn
                label="No clear preference"
                selected={b2Chew === 'no_preference'}
                onClick={() => setB2Chew('no_preference')}
              />
            </div>
          </div>

          {/* Block 3 — Daily Posture Patterns */}
          <div className="bg-surface border border-border rounded-xl p-6 shadow-card">
            <h3 className="text-heading-3 text-text-heading mb-4">{blocks[2].title}</h3>
            {blocks[2].prose.length > 0 && (
              <div className="space-y-4 mb-5">
                {blocks[2].prose.map((p, i) => (
                  <p key={i} className="text-body text-text-body">{p}</p>
                ))}
              </div>
            )}
            {blocks[2].mechanism && (
              <div className="bg-surface-raised rounded-[8px] p-4 mb-5">
                <p className="text-body-sm text-text-muted">{blocks[2].mechanism}</p>
              </div>
            )}
            <p className="text-body-sm text-text-muted mb-3">{blocks[2].recordLabel}</p>
            <div>
              {blocks[2].inputs.map((input, i) => (
                <div key={input.id}>
                  {input.subheading && (
                    <h4 className={`text-heading-4 text-text-heading mb-3 ${i === 0 ? '' : 'mt-6'}`}>
                      {input.subheading}
                    </h4>
                  )}
                  <div className={`py-4 ${input.subheading ? '' : 'border-t border-border'}`}>
                    <p className="text-body text-text-body mb-2">{input.label}</p>
                    {input.hint && (
                      <p className="text-body-sm text-text-muted mb-3 italic">{input.hint}</p>
                    )}
                    <div className="flex flex-wrap gap-2">
                      <OptionBtn
                        label="Yes"
                        selected={b3[input.id] === 'yes'}
                        onClick={() => setB3(s => ({ ...s, [input.id]: 'yes' }))}
                      />
                      <OptionBtn
                        label="No"
                        selected={b3[input.id] === 'no'}
                        onClick={() => setB3(s => ({ ...s, [input.id]: 'no' }))}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Block 4 — Occupational and Activity Load */}
          <div className="bg-surface border border-border rounded-xl p-6 shadow-card">
            <h3 className="text-heading-3 text-text-heading mb-4">{blocks[3].title}</h3>
            {blocks[3].prose.length > 0 && (
              <div className="space-y-4 mb-5">
                {blocks[3].prose.map((p, i) => (
                  <p key={i} className="text-body text-text-body">{p}</p>
                ))}
              </div>
            )}
            {blocks[3].mechanism && (
              <div className="bg-surface-raised rounded-[8px] p-4 mb-5">
                <p className="text-body-sm text-text-muted">{blocks[3].mechanism}</p>
              </div>
            )}
            <p className="text-body-sm text-text-muted mb-3">{blocks[3].recordLabel}</p>
            <div>
              {/* ui_sustained_sitting — four-band hours */}
              <div className="py-4">
                <p className="text-body text-text-body mb-2">{blocks[3].inputs[0].label}</p>
                <div className="flex flex-wrap gap-2">
                  {(['Less than 2', '2\u20134 hours', '4\u20136 hours', 'More than 6 hours'] as const).map(opt => (
                    <OptionBtn
                      key={opt}
                      label={opt}
                      selected={b4Sitting === opt}
                      onClick={() => setB4Sitting(opt)}
                    />
                  ))}
                </div>
              </div>
              {/* ui_one_sided_work — yes/sometimes/no */}
              <div className="border-t border-border py-4">
                <p className="text-body text-text-body mb-2">{blocks[3].inputs[1].label}</p>
                <div className="flex flex-wrap gap-2">
                  {(['yes', 'sometimes', 'no'] as const).map(opt => (
                    <OptionBtn
                      key={opt}
                      label={opt.charAt(0).toUpperCase() + opt.slice(1)}
                      selected={b4Work === opt}
                      onClick={() => setB4Work(opt)}
                    />
                  ))}
                </div>
              </div>
              {/* ui_one_sided_sport — yes/no */}
              <div className="border-t border-border py-4">
                <p className="text-body text-text-body mb-2">{blocks[3].inputs[2].label}</p>
                <div className="flex flex-wrap gap-2">
                  {(['yes', 'no'] as const).map(opt => (
                    <OptionBtn
                      key={opt}
                      label={opt.charAt(0).toUpperCase() + opt.slice(1)}
                      selected={b4Sport === opt}
                      onClick={() => setB4Sport(opt)}
                    />
                  ))}
                </div>
              </div>
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
        <p className="text-muted text-text-muted text-center mt-3">Section 4 of 7</p>
      </div>

    </div>
  )
}
