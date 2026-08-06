// =============================================================
//  SessionSummary — résumé de fin de séance (modale)
// =============================================================
// Affiché avant l'enregistrement : volume total, nombre de séries, et
// comparaison au volume de la dernière fois qu'on a fait cette séance.

import { Card, Button } from './ui'
import type { ExerciseLog, WorkoutLog } from '../types'

/** Calcule le volume (Σ poids×reps) des séries validées */
function volumeOf(exercises: ExerciseLog[]): number {
  let v = 0
  for (const ex of exercises) {
    for (const s of ex.sets) {
      if (s.done && s.weight > 0 && s.reps > 0) v += s.weight * s.reps
    }
  }
  return Math.round(v)
}

export function SessionSummary({
  sessionName,
  exercises,
  previousSameSession,
  onConfirm,
  onCancel,
}: {
  sessionName: string
  exercises: ExerciseLog[]
  previousSameSession: WorkoutLog | null
  onConfirm: () => void
  onCancel: () => void
}) {
  const doneExercises = exercises
    .map((ex) => ({ ...ex, sets: ex.sets.filter((s) => s.done) }))
    .filter((ex) => ex.sets.length > 0)

  const totalSets = doneExercises.reduce((n, ex) => n + ex.sets.length, 0)
  const volume = volumeOf(doneExercises)
  const prevVolume = previousSameSession ? volumeOf(previousSameSession.exercises) : null
  const diff = prevVolume !== null ? volume - prevVolume : null

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-end sm:items-center justify-center p-3">
      <div className="w-full max-w-lg animate-[slideUp_0.2s_ease-out]">
        <Card>
          <h2 className="text-xl font-bold mb-1">Séance terminée 💪</h2>
          <p className="text-muted text-sm mb-4">{sessionName}</p>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-surface-2 rounded-xl p-3">
              <div className="text-2xl font-bold">{totalSets}</div>
              <div className="text-muted text-xs mt-0.5">séries validées</div>
            </div>
            <div className="bg-surface-2 rounded-xl p-3">
              <div className="text-2xl font-bold">
                {volume.toLocaleString('fr-FR')}
              </div>
              <div className="text-muted text-xs mt-0.5">kg de volume</div>
            </div>
          </div>

          {/* Comparaison avec la dernière fois */}
          {diff !== null && (
            <div className="mb-4 text-sm">
              {diff > 0 ? (
                <p className="text-success">
                  +{diff.toLocaleString('fr-FR')} kg vs la dernière fois. En
                  progression !
                </p>
              ) : diff < 0 ? (
                <p className="text-muted">
                  {diff.toLocaleString('fr-FR')} kg vs la dernière fois. Une séance
                  plus légère, c'est ok.
                </p>
              ) : (
                <p className="text-muted">Même volume que la dernière fois.</p>
              )}
            </div>
          )}

          <div className="space-y-2">
            <Button variant="success" onClick={onConfirm}>
              Enregistrer la séance
            </Button>
            <Button variant="ghost" onClick={onCancel}>
              Continuer la séance
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}
