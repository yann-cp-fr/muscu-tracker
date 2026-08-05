// =============================================================
//  useProgram — charge et normalise le programme
// =============================================================
// Lit program.json et garantit que chaque séance/exercice a un id
// stable (généré à partir du nom s'il manque). Le reste de l'app
// travaille toujours avec des données normalisées.

import { useMemo } from 'react'
import programData from '../data/program.json'
import type { Program, Session, Exercise } from '../types'
import { slugify } from '../utils/helpers'

function normalizeExercise(ex: Exercise): Required<Pick<Exercise, 'id'>> & Exercise {
  return { ...ex, id: ex.id ?? slugify(ex.name) }
}

function normalizeSession(s: Session): Session {
  return {
    ...s,
    id: s.id ?? slugify(s.name),
    exercises: s.exercises.map(normalizeExercise),
  }
}

export function useProgram(): Program {
  return useMemo(() => {
    const raw = programData as Program
    return {
      name: raw.name,
      sessions: raw.sessions.map(normalizeSession),
    }
  }, [])
}

/** Récupère une séance par son id (ou son slug de nom) */
export function useSession(sessionId: string | undefined): Session | undefined {
  const program = useProgram()
  return useMemo(
    () => program.sessions.find((s) => s.id === sessionId),
    [program, sessionId]
  )
}
