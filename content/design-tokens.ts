export const colors = {
  background:       '#F8F7F4',
  primary:          '#4A9B8E',
  primaryHover:     '#3D8578',
  primaryActive:    '#36776C',
  primaryDisabled:  '#B0CEC9',
  surface:          '#FFFFFF',
  surfaceRaised:    '#F2F0EC',
  surfaceOverlay:   '#FFFFFF',
  surfaceDark:      '#1C1C1C',
  textHeading:      '#1A1A2E',
  textBody:         '#2D2D2D',
  textMuted:        '#6B7280',
  border:           '#E5E3DF',
  error:            '#C0392B',
  errorTint:        '#FEF3F2',
  winsBg:           '#EEF7F5',
  winsBorder:       '#4A9B8E',
  founderBadge:     '#1A1A2E',
  founderTint:      '#F0F7F6',
  phaseComplete:    '#4A9B8E',
  phaseActive:      '#1A1A2E',
  phaseLocked:      '#6B7280',
  phaseUnlocked:    '#5B8DB8',
  metricJaw:        '#E07B4F',
  metricNeck:       '#7B6FAB',
  metricStress:     '#D4A843',
  metricSleep:      '#5B8DB8',
  avatar1:          '#4A9B8E',
  avatar2:          '#7B6FAB',
  avatar3:          '#E07B4F',
  avatar4:          '#5B8DB8',
  avatar5:          '#7A9E5F',
  avatar6:          '#C4788A',
  chartEarlier:     '#B0CEC9',
} as const

export const spacing = {
  space1:        '8px',
  space2:        '16px',
  space3:        '24px',
  space4:        '32px',
  space5:        '40px',
  space6:        '64px',
  space7:        '96px',
  navTop:        '60px',
  navBottom:     '64px',
  navClearance:  '80px',
} as const

export const maxWidth = {
  content:    '1120px',
  public:     '760px',
  reading:    '680px',
  onboarding: '560px',
  modal:      '480px',
} as const

export const shadows = {
  card:        '0 2px 8px rgba(0,0,0,0.06)',
  dropdown:    '0 4px 12px rgba(0,0,0,0.08)',
  modal:       '0 8px 32px rgba(0,0,0,0.12)',
  inputFocus:  '0 0 0 3px rgba(74,155,142,0.15)',
  inputError:  '0 0 0 3px rgba(192,57,43,0.12)',
  slider:      '0 2px 6px rgba(0,0,0,0.12)',
} as const

export const chartConfig = {
  background:    colors.background,
  gridColor:     colors.border,
  axisColor:     colors.textMuted,
  axisFontSize:  12,
  loudnessColor: colors.primary,
} as const
