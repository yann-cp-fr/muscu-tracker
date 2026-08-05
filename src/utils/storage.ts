// =============================================================
//  COUCHE DE STOCKAGE — point d'accès UNIQUE aux données
// =============================================================
// TOUT accès aux données persistées passe par ce fichier.
// Aujourd'hui : LocalStorage. Demain (photos/vidéos en V5) :
// on pourra basculer vers IndexedDB en ne modifiant QUE ce fichier,
// sans toucher au reste de l'application. C'est le seul endroit
// du code qui "sait" comment les données sont physiquement stockées.

import type { WorkoutLog } from '../types'

const KEYS = {
  workouts: 'muscu:workouts',
} as const

/** Lecture générique typée avec valeur par défaut si absent/corrompu */
function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    if (raw === null) return fallback
    return JSON.parse(raw) as T
  } catch {
    // Donnée corrompue → on retombe sur la valeur par défaut sans planter
    return fallback
  }
}

/** Écriture générique */
function write<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (e) {
    // Ex : quota dépassé. On log sans casser l'expérience.
    console.error('Échec de sauvegarde :', e)
  }
}

// -------------------------------------------------------------
//  API PUBLIQUE — le reste de l'app n'utilise QUE ces fonctions
// -------------------------------------------------------------

export const storage = {
  /** Récupère tout l'historique des séances */
  getWorkouts(): WorkoutLog[] {
    return read<WorkoutLog[]>(KEYS.workouts, [])
  },

  /** Remplace tout l'historique (utilisé par l'import et les sauvegardes) */
  saveWorkouts(workouts: WorkoutLog[]): void {
    write(KEYS.workouts, workouts)
  },

  /** Ajoute une séance à l'historique */
  addWorkout(workout: WorkoutLog): void {
    const all = this.getWorkouts()
    all.push(workout)
    this.saveWorkouts(all)
  },

  /** Remplace une séance existante (édition d'une séance passée) */
  updateWorkout(updated: WorkoutLog): void {
    const all = this.getWorkouts().map((w) => (w.id === updated.id ? updated : w))
    this.saveWorkouts(all)
  },

  /** Supprime une séance par son id */
  deleteWorkout(id: string): void {
    this.saveWorkouts(this.getWorkouts().filter((w) => w.id !== id))
  },
}
