// Single source of truth for the community charter copy.
// Rendered once per member via CharterModal on first community
// visit after Phase 1 completion. Never stored in the DB.
//
// To revise: edit here, push, every member who has not yet
// acknowledged sees the new version. Members who already
// acknowledged the prior version do not re-see it (acceptable
// -- substantive changes would warrant a separate notice).

export const COMMUNITY_CHARTER = {
  heading: 'Before you post',
  intro: 'Quick note from me.',
  paragraphs: [
    'The most useful thing you can do here is share your own experience plainly: what’s working, what’s not, where you’re stuck. That’s what makes this community valuable.',
    'When you’re responding to someone else, share what worked for you rather than what they should do. Everyone’s pattern is different, and people figure things out best when they have space to.',
    'Be kind to each other. Tinnitus is hard, and the people here are dealing with it the same as you.',
  ],
  signoff: 'Oliver',
  buttonLabel: 'Got it',
} as const
