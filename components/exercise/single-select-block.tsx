'use client'

// /components/exercise/single-select-block.tsx
// Renders a single-select option group from a ContentBlock of type
// 'single_select'. Used by ReadingView for G.1 outcome selection.
//
// Locked state renders each option as a <div> to suppress click handlers
// entirely — pointer-events-none on a button still fires via keyboard.
// When locked, the parent ReadingView is in reviewMode (already selected).

interface SingleSelectOption {
  value: string
  label: string
  description?: string
}

interface SingleSelectBlockProps {
  block: {
    type: 'single_select'
    source: string
    prompt: string
    options: SingleSelectOption[]
  }
  selectedValue: string | null
  onSelect: (value: string) => void
  locked: boolean
}

export default function SingleSelectBlock({
  block,
  selectedValue,
  onSelect,
  locked,
}: SingleSelectBlockProps) {
  return (
    <div>
      <p className="text-[16px] font-medium text-text-heading mb-3">{block.prompt}</p>
      <div className="flex flex-col gap-2">
        {block.options.map((option) => {
          const isSelected = selectedValue === option.value

          if (locked) {
            return (
              <div
                key={option.value}
                className={[
                  'rounded-lg border px-4 py-3',
                  isSelected
                    ? 'bg-wins-bg border-wins-border'
                    : 'bg-surface-raised border-border',
                ].join(' ')}
              >
                <p
                  className={[
                    'text-[14px] font-medium',
                    isSelected ? 'text-primary' : 'text-text-heading',
                  ].join(' ')}
                >
                  {option.label}
                </p>
                {option.description && (
                  <p className="text-[12px] text-text-muted mt-1">{option.description}</p>
                )}
              </div>
            )
          }

          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onSelect(option.value)}
              className={[
                'rounded-lg border px-4 py-3 text-left transition-colors',
                isSelected
                  ? 'bg-wins-bg border-wins-border'
                  : 'bg-surface-raised border-border hover:bg-surface',
              ].join(' ')}
            >
              <p
                className={[
                  'text-[14px] font-medium',
                  isSelected ? 'text-primary' : 'text-text-heading',
                ].join(' ')}
              >
                {option.label}
              </p>
              {option.description && (
                <p className="text-[12px] text-text-muted mt-1">{option.description}</p>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
