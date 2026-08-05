// =============================================================
//  SAUVEGARDE — export / import JSON versionné
// =============================================================
// L'export produit un fichier avec un numéro de version. Ainsi,
// si la structure des données évolue plus tard, on saura lire
// (ou refuser proprement) un ancien fichier. C'est ce qui protège
// ton historique sur le long terme.

import type { WorkoutLog } from '../types'
import { storage } from './storage'

/** Version du format d'export. À incrémenter si la structure change. */
const BACKUP_VERSION = 1

interface BackupFile {
  version: number
  exportedAt: string
  workouts: WorkoutLog[]
}

/** Génère le contenu texte du fichier de sauvegarde */
export function buildBackup(): string {
  const backup: BackupFile = {
    version: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    workouts: storage.getWorkouts(),
  }
  return JSON.stringify(backup, null, 2)
}

/** Déclenche le téléchargement du fichier de sauvegarde sur l'appareil */
export function downloadBackup(): void {
  const content = buildBackup()
  const blob = new Blob([content], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const date = new Date().toISOString().slice(0, 10) // AAAA-MM-JJ
  const a = document.createElement('a')
  a.href = url
  a.download = `muscu-tracker-${date}.json`
  a.click()
  URL.revokeObjectURL(url)
}

/** Résultat d'une tentative d'import */
export type ImportResult =
  | { ok: true; count: number }
  | { ok: false; error: string }

/** Valide et importe un contenu de sauvegarde. REMPLACE l'historique existant. */
export function importBackup(rawText: string): ImportResult {
  let parsed: unknown
  try {
    parsed = JSON.parse(rawText)
  } catch {
    return { ok: false, error: "Le fichier n'est pas un JSON valide." }
  }

  // Validation minimale mais réelle de la structure attendue
  if (typeof parsed !== 'object' || parsed === null) {
    return { ok: false, error: 'Format de fichier non reconnu.' }
  }
  const obj = parsed as Partial<BackupFile>

  if (typeof obj.version !== 'number') {
    return { ok: false, error: 'Fichier de sauvegarde sans numéro de version.' }
  }
  if (obj.version > BACKUP_VERSION) {
    return {
      ok: false,
      error: `Ce fichier vient d'une version plus récente (v${obj.version}). Mets l'application à jour avant de l'importer.`,
    }
  }
  if (!Array.isArray(obj.workouts)) {
    return { ok: false, error: 'Le fichier ne contient pas de liste de séances.' }
  }

  // Vérifie que chaque séance a la forme minimale attendue
  const valid = obj.workouts.every(
    (w) =>
      w &&
      typeof w.id === 'string' &&
      typeof w.sessionName === 'string' &&
      typeof w.date === 'string' &&
      Array.isArray(w.exercises)
  )
  if (!valid) {
    return { ok: false, error: 'Certaines séances du fichier sont mal formées.' }
  }

  storage.saveWorkouts(obj.workouts as WorkoutLog[])
  return { ok: true, count: obj.workouts.length }
}
