// =============================================================
//  useWorkouts — état React de l'historique des séances
// =============================================================
// Fait le pont entre la couche storage (persistée) et React.
// Toute modification passe par ici, ce qui garantit que
// l'affichage se met à jour ET que les données sont sauvegardées.

import { useState, useCallback } from 'react'
import type { WorkoutLog } from '../types'
import { storage } from '../utils/storage'

export function useWorkouts() {
  const [workouts, setWorkouts] = useState<WorkoutLog[]>(() => storage.getWorkouts())

  /** Ajoute une séance terminée à l'historique */
  const addWorkout = useCallback((workout: WorkoutLog) => {
    storage.addWorkout(workout)
    setWorkouts(storage.getWorkouts())
  }, [])

  /** Met à jour une séance existante (édition) */
  const updateWorkout = useCallback((workout: WorkoutLog) => {
    storage.updateWorkout(workout)
    setWorkouts(storage.getWorkouts())
  }, [])

  /** Supprime une séance */
  const deleteWorkout = useCallback((id: string) => {
    storage.deleteWorkout(id)
    setWorkouts(storage.getWorkouts())
  }, [])

  /** Remplace tout l'historique (rechargement après import, etc.) */
  const reload = useCallback(() => {
    setWorkouts(storage.getWorkouts())
  }, [])

  return { workouts, addWorkout, updateWorkout, deleteWorkout, reload }
}
