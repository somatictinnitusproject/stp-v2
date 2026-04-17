---
name: design-system
description: Somatic Tinnitus Project V2 design system. Use when building any UI component, page, layout, or styling — including dashboard, tracker, analytics, framework, exercise library, community, onboarding, auth pages, navigation, modals, toasts, empty states, loading states, or any visual element.
---

# Somatic Tinnitus Project — V2 Design System

## Critical Rule

Import all design tokens from `/content/design-tokens.ts`. Never hardcode any colour,
spacing, or typography value anywhere in the codebase. If a token does not exist, add it
to the tokens file first, then reference it by name.

---

## Colour Tokens — V2 (Document 11 §1)

These are the correct V2 values. Use these exact token names in Tailwind classes.

| Token | Hex | Usage |
|---|---|---|
| `background` | #F8F7F4 | Page background everywhere — all pages, all shells |
| `primary` | #4A9B8E | Primary buttons, links, active nav, progress fill, focus indicators |
| `primary-hover` | #3D8578 | Hover state on all primary interactive elements |
| `primary-active` | #36776C | Pressed/active state on primary buttons |
| `primary-disabled` | #B0CEC9 | Disabled primary button background |
| `surface` | #FFFFFF | Cards, modals, form inputs, question cards |
| `surface-raised` | #F2F0EC | Nested panels, skeleton loading base, optional section expand |
| `surface-overlay` | #FFFFFF | Modal content — same hex as surface but always with box-shadow |
| `surface-dark` | #1C1C1C | Network offline banner only |
| `text-heading` | #1A1A2E | Page headings, section titles, card headings |
| `text-body` | #2D2D2D | All standard body copy |
| `text-muted` | #6B7280 | Timestamps, labels, secondary metadata, disclaimers |
| `border` | #E5E3DF | All borders and dividers throughout |
| `error` | #C0392B | Form validation errors only |
| `error-tint` | #FEF3F2 | Error and contraindication backgrounds |
| `wins-bg` | #EEF7F5 | Progress & Wins card, classification badge A, protocol tag background |
| `wins-border` | #4A9B8E | Progress & Wins card border |
| `founder-badge` | #1A1A2E | Founding Member badge and Oliver · Founder badge background |
| `founder-tint` | #F0F7F6 | Oliver's reply card background tint in community |
| `phase-complete` | #4A9B8E | Completed phase block |
| `phase-active` | #1A1A2E | Active phase block border and text |
| `phase-locked` | #6B7280 | Locked phase text and icon |
| `phase-unlocked` | #5B8DB8 | Phase 4 available state |
| `metric-jaw` | #E07B4F | Jaw tension chart line and toggle |
| `metric-neck` | #7B6FAB | Neck tension chart line and toggle |
| `metric-stress` | #D4A843 | Stress chart line and toggle |
| `metric-sleep` | #5B8DB8 | Sleep quality chart line and toggle |
| `avatar-1` | #4A9B8E | Avatar colour 1 (charCode % 6 = 0) |
| `avatar-2` | #7B6FAB | Avatar colour 2 (charCode % 6 = 1) |
| `avatar-3` | #E07B4F | Avatar colour 3 (charCode % 6 = 2) |
| `avatar-4` | #5B8DB8 | Avatar colour 4 (charCode % 6 = 3) |
| `avatar-5` | #7A9E5F | Avatar colour 5 (charCode % 6 = 4) |
| `avatar-6` | #C4788A | Avatar colour 6 (charCode % 6 = 5) |
| `chart-earlier` | #B0CEC9 | Earlier period bars in loudness distribution chart |

Avatar assignment: `charCode of first character of username % 6` → avatar-1 through avatar-6.
Same member always has same colour across all contexts.

---

## Typography — V2 (Document 11 §2)

Font: **Inter** only. Four weights loaded: 400, 500, 600, 700. No other weights.

```typescript
// app/layout.tsx
import { Inter } from 'next/font/google'
const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-inter',
})
```

| Token | Size | Weight | Line Height | Usage |
|---|---|---|---|---|
| `display` | 42px | 700 | 1.1 | Homepage headline only |
| `heading-1` | 36px | 700 | 1.2 | Primary page headings |
| `heading-2` | 24px | 600 | 1.3 | Section headings |
| `heading-3` | 18px | 600 | 1.4 | Sub-section headings, card headings |
| `heading-4` | 16px | 600 | 1.4 | Small headings, exercise names condensed |
| `body-lg` | 18px | 400 | 1.6 | Framework mechanism prose, onboarding body |
| `body` | 16px | 400 | 1.6 | Standard body copy — minimum size everywhere |
| `body-sm` | 14px | 400 | 1.5 | Community replies, exercise steps, profile bio |
| `label` | 13px | 500 | 1.4 | Form labels, slider labels, category tags, nav labels |
| `muted` | 13px | 400 | 1.4 | Timestamps, disclaimers, character counts |
| `btn-primary` | 15px | 500 | 1 | All buttons |
| `btn-sm` | 13px | 500 | 1 | Small action buttons, text links in forms |
| `focus-line` | 15px | 400 | 1.5 | Today's focus line on dashboard |
| `phase-label` | 12px | 600 | 1 | COMPLETED / ACTIVE / LOCKED — always uppercase |
| `metric-value` | 32px | 700 | 1 | Personal best numbers, logging streak counter |
| `metric-label` | 12px | 500 | 1.3 | Labels below metric values |
| `score-display` | 24px | 700 | 1 | Tracker scores in read-only summary |
| `correlation-headline` | 15px | 600 | 1.4 | Correlation insight card headlines |
| `nav-item` | 13px | 500 | 1 | Bottom nav labels, desktop top nav links |
| `badge` | 11px | 600 | 1 | Classification badges, protocol tags — always uppercase |

