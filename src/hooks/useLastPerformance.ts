// =============================================================
//  useLastPerformance — dernière performance par exercice
// =============================================================
// Renvoie, pour chaque exerciseId, la dernière séance où il a été fait
// (poids/reps de chaque série). Sert à deux choses en V4 :
//   1. afficher un rappel discret « la dernière fois : 18 kg × 12 »
//   2. pré-remplir intelligemment la saisie avec ces valeurs

import { useMemo } from 'react'
import type { WorkoutLog, SetLog } from '../types'

export interface LastPerformance {
  date: string
  sets: SetLog[]
}

/** Map exerciseId → dernière performance connue */
export function useLastPerformance(
  workouts: WorkoutLog[]
): Map<string, LastPerformance> {
  return useMemo(() => {
    const map = new Map<string, LastPerformance>()
    // De la plus ancienne à la plus récente : la dernière écrasée gagne
    const sorted = [...workouts].sort((a, b) => a.date.localeCompare(b.date))
    for (const w of sorted) {
      for (const ex of w.exercises) {
        if (ex.sets.length > 0) {
          map.set(ex.exerciseId, { date: w.date, sets: ex.sets })
        }
      }
    }
    return map
  }, [workouts])
}
