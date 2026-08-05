// =============================================================
//  useProgram — charge et normalise le programme ACTIF
// =============================================================
// Source du programme, par ordre de priorité :
//   1. Programme importé par l'utilisateur (LocalStorage) — s'il existe
//   2. Sinon, le program.json du dépôt (programme "par défaut / d'usine")
//
// GitHub n'a aucun accès au LocalStorage : une mise à jour du code ne
// peut donc pas effacer un programme importé.

import { useSyncExternalStore, useMemo } from 'react'
import defaultProgramData from '../data/program.json'
import type { Program, Session, Exercise } from '../types'
import { slugify } from '../utils/helpers'
import { storage } from '../utils/storage'

function normalizeExercise(ex: Exercise): Exercise {
  return { ...ex, id: ex.id ?? slugify(ex.name) }
}

function normalizeSession(s: Session): Session {
  return {
    ...s,
    id: s.id ?? slugify(s.name),
    exercises: s.exercises.map(normalizeExercise),
  }
}

function normalizeProgram(raw: Program): Program {
  return {
    name: raw.name,
    sessions: raw.sessions.map(normalizeSession),
  }
}

// -------------------------------------------------------------
//  Store d'abonnement — avec CACHE du snapshot
// -------------------------------------------------------------
// IMPORTANT : useSyncExternalStore compare les snapshots par référence.
// storage.getProgram() fait un JSON.parse et renvoie un NOUVEL objet à
// chaque appel → si on le renvoyait directement, React bouclerait à
// l'infini (erreur #185). On met donc en cache le dernier snapshot et on
// ne le régénère QUE lorsque le programme a réellement changé (signalé
// par notifyProgramChanged, qui incrémente une version).

const listeners = new Set<() => void>()
let version = 0 // change à chaque import/reset
let cachedVersion = -1
let cachedSnapshot: Program = defaultProgramData as Program

function subscribe(listener: () => void): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

/** Snapshot stable : même référence tant que le programme n'a pas changé */
function getSnapshot(): Program {
  if (cachedVersion !== version) {
    cachedSnapshot = storage.getProgram() ?? (defaultProgramData as Program)
    cachedVersion = version
  }
  return cachedSnapshot
}

/** À appeler après un import / reset pour rafraîchir tous les écrans */
export function notifyProgramChanged(): void {
  version++
  listeners.forEach((l) => l())
}

export function useProgram(): Program {
  const raw = useSyncExternalStore(subscribe, getSnapshot)
  return useMemo(() => normalizeProgram(raw), [raw])
}

/** Indique si le programme actif vient d'un import (vs le défaut du dépôt).
 *  Booléen (valeur primitive) → pas de problème de référence. */
export function useIsImportedProgram(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => {
      // dépend de `version` pour se recalculer après import/reset
      void version
      return storage.getProgram() !== null
    }
  )
}

/** Récupère une séance par son id (ou son slug de nom) */
export function useSession(sessionId: string | undefined): Session | undefined {
  const program = useProgram()
  return useMemo(
    () => program.sessions.find((s) => s.id === sessionId),
    [program, sessionId]
  )
}
