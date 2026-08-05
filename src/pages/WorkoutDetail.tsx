// =============================================================
//  Page Détail d'une séance passée — consultation, édition, suppression
// =============================================================
// Édition "simple" : on corrige les valeurs saisies (poids, reps, RPE)
// et on peut supprimer une série ou la séance entière. On ne rajoute
// pas d'exercices non prévus (choix de simplicité validé).

import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useWorkouts } from '../hooks/useWorkouts'
import { Card, Button, PageHeader } from '../components/ui'
import { formatLongDate } from '../utils/helpers'
import type { WorkoutLog, SetLog } from '../types'

export function WorkoutDetail() {
  const { workoutId } = useParams()
  const { workouts, updateWorkout, deleteWorkout } = useWorkouts()
  const navigate = useNavigate()

  const original = workouts.find((w) => w.id === workoutId)

  // Copie locale éditable de la séance
  const [draft, setDraft] = useState<WorkoutLog | null>(
    original ? structuredClone(original) : null
  )
  const [editing, setEditing] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  if (!draft) {
    return (
      <div>
        <button onClick={() => navigate('/history')} className="text-accent">
          ← Historique
        </button>
        <p className="text-muted mt-4">Séance introuvable.</p>
      </div>
    )
  }

  function updateSet(exIndex: number, setIndex: number, patch: Partial<SetLog>) {
    setDraft((prev) => {
      if (!prev) return prev
      const next = structuredClone(prev)
      next.exercises[exIndex].sets[setIndex] = {
        ...next.exercises[exIndex].sets[setIndex],
        ...patch,
      }
      return next
    })
  }

  function removeSet(exIndex: number, setIndex: number) {
    setDraft((prev) => {
      if (!prev) return prev
      const next = structuredClone(prev)
      next.exercises[exIndex].sets.splice(setIndex, 1)
      // Si l'exercice n'a plus de séries, on le retire aussi
      if (next.exercises[exIndex].sets.length === 0) {
        next.exercises.splice(exIndex, 1)
      }
      return next
    })
  }

  function save() {
    if (draft) updateWorkout(draft)
    setEditing(false)
  }

  function cancel() {
    if (original) setDraft(structuredClone(original))
    setEditing(false)
  }

  return (
    <div className="pb-24">
      <button
        onClick={() => navigate('/history')}
        className="text-muted text-sm active:text-white mb-2"
      >
        ← Historique
      </button>
      <PageHeader title={draft.sessionName} subtitle={formatLongDate(draft.date)} />

      <div className="space-y-4">
        {draft.exercises.map((ex, exIndex) => (
          <Card key={`${ex.exerciseId}-${exIndex}`}>
            <div className="flex items-baseline justify-between mb-3">
              <h2 className="font-bold">{ex.exerciseName}</h2>
              <span className="text-muted text-xs">{ex.muscleGroup}</span>
            </div>

            <div className="space-y-2">
              {ex.sets.map((set, setIndex) => (
                <div key={setIndex} className="flex items-center gap-2 text-sm">
                  <span className="text-muted w-5 shrink-0">{setIndex + 1}</span>

                  {editing ? (
                    <>
                      <NumberField
                        value={set.weight}
                        suffix="kg"
                        onChange={(v) => updateSet(exIndex, setIndex, { weight: v })}
                      />
                      <NumberField
                        value={set.reps}
                        suffix="reps"
                        onChange={(v) => updateSet(exIndex, setIndex, { reps: v })}
                      />
                      <button
                        onClick={() => removeSet(exIndex, setIndex)}
                        className="ml-auto text-red-400 px-2 py-1 active:text-red-300"
                        aria-label="Supprimer la série"
                      >
                        ✕
                      </button>
                    </>
                  ) : (
                    <span className="text-white/90">
                      {set.weight} kg × {set.reps} reps
                      {set.rpe ? ` · RPE ${set.rpe}` : ''}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>

      {/* Barre d'actions */}
      <div className="mt-6 space-y-3">
        {editing ? (
          <>
            <Button variant="success" onClick={save}>
              Enregistrer les modifications
            </Button>
            <Button variant="ghost" onClick={cancel}>
              Annuler
            </Button>
          </>
        ) : (
          <>
            <Button variant="secondary" onClick={() => setEditing(true)}>
              Modifier cette séance
            </Button>
            {confirmDelete ? (
              <Card className="border-red-500/40">
                <p className="text-sm mb-3">
                  Supprimer définitivement cette séance ?
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      deleteWorkout(draft.id)
                      navigate('/history')
                    }}
                    className="flex-1 bg-red-500 text-white rounded-xl py-3 font-semibold active:bg-red-600"
                  >
                    Supprimer
                  </button>
                  <button
                    onClick={() => setConfirmDelete(false)}
                    className="flex-1 bg-surface-2 rounded-xl py-3 font-semibold active:bg-border"
                  >
                    Annuler
                  </button>
                </div>
              </Card>
            ) : (
              <Button variant="ghost" onClick={() => setConfirmDelete(true)}>
                Supprimer
              </Button>
            )}
          </>
        )}
      </div>
    </div>
  )
}

/** Petit champ numérique avec suffixe, pour l'édition */
function NumberField({
  value,
  suffix,
  onChange,
}: {
  value: number
  suffix: string
  onChange: (v: number) => void
}) {
  return (
    <div className="flex items-center gap-1 bg-surface-2 rounded-lg px-2 py-1.5">
      <input
        type="number"
        inputMode="decimal"
        value={value || ''}
        onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
        className="w-12 min-w-0 bg-transparent text-center font-semibold outline-none"
      />
      <span className="text-muted text-xs">{suffix}</span>
    </div>
  )
}
