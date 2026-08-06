// =============================================================
//  Stepper — champ numérique avec boutons +/− (usage au pouce)
// =============================================================
// Permet d'ajuster une valeur sans ouvrir le clavier. Le champ reste
// saisissable directement (tap → clavier) pour les grands changements.

interface StepperProps {
  value: number
  onChange: (v: number) => void
  step: number
  min?: number
  /** placeholder affiché quand la valeur est 0 */
  placeholder?: string
  /** style atténué quand la série est validée */
  dimmed?: boolean
  'aria-label'?: string
}

export function Stepper({
  value,
  onChange,
  step,
  min = 0,
  placeholder,
  dimmed,
  'aria-label': ariaLabel,
}: StepperProps) {
  function bump(delta: number) {
    // Arrondi pour éviter les 17.500000001 dus aux flottants
    const next = Math.max(min, Math.round((value + delta) * 100) / 100)
    onChange(next)
  }

  return (
    <div
      className={`flex items-stretch bg-surface-2 rounded-lg overflow-hidden transition-opacity ${
        dimmed ? 'opacity-60' : ''
      }`}
    >
      <button
        onClick={() => bump(-step)}
        className="px-2 text-lg font-bold text-muted active:bg-border active:text-white select-none"
        aria-label="Diminuer"
        tabIndex={-1}
      >
        −
      </button>
      <input
        type="number"
        inputMode="decimal"
        value={value || ''}
        onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
        placeholder={placeholder}
        aria-label={ariaLabel}
        className="w-full min-w-0 bg-transparent py-3 text-center text-lg font-semibold outline-none"
      />
      <button
        onClick={() => bump(step)}
        className="px-2 text-lg font-bold text-muted active:bg-border active:text-white select-none"
        aria-label="Augmenter"
        tabIndex={-1}
      >
        +
      </button>
    </div>
  )
}
