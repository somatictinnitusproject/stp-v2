// Cloudflare Stream video configuration — single source of truth for exercise
// and demonstration video IDs. Per Doc 14 §6.5.
//
// Workflow when a video is filmed and uploaded:
//   1. Upload to Cloudflare Stream via dashboard
//   2. Copy the Video UID
//   3. Paste it into VIDEO_IDS below against the matching key
//   4. The placeholder badge disappears for that exercise automatically
//
// Keys follow the pattern <doc8_section>_<short_slug>, lowercase with
// underscores. Examples: 'd6_masseter_release', 'e5_suboccipital_tennis_ball'.
//
// Empty string means not yet filmed — VideoSlot renders the
// "Video coming soon" placeholder.

// Empty string sentinel signals "no video yet" — placeholder rendered.
export const PLACEHOLDER_VIDEO_ID = ''

export const VIDEO_IDS: Record<string, string> = {
  // Phase 3 TMJ release exercises
  d4_heat_application: '',
  d5_temporalis_release: '',
  d6_masseter_release: '',
  d7_intraoral_pterygoid_release: '',
  d8_lateral_pterygoid_release: '',
  d9_auriculotemporal_nerve_mobilisation: '',
  d10_tmj_distraction: 'abc227476ee1bbdb547695c01b051950',

  // Phase 3 TMJ resistance exercises
  d14_jaw_symmetry_retraining: '',
  d15_progressive_resistance: '',
  d17_condylar_repositioning: 'd0ec161ae3a01ba6b2b18dfc97664753',

  // Phase 3 cervical release exercises
  e5_suboccipital_tennis_ball: 'ac56c091b591e80a2d9a63f1fb4a0e44',
  e6_scm_stretching: 'bd8d5eeaff4d6e45f00c97d1a9daf235',
  e7_levator_scapulae_stretching: '9823f073689e9aeaeb7fe6cfe8d616c5',
  e8_upper_trap_scalene_release: '',

  // Phase 3 cervical retraining exercises
  e11_chin_tuck_rotation: 'ef52b4b2a97a8bd23aaf4ef83e1fab3c',
  e13_deep_cervical_flexor_training: '22d62cd4ee343db4d24465f77f807b22',
  e14_cervical_rotation_holds: '',
  e15_cervical_proprioception: '',
}

export interface ResolvedVideo {
  id: string
  isPlaceholder: boolean
}

// Resolves a videoKey to a Cloudflare Stream UID. If the key is missing
// from VIDEO_IDS or maps to an empty string, isPlaceholder is true and
// the consumer renders the "Video coming soon" state.
export function resolveVideoId(videoKey: string): ResolvedVideo {
  const id = VIDEO_IDS[videoKey] ?? PLACEHOLDER_VIDEO_ID
  return {
    id,
    isPlaceholder: id === PLACEHOLDER_VIDEO_ID,
  }
}
