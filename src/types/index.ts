// =============================================================
//  MODÈLE DE DONNÉES — source de vérité pour toute l'application
// =============================================================
// Tout le reste du code s'appuie sur ces types. Si tu veux
// comprendre la structure de l'app, commence par ce fichier.

/** Un exercice tel que défini dans program.json (le "prévu") */
export interface Exercise {
  /** Identifiant stable, utilisé pour relier l'historique à l'exercice.
   *  S'il est absent de program.json, il est généré à partir du nom. */
  id?: string
  name: string
  muscleGroup: string
  sets: number
  /** Chaîne libre car souvent une fourchette, ex "10-12" */
  reps: string
  tempo?: string
  /** Temps de repos en secondes */
  rest: number
  /** Charge cible en kg (indicative) */
  targetWeight?: number
  /** Conseils d'exécution, affichés repliables */
  tips?: string[]
}

/** Une séance = un ensemble d'exercices */
export interface Session {
  id?: string
  name: string
  exercises: Exercise[]
}

/** Le programme complet, chargé depuis program.json */
export interface Program {
  /** Nom du programme (optionnel, utile quand il y en aura plusieurs en V5) */
  name?: string
  sessions: Session[]
}

// -------------------------------------------------------------
//  DONNÉES SAISIES PENDANT LA SÉANCE (le "réalisé")
// -------------------------------------------------------------

/** Une série réellement effectuée */
export interface SetLog {
  weight: number
  reps: number
  /** Rate of Perceived Exertion, 1-10, facultatif */
  rpe?: number
  comment?: string
  /** true une fois la série validée (cochée) */
  done: boolean
}

/** Un exercice réalisé au sein d'une séance loggée */
export interface ExerciseLog {
  exerciseId: string
  exerciseName: string
  muscleGroup: string
  sets: SetLog[]
}

/** Une séance complète enregistrée dans l'historique */
export interface WorkoutLog {
  id: string
  sessionName: string
  /** Date ISO (ex "2026-08-05T09:30:00.000Z") */
  date: string
  exercises: ExerciseLog[]
}
