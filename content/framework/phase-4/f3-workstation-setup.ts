// /content/framework/phase-4/f3-workstation-setup.ts
// F.3 — Workstation Setup
// Verbatim member-facing copy from Document 8 Part F, section F.3.
// Daily focus: "The highest-impact postural change requires no
// daily effort once it is done"
//
// One profile modifier:
//   - Sustained Desk Load Confirmed (post_sustained_desk_load=true)
//
// Practical section — acknowledgeLabel = 'Done' per Doc 8 button
// label convention (framing sections use 'Acknowledge'; practical
// sections use 'Done').

import type { ReadingSection } from './types'

const f3: ReadingSection = {
  kind: 'reading',
  id: 'F3_workstation_setup',
  section: 'F.3',
  title: 'Workstation Setup',
  estimatedMinutes: 8,
  acknowledgeLabel: 'Done',
  content: [
    {
      type: 'subhead',
      text: 'Workstation Setup',
    },
    {
      type: 'p',
      text: 'Most people spend more time at a workstation than doing any other single activity in their day. For members with confirmed desk load as a maintaining factor, the workstation is where the largest proportion of daily cervical and jaw loading occurs — and where the highest-impact postural intervention is available with the least ongoing effort. A correctly configured workstation works continuously in the background. It requires no daily time commitment once it is set up.',
    },
    {
      type: 'p',
      text: 'The adjustments below are specific and immediately actionable. Work through each one and make the changes now rather than noting them for later. The cumulative effect of all of them together is substantially greater than any single adjustment in isolation.',
    },
    {
      type: 'subhead',
      text: 'Screen Height',
    },
    {
      type: 'p',
      text: 'Your monitor should be positioned so that your gaze falls naturally on the upper third of the screen when your head is in a neutral position — ear directly above the shoulder, chin neither tucked nor protruding. If your gaze falls to the centre or lower half of the screen with your head neutral, the monitor is too low.',
    },
    {
      type: 'p',
      text: 'A monitor that is too low forces sustained cervical flexion — the head dropping forward and down for hours at a time. This is one of the single most common sources of sustained upper cervical loading in desk workers. Raising the monitor is often the highest-impact single change available.',
    },
    {
      type: 'p',
      text: 'Laptop users are structurally disadvantaged — the screen and keyboard are fixed together, making it impossible to position both correctly simultaneously. The solution is a separate keyboard and mouse with the laptop raised on a stand to the correct screen height. This is not optional for members with confirmed cervical involvement and regular laptop use.',
    },
    {
      type: 'subhead',
      text: 'Chair Height and Lumbar Support',
    },
    {
      type: 'p',
      text: 'Your chair height should allow both feet to rest flat on the floor with your hips at approximately ninety degrees — not higher than the knees, not significantly lower. Hips higher than knees produces anterior pelvic tilt, which drives compensatory thoracic flexion, which loads the cervical spine from below.',
    },
    {
      type: 'p',
      text: 'Lumbar support — either built into the chair or added with a small cushion or rolled towel — should maintain the natural inward curve of the lower back. Without it, the lumbar spine collapses into flexion during sustained sitting, and the thoracic and cervical spine compensate upward through the chain.',
    },
    {
      type: 'subhead',
      text: 'Keyboard and Mouse Distance',
    },
    {
      type: 'p',
      text: 'Both should be close enough that your elbows rest at approximately ninety degrees with your shoulders relaxed and your upper arms hanging naturally at your sides. Reaching forward for a keyboard or mouse — even by a small amount — causes the shoulders to protract and the upper trapezius to engage to stabilise the arm position. Sustained over hours, this directly elevates the tension in the muscles the cervical protocol is working to release.',
    },
    {
      type: 'subhead',
      text: 'Monitor Distance',
    },
    {
      type: 'p',
      text: 'Approximately an arm’s length from your seated position — close enough that you are not leaning forward to read, far enough that you are not straining to focus. Leaning forward to read a screen that is too far away forces exactly the forward head posture the cervical correction work is trying to reduce.',
    },
    {
      type: 'subhead',
      text: 'Dual Monitor Setup',
    },
    {
      type: 'p',
      text: 'If you use two monitors regularly, the primary monitor — the one you look at most — should be directly in front of you at the correct height. A secondary monitor positioned significantly to one side forces sustained rotation toward that side during use, loading the cervical joints asymmetrically across hours of daily activity. If both monitors receive roughly equal use, position them symmetrically so the join between them sits directly in front of you.',
    },
    {
      type: 'subhead',
      text: 'Movement Breaks',
    },
    {
      type: 'p',
      text: 'No workstation setup eliminates the problem of sustained static posture entirely. The cervical spine and surrounding muscles are not designed for hours of uninterrupted static load regardless of how good the position is. Regular movement breaks — standing, walking briefly, performing a chin tuck, rolling the shoulders — interrupt the sustained loading cycle and allow the tissues to recover.',
    },
    {
      type: 'p',
      text: 'A practical approach: once per hour, stand up and move for two to three minutes. This is not a significant time cost and its cumulative effect on reducing daily cervical load is meaningful. Members who find it difficult to remember can use a simple recurring reminder.',
    },
    {
      type: 'acknowledge_prompt',
      text: 'Done',
    },
  ],
  profileModifiers: [
    {
      triggerFlag: 'post_sustained_desk_load',
      triggerValue: true,
      title: 'Sustained Desk Load Confirmed',
      content: [
        {
          type: 'p',
          text: 'Your Phase 1 assessment identified sustained desk load as a confirmed maintaining factor. The adjustments above are not general ergonomic advice for your case — they are directly addressing one of the specific patterns identified as actively working against your protocol progress. Treating workstation setup as a priority rather than an optional refinement is warranted for your profile.',
        },
      ],
    },
  ],
}

export default f3
