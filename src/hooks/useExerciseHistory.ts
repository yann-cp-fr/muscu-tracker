// =============================================================
//  useExerciseHistory — regroupe l'historique par exercice
// =============================================================
// Transforme la liste des séances (organisée par date) en une vue
// organisée par exercice, pour afficher l'évolution dans le temps
// (ex : Développé incliné → 05/08, 12/08, 19/08…).

import { useMemo } from 'react'
import type { WorkoutLog, SetLog } from '../types'

/** Une occurrence d'un exercice à une date donnée */
export interface ExerciseOccurrence {
  date: string
  sets: SetLog[]
}

/** L'historique complet d'un exercice */
export interface ExerciseHistory {
  exerciseId: string
  exerciseName: string
  muscleGroup: string
  occurrences: ExerciseOccurrence[]
}

/** Construit l'historique par exercice à partir de toutes les séances */
export function useExerciseHistory(workouts: WorkoutLog[]): ExerciseHistory[] {
  return useMemo(() => {
    const map = new Map<string, ExerciseHistory>()

    // On parcourt les séances de la plus ancienne à la plus récente
    const sorted = [...workouts].sort((a, b) => a.date.localeCompare(b.date))

    for (const workout of sorted) {
      for (const ex of workout.exercises) {
        let entry = map.get(ex.exerciseId)
        if (!entry) {
          entry = {
            exerciseId: ex.exerciseId,
            exerciseName: ex.exerciseName,
            muscleGroup: ex.muscleGroup,
            occurrences: [],
          }
          map.set(ex.exerciseId, entry)
        }
        entry.occurrences.push({ date: workout.date, sets: ex.sets })
      }
    }

    // Trié par nom d'exercice pour un affichage stable
    return Array.from(map.values()).sort((a, b) =>
      a.exerciseName.localeCompare(b.exerciseName)
    )
  }, [workouts])
}
