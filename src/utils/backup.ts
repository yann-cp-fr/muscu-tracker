// =============================================================
//  SAUVEGARDE — export / import JSON versionné
// =============================================================
// L'export produit un fichier avec un numéro de version. Ainsi,
// si la structure des données évolue plus tard, on saura lire
// (ou refuser proprement) un ancien fichier. C'est ce qui protège
// ton historique sur le long terme.

import type { WorkoutLog, Program } from '../types'
import { storage } from './storage'
import { notifyProgramChanged } from '../hooks/useProgram'

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

// =============================================================
//  PROGRAMME — import d'un programme + export "pour analyse"
// =============================================================

/** Valide en profondeur qu'un objet a bien la forme d'un Program.
 *  Retourne un message d'erreur explicite, ou null si tout est bon. */
function validateProgram(candidate: unknown): string | null {
  if (typeof candidate !== 'object' || candidate === null) {
    return 'Le fichier ne contient pas un programme valide.'
  }
  const prog = candidate as Partial<Program>
  if (!Array.isArray(prog.sessions) || prog.sessions.length === 0) {
    return 'Le programme ne contient aucune séance.'
  }
  for (const s of prog.sessions) {
    if (!s || typeof s.name !== 'string' || !Array.isArray(s.exercises)) {
      return 'Une séance est mal formée (nom ou liste d\'exercices manquant).'
    }
    for (const ex of s.exercises) {
      if (
        !ex ||
        typeof ex.name !== 'string' ||
        typeof ex.muscleGroup !== 'string' ||
        typeof ex.sets !== 'number' ||
        typeof ex.reps !== 'string' ||
        typeof ex.rest !== 'number'
      ) {
        return `Un exercice de "${s.name}" est incomplet (champs obligatoires : name, muscleGroup, sets, reps, rest).`
      }
    }
  }
  return null
}

/** Importe un programme (fichier program.json OU export "pour analyse").
 *  REMPLACE le programme actif. L'historique n'est JAMAIS touché. */
export function importProgram(rawText: string): ImportResult {
  let parsed: unknown
  try {
    parsed = JSON.parse(rawText)
  } catch {
    return { ok: false, error: "Le fichier n'est pas un JSON valide." }
  }

  // On accepte deux formats :
  //  - un program.json direct : { sessions: [...] }
  //  - un export "pour analyse" : { program: { sessions: [...] }, ... }
  const obj = parsed as Record<string, unknown>
  const candidate =
    obj && typeof obj === 'object' && 'program' in obj ? obj.program : parsed

  const error = validateProgram(candidate)
  if (error) return { ok: false, error }

  const program = candidate as Program
  storage.saveProgram(program)
  notifyProgramChanged() // rafraîchit tous les écrans
  return { ok: true, count: program.sessions.length }
}

/** Revient au programme par défaut du dépôt (efface le programme importé) */
export function resetProgram(): void {
  storage.clearProgram()
  notifyProgramChanged()
}

/** Contenu de l'export "pour analyse" : programme + historique réunis.
 *  C'est ce fichier que tu donnes à Claude pour qu'il adapte le programme. */
interface AnalysisExport {
  version: number
  exportedAt: string
  program: Program
  workouts: WorkoutLog[]
}

/** Construit le contenu de l'export pour analyse.
 *  `activeProgram` = le programme actuellement affiché dans l'app. */
export function buildAnalysisExport(activeProgram: Program): string {
  const data: AnalysisExport = {
    version: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    program: activeProgram,
    workouts: storage.getWorkouts(),
  }
  return JSON.stringify(data, null, 2)
}

/** Télécharge l'export "pour analyse" (programme + historique) */
export function downloadAnalysisExport(activeProgram: Program): void {
  const content = buildAnalysisExport(activeProgram)
  const blob = new Blob([content], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const date = new Date().toISOString().slice(0, 10)
  const a = document.createElement('a')
  a.href = url
  a.download = `muscu-analyse-${date}.json`
  a.click()
  URL.revokeObjectURL(url)
}
