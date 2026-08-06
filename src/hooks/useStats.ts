// =============================================================
//  useStats — tous les calculs de progression
// =============================================================
// Logique isolée (aucun affichage ici). Tout est dérivé de
// l'historique des séances. Deux principes importants :
//
//  1. Une série ne compte dans le volume que si elle a un poids > 0
//     ET des reps > 0. Le gainage (poids de corps, reps en secondes)
//     est donc naturellement exclu du volume chiffré : ses séries ont
//     un poids de 0, on les ignore. C'est le comportement voulu.
//
//  2. Volume d'une série = poids × reps (en kg). Le volume d'une séance,
//     d'une semaine ou d'un muscle = somme de ces volumes.

import { useMemo } from 'react'
import type { WorkoutLog } from '../types'
import { weekKey, weekLabel } from '../utils/helpers'

// ---- Types de sortie ----

export interface PersonalRecord {
  exerciseId: string
  exerciseName: string
  maxWeight: number
  /** reps réalisées lors de la série au poids max (à titre indicatif) */
  repsAtMax: number
  /** date ISO du record */
  date: string
}

export interface WeeklyVolumePoint {
  weekKey: string
  label: string
  volume: number
}

export interface MuscleVolume {
  muscleGroup: string
  volume: number
}

export interface ExercisePoint {
  date: string
  /** charge max de la séance pour cet exercice */
  maxWeight: number
  /** volume total (Σ poids×reps) de l'exercice sur la séance */
  volume: number
  /** reps totales de l'exercice sur la séance */
  totalReps: number
}

export interface ExerciseProgress {
  exerciseId: string
  exerciseName: string
  points: ExercisePoint[]
}

export interface Stats {
  records: PersonalRecord[]
  weeklyVolume: WeeklyVolumePoint[]
  muscleVolume: MuscleVolume[]
  /** meilleur volume réalisé sur une seule séance */
  bestSessionVolume: { volume: number; sessionName: string; date: string } | null
  byExercise: ExerciseProgress[]
  totalWorkouts: number
}

/** Une série "compte" pour le volume si poids et reps sont positifs */
function counts(weight: number, reps: number): boolean {
  return weight > 0 && reps > 0
}

export function useStats(workouts: WorkoutLog[]): Stats {
  return useMemo(() => {
    // Séances triées de la plus ancienne à la plus récente
    const sorted = [...workouts].sort((a, b) => a.date.localeCompare(b.date))

    // --- Records + progression par exercice ---
    const prMap = new Map<string, PersonalRecord>()
    const exMap = new Map<string, ExerciseProgress>()

    // --- Volume hebdomadaire + par muscle + meilleure séance ---
    const weekMap = new Map<string, number>()
    const muscleMap = new Map<string, number>()
    let bestSession: Stats['bestSessionVolume'] = null

    for (const w of sorted) {
      let sessionVolume = 0

      for (const ex of w.exercises) {
        let exMaxWeight = 0
        let exVolume = 0
        let exReps = 0

        for (const s of ex.sets) {
          if (!counts(s.weight, s.reps)) continue
          const v = s.weight * s.reps
          exVolume += v
          exReps += s.reps
          sessionVolume += v
          if (s.weight > exMaxWeight) exMaxWeight = s.weight

          // Volume par muscle
          muscleMap.set(
            ex.muscleGroup,
            (muscleMap.get(ex.muscleGroup) ?? 0) + v
          )

          // Record de charge (garde la 1re occurrence du poids max le plus élevé)
          const pr = prMap.get(ex.exerciseId)
          if (!pr || s.weight > pr.maxWeight) {
            prMap.set(ex.exerciseId, {
              exerciseId: ex.exerciseId,
              exerciseName: ex.exerciseName,
              maxWeight: s.weight,
              repsAtMax: s.reps,
              date: w.date,
            })
          }
        }

        // Point de progression pour cet exercice (seulement s'il a compté)
        if (exVolume > 0) {
          let entry = exMap.get(ex.exerciseId)
          if (!entry) {
            entry = {
              exerciseId: ex.exerciseId,
              exerciseName: ex.exerciseName,
              points: [],
            }
            exMap.set(ex.exerciseId, entry)
          }
          entry.points.push({
            date: w.date,
            maxWeight: exMaxWeight,
            volume: exVolume,
            totalReps: exReps,
          })
        }
      }

      // Volume de la semaine
      if (sessionVolume > 0) {
        const wk = weekKey(w.date)
        weekMap.set(wk, (weekMap.get(wk) ?? 0) + sessionVolume)

        if (!bestSession || sessionVolume > bestSession.volume) {
          bestSession = {
            volume: sessionVolume,
            sessionName: w.sessionName,
            date: w.date,
          }
        }
      }
    }

    // Volume hebdo trié chronologiquement
    const weeklyVolume: WeeklyVolumePoint[] = Array.from(weekMap.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([key, volume]) => ({
        weekKey: key,
        label: weekLabel(key),
        volume: Math.round(volume),
      }))

    // Volume par muscle, du plus travaillé au moins
    const muscleVolume: MuscleVolume[] = Array.from(muscleMap.entries())
      .map(([muscleGroup, volume]) => ({ muscleGroup, volume: Math.round(volume) }))
      .sort((a, b) => b.volume - a.volume)

    // Records : les plus récents d'abord
    const records = Array.from(prMap.values()).sort((a, b) =>
      b.date.localeCompare(a.date)
    )

    // Progression par exercice, triée par nom
    const byExercise = Array.from(exMap.values()).sort((a, b) =>
      a.exerciseName.localeCompare(b.exerciseName)
    )

    return {
      records,
      weeklyVolume,
      muscleVolume,
      bestSessionVolume: bestSession,
      byExercise,
      totalWorkouts: workouts.length,
    }
  }, [workouts])
}
