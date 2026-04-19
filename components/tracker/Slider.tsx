'use client'

import { useId } from 'react'

type SliderProps = {
  label: string
  description: string
  name: string
  value: number
  hasBeenMoved: boolean
  onChange: (value: number) => void
}

// Offsets bubble by thumb radius at extremes so it never overflows the track edge
function bubbleLeft(value: number): string {
  const pct = (value - 1) / 9
  return `calc(${pct * 100}% + ${12 - pct * 24}px)`
}

export default function Slider({
  label,
  description,
  name,
  value,
  hasBeenMoved,
  onChange,
}: SliderProps) {
  const inputId = useId()
  const descId = useId()
  const fillPct = ((value - 1) / 9) * 100

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={inputId} className="text-label text-text-body">
        {label}
      </label>
      <p id={descId} className="text-body-sm text-text-muted -mt-1">
        {description}
      </p>

      <div
        className={`slider-track-wrap relative${hasBeenMoved ? ' has-moved' : ''}`}
        style={{ '--fill-pct': `${fillPct}%` } as React.CSSProperties}
      >
        {/* Bubble before input — lower DOM order means lower stacking, thumb paints above */}
        <div
          className="slider-bubble pointer-events-none absolute top-0"
          style={{ left: bubbleLeft(value) }}
          aria-hidden="true"
        >
          <span className="slider-bubble-inner">{value}</span>
        </div>

        <input
          id={inputId}
          type="range"
          name={name}
          min={1}
          max={10}
          step={1}
          value={value}
          aria-describedby={descId}
          onChange={(e) => onChange(Number(e.target.value))}
          className="slider-input w-full"
        />
      </div>
    </div>
  )
}
