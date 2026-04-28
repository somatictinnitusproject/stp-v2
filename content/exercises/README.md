# /content/exercises — Phase 3 Exercise Content

## File conventions

- One file per exercise, named `{id}.ts` (e.g. `D6_masseter_release.ts`)
- Each file default-exports a single `Exercise` object conforming to `./_types.ts`
- Reading/orientation sections (D.1–D.3, D.12–D.13, D.18–D.19, E.1–E.4, E.12, E.16)
  live in `/content/framework/`, not here
- No exercise content is authored in this directory until M13m onwards

## Importing types

```typescript
import type { Exercise, ContentBlock, ProfileModifier, TimerConfig } from '@/content/exercises/_types'
```

## Profile modifier silent-omission policy

See **errata P3-13** in `ERRATA_AND_BUILD_INSTRUCTIONS.md`.

Pattern: `{phase1[triggerFlag] === triggerValue && <ProfileModifier />}`. If the
column is absent or null on `phase1_assessment`, the reference resolves to
`undefined`, strict equality fails, and the block is silently omitted — no error,
no warning, no UI artifact. Do not render placeholders for missing flags.

## Pre-launch overrides

Full change text in `STP_PreLaunch_Changes.md`. Affected exercises:

| Exercise | Override |
|---|---|
| D5 temporalis | §1.2 soften 90-second absoluteness; §4.1 timer required |
| D6 masseter | §1.1 Golgi tendon organ correction; §1.2 soften; §4.1 timer |
| D8 lateral pterygoid | §1.5 honest anatomical access framing appended |
| D10 TMJ distraction | §1.6 clinician-vs-self paragraph prepended |
| E5 suboccipital | §1.1 Golgi tendon organ; §1.2 soften; §4.1 timer (right channel) |
| E11 chin-tuck-rotation | §1.8 ENTIRELY NEW — discard all SNAG content from Doc 8 |
| E13 DCF training | §1.9 self-palpation fidelity check before common mistake warning |

## Phase 3 exercise list (post-pre-launch — 20 daily session exercises)

**TMJ release (7) — content in M13m + M13n:**
- `D4_heat_application` — Heat Application
- `D5_temporalis_release` — Temporalis Release [TIMER: 3×90s]
- `D6_masseter_release` — Masseter Release [TIMER: 3×90s]
- `D7_intraoral_pterygoid_release` — Intraoral Pterygoid Release
- `D8_lateral_pterygoid_release` — Lateral Pterygoid Release
- `D9_auriculotemporal_nerve_mob` — Auriculotemporal Nerve Mobilisation
- `D10_tmj_distraction` — TMJ Distraction

**TMJ resistance (4) — content in M13p:**
- `D14_jaw_symmetry_retraining` — Jaw Symmetry Retraining
- `D15_progressive_resistance` — Progressive Resistance Exercises
- `D16_eccentric_jaw_control` — Eccentric Jaw Control
- `D17_condylar_repositioning` — Condylar Repositioning

**Cervical release (6) — content in M13s + M13t:**
- `E5_suboccipital_tennis_ball` — Suboccipital Tennis Ball Release [TIMER: 1×600s, right channel]
- `E6_scm_stretching` — SCM Stretching
- `E7_levator_scapulae_stretching` — Levator Scapulae Stretching
- `E8_upper_trap_scalene_release` — Upper Trapezius and Scalene Release
- `E9_suboccipital_specific_stretching` — Suboccipital Specific Stretching
- `E11_chin_tuck_rotation` — Controlled Chin Tuck with Rotation

**Cervical retraining (3) — content in M13v:**
- `E13_deep_cervical_flexor_training` — Deep Cervical Flexor Training
- `E14_cervical_rotation_holds` — Cervical Rotation Holds
- `E15_cervical_proprioception` — Cervical Proprioception Retraining

D.11 hyoid removed from protocol per pre-launch §1.7 — library only (Phase F).
E.10 thoracic mobility removed from protocol per pre-launch §4.5 — library only (Phase F).
