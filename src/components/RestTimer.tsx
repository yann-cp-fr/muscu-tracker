// =============================================================
//  RestTimer — barre de chronomètre de repos, fixée au-dessus du menu
// =============================================================
// S'affiche automatiquement quand une série est validée.
// Grand affichage, boutons larges pour un usage rapide en salle.

import { formatTime } from '../utils/helpers'

export function RestTimer({
  secondsLeft,
  onAddTime,
  onSkip,
}: {
  secondsLeft: number
  onAddTime: (s: number) => void
  onSkip: () => void
}) {
  return (
    <div
      className="fixed inset-x-0 bottom-[64px] z-30 px-3"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="max-w-lg mx-auto bg-accent-dim border border-accent rounded-2xl p-3 flex items-center gap-3 shadow-lg">
        <div className="flex-1">
          <div className="text-xs text-white/70 font-medium">Repos</div>
          <div className="text-3xl font-bold tabular-nums leading-none">
            {formatTime(secondsLeft)}
          </div>
        </div>
        <button
          onClick={() => onAddTime(15)}
          className="bg-surface-2/80 rounded-lg px-3 py-2 text-sm font-semibold active:bg-border"
        >
          +15s
        </button>
        <button
          onClick={onSkip}
          className="bg-white text-black rounded-lg px-4 py-2 text-sm font-semibold active:bg-white/80"
        >
          Passer
        </button>
      </div>
    </div>
  )
}