Mobile adjustments (below md / 768px):
- `display`: 42px → 32px
- `heading-1`: 36px → 28px
- `heading-2`: 24px → 22px
- All other sizes unchanged
- Body text never scales down — 16px minimum always

**All inputs, textareas, and selects must have font-size 16px minimum.** Below 16px triggers
iOS Safari auto-zoom on focus. Enforce in globals.css:
```css
input, textarea, select { font-size: 16px; }
```

---

## Spacing — V2 (Document 11 §3)

Base-8 system. All custom spacing tokens:

| Token | Value |
|---|---|
| `space-1` | 8px |
| `space-2` | 16px |
| `space-3` | 24px |
| `space-4` | 32px |
| `space-5` | 40px |
| `space-6` | 64px |
| `space-7` | 96px |
| `nav-top` | 60px |
| `nav-bottom` | 64px |
| `nav-clearance` | 80px |

Max-width tokens:
| Token | Value | Usage |
|---|---|---|
| `max-w-content` | 1120px | Authenticated page content |
| `max-w-public` | 760px | Public pages |
| `max-w-reading` | 680px | Framework reading content, mechanism prose |
| `max-w-onboarding` | 560px | Onboarding steps |
| `max-w-modal` | 480px | Modals |

---

## Three Shells — Never Rebuild Shell Logic in Page Files

Every page uses exactly one shell. Import it. Never rebuild nav, padding, or max-width logic
inside a page component.

**AuthShell** — every authenticated page (dashboard, tracker, analytics, framework, etc.)
```tsx
// components/AuthShell.tsx
export default function AuthShell({ children }) {
  return (
    <div className="min-h-screen bg-background">
      <TopNav className="hidden md:flex" />
      <main className="max-w-content mx-auto px-4 md:px-8 pt-0 md:pt-[60px] pb-[80px] md:pb-8">
        {children}
      </main>
      <BottomNav className="flex md:hidden" />
    </div>
  )
}
```

