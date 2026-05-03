interface ActiveMetrics {
  jaw_tension: boolean
  neck_tension: boolean
  stress: boolean
  sleep_quality: boolean
}

interface Props {
  activeMetrics: ActiveMetrics
  onChange: (m: ActiveMetrics) => void
}

const METRICS: { key: keyof ActiveMetrics; label: string; activeClass: string }[] = [
  { key: 'jaw_tension',   label: 'Jaw tension',   activeClass: 'bg-metric-jaw text-white' },
  { key: 'neck_tension',  label: 'Neck tension',  activeClass: 'bg-metric-neck text-white' },
  { key: 'stress',        label: 'Stress',         activeClass: 'bg-metric-stress text-white' },
  { key: 'sleep_quality', label: 'Sleep quality',  activeClass: 'bg-metric-sleep text-white' },
]

// Controlled pill-toggle row for overlaying individual metrics on the main chart.
export default function MetricToggleRow({ activeMetrics, onChange }: Props) {
  function toggle(key: keyof ActiveMetrics) {
    onChange({ ...activeMetrics, [key]: !activeMetrics[key] })
  }

  return (
    <div className="flex gap-2 overflow-x-auto scrollbar-none">
      {METRICS.map(({ key, label, activeClass }) => (
        <button
          key={key}
          onClick={() => toggle(key)}
          className={[
            'h-9 px-4 rounded-full font-medium text-[14px] shrink-0 transition-colors',
            activeMetrics[key]
              ? activeClass
              : 'bg-surface border border-border text-text-muted hover:bg-surface-raised',
          ].join(' ')}
        >
          {label}
        </button>
      ))}
    </div>
  )
}