**OnboardingShell** — all /onboarding/* routes
```tsx
// components/OnboardingShell.tsx
export default function OnboardingShell({ children }) {
  return (
    <div className="min-h-screen bg-background">
      <header className="h-[60px] flex items-center px-4 md:px-8 border-b border-border bg-surface">
        <Logo />
      </header>
      <main className="max-w-onboarding mx-auto px-4 md:px-8 pt-8 md:pt-12 pb-16">
        {children}
      </main>
    </div>
  )
}
```

**PublicShell** — homepage, login, signup, test, terms, privacy
```tsx
// components/PublicShell.tsx
export default function PublicShell({ children }) {
  return (
    <div className="min-h-screen bg-background">
      <PublicNav />
      <main className="max-w-public mx-auto px-4 md:px-8 pt-8 pb-16">
        {children}
      </main>
    </div>
  )
}
```

---

## Component Styles (Document 11 §4)

### Buttons
- **Primary:** `bg-primary text-white rounded-lg hover:bg-primary-hover active:bg-primary-active disabled:bg-primary-disabled disabled:cursor-not-allowed`
- **Secondary:** `bg-surface border border-border text-text-body rounded-lg hover:border-primary hover:text-primary`
- **Ghost:** `bg-transparent text-primary hover:bg-wins-bg rounded-lg`
- All buttons: `text-btn-primary font-medium px-5 py-2.5 transition-colors duration-150`
- Loading state: change label to "Loading..." or action-specific (e.g. "Saving..."), disable button
- Minimum touch target: 44×44px on mobile

### Cards
- `bg-surface border border-border rounded-xl p-6 shadow-card`
- Interactive cards add: `hover:shadow-dropdown transition-shadow duration-150 cursor-pointer`

### Form Inputs
- `w-full bg-surface border border-border rounded-lg px-4 py-3 text-body text-text-body`
- Focus: `focus:outline-none focus:border-primary focus:shadow-input-focus`
- Error: `border-error focus:shadow-input-error`
- Font size 16px minimum — enforced globally

### Sliders (Tracker)
- Handle minimum 44×44px touch target on mobile
- Track: `bg-surface-raised` unfilled, `bg-primary` filled
- Handle: `bg-primary shadow-slider hover:shadow-slider-hover active:shadow-slider-active`

### Badges and Tags
- Pill shape: `rounded-full px-3 py-1 text-badge uppercase tracking-wide`
- Protocol tag: `bg-wins-bg border border-wins-border text-primary`
- Founding member: `bg-founder-badge text-white`
- Classification A: `bg-wins-bg text-primary border border-wins-border`

### Phase Progression Blocks
- Completed: `bg-wins-bg border border-phase-complete text-phase-complete`
- Active: `bg-surface border-2 border-phase-active text-phase-active`
- Locked: `bg-surface-raised border border-border text-phase-locked`
- Phase 4 unlocked: `bg-[#EDF2F8] border border-phase-unlocked text-phase-unlocked`

### Toasts
- Position: fixed, bottom-centre, 16px above bottom nav (mobile), 24px from bottom (desktop)
- `max-w-[calc(100%-32px)] md:max-w-[400px] rounded-xl px-4 py-3.5 z-toast`
- Success: `bg-primary text-white`
- Error: `bg-error text-white`
- Auto-dismiss after 3 seconds

### Modals
- Backdrop: `fixed inset-0 bg-black/40 z-overlay flex items-center justify-center`
- Panel: `bg-surface-overlay rounded-xl shadow-modal max-w-modal w-full mx-4 p-8 z-modal`

### Avatars
- Post cards and reply list: 32px circle
- Post page author: 40px circle
- Initials: first 1–2 characters of username, white text, font-weight 600
- Colour: `avatar-[1-6]` based on `username.charCodeAt(0) % 6`

---

## Z-Index Scale

Always use named tokens — never magic numbers.

| Token | Value | Usage |
|---|---|---|
| `z-base` | 0 | Default |
| `z-raised` | 10 | Dropdowns, tooltips |
| `z-nav` | 20 | Navigation bars |
| `z-overlay` | 30 | Modal backdrops |
| `z-modal` | 40 | Modal panels |
| `z-toast` | 50 | Toast notifications |

---

## Animation Rules (Document 11 §5)

Permitted:
- Hover states: 150ms ease
- Page transitions: opacity fade 150ms
- Toast entry: slide up 200ms
- Phase unlock: scale + opacity 300ms
- Graph load: fade in 400ms

Never animate:
- Form validation errors (appear instantly)
- Loading skeleton pulse (CSS only, no transform)
- Any transform that could cause motion sickness

Always wrap animations:
```css
@media (prefers-reduced-motion: no-preference) {
  /* animation here */
}
```

---

## Mobile Rules (Document 11 §6)

- Minimum touch target: 44×44px for all interactive elements
- All inputs font-size 16px minimum — enforced in globals.css
- Full-width buttons on mobile
- Slider handles large enough for thumb use
- Safe area insets on bottom nav: `padding-bottom: env(safe-area-inset-bottom)`
- Test on actual device — never rely on browser resize

Force light mode — both required, both must be present:
```css
/* globals.css */
:root { color-scheme: light; }
```
```html
<!-- app/layout.tsx -->
<meta name="color-scheme" content="light" />
```

---

## Data Visualisation (Document 11 §7 — Recharts)

All charts use Recharts. Configuration:

```typescript
// Shared chart config
const CHART_CONFIG = {
  background: '#F8F7F4',   // bg-background
  gridColor: '#E5E3DF',    // border
  axisColor: '#6B7280',    // text-muted
  axisFontSize: 12,
  loudnessColor: '#4A9B8E', // primary
}

// Metric line colours — import from /content/design-tokens.ts
// metric-jaw:   #E07B4F
// metric-neck:  #7B6FAB
// metric-stress: #D4A843
// metric-sleep: #5B8DB8
```

Main loudness graph:
- X axis: dates at sensible intervals (daily/weekly/monthly based on window)
- Y axis: 1–10, labelled at 1, 4, 7, 10
- Grid lines: horizontal only, at y=4 and y=7 only
- Dots: hidden by default, visible on hover/tap
- Loudness line: primary colour, cannot be toggled off

Phase milestone markers: vertical dashed lines at phase completion dates, `text-muted` colour,
small label at top (P1, P2, P3 etc).

Metric toggle buttons: pill shape, active state fills button with corresponding line colour.
State persisted in localStorage.

---

## Box Shadows

| Token | Value |
|---|---|
| `shadow-card` | 0 2px 8px rgba(0,0,0,0.06) |
| `shadow-dropdown` | 0 4px 12px rgba(0,0,0,0.08) |
| `shadow-modal` | 0 8px 32px rgba(0,0,0,0.12) |
| `shadow-input-focus` | 0 0 0 3px rgba(74,155,142,0.15) |
| `shadow-input-error` | 0 0 0 3px rgba(192,57,43,0.12) |
| `shadow-slider` | 0 2px 6px rgba(0,0,0,0.12) |

---

## Icon Library

Lucide React. Standard sizes: 20px inline, 24px standalone. Stroke weight: 1.5.
Colour: inherit from text colour — never hardcode icon colour.
