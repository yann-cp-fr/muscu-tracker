// =============================================================
//  Page Réglages — Données (historique) & Programme
// =============================================================
// Deux domaines distincts :
//   1. DONNÉES : export/import de l'historique (sauvegarde, changement de tel)
//   2. PROGRAMME : importer un programme adapté, exporter "pour analyse",
//      revenir au programme par défaut.
// Un import demande toujours confirmation avant d'écraser.

import { useRef, useState } from 'react'
import { useWorkouts } from '../hooks/useWorkouts'
import { useProgram, useIsImportedProgram } from '../hooks/useProgram'
import {
  downloadBackup,
  importBackup,
  importProgram,
  resetProgram,
  downloadAnalysisExport,
} from '../utils/backup'
import { PageHeader, Card, Button } from '../components/ui'

// Ce qu'un fichier choisi va faire une fois confirmé
type PendingKind = 'backup' | 'program'

export function Settings() {
  const { workouts, reload } = useWorkouts()
  const program = useProgram()
  const isImported = useIsImportedProgram()

  // Deux sélecteurs de fichiers distincts pour éviter toute confusion
  const backupInputRef = useRef<HTMLInputElement>(null)
  const programInputRef = useRef<HTMLInputElement>(null)

  const [message, setMessage] = useState<{ type: 'ok' | 'error'; text: string } | null>(
    null
  )
  // Fichier en attente de confirmation + nature de l'action
  const [pending, setPending] = useState<{ kind: PendingKind; text: string } | null>(
    null
  )
  const [confirmReset, setConfirmReset] = useState(false)

  function readFile(file: File, kind: PendingKind) {
    const reader = new FileReader()
    reader.onload = () => {
      setPending({ kind, text: String(reader.result) })
      setMessage(null)
    }
    reader.readAsText(file)
  }

  function onBackupChosen(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) readFile(file, 'backup')
    e.target.value = ''
  }

  function onProgramChosen(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) readFile(file, 'program')
    e.target.value = ''
  }

  function confirmImport() {
    if (!pending) return
    if (pending.kind === 'backup') {
      const result = importBackup(pending.text)
      if (result.ok) {
        reload()
        setMessage({ type: 'ok', text: `Import réussi : ${result.count} séance(s) restaurée(s).` })
      } else {
        setMessage({ type: 'error', text: result.error })
      }
    } else {
      const result = importProgram(pending.text)
      if (result.ok) {
        setMessage({ type: 'ok', text: `Programme importé : ${result.count} séance(s).` })
      } else {
        setMessage({ type: 'error', text: result.error })
      }
    }
    setPending(null)
  }

  return (
    <div className="pb-4">
      <PageHeader title="Réglages" subtitle="Données et programme" />

      {/* ============ SECTION DONNÉES ============ */}
      <h2 className="text-sm font-bold text-muted uppercase tracking-wide mb-2">
        Tes données
      </h2>

      <Card className="mb-3">
        <div className="text-3xl font-bold">{workouts.length}</div>
        <div className="text-muted text-sm mt-1">séances enregistrées</div>
      </Card>

      <Card className="mb-3">
        <h3 className="font-bold mb-1">Sauvegarder l'historique</h3>
        <p className="text-muted text-sm mb-3">
          Télécharge un fichier de sauvegarde de tout ton historique. Utile pour
          changer de téléphone.
        </p>
        <Button onClick={downloadBackup} disabled={workouts.length === 0}>
          Télécharger la sauvegarde
        </Button>
      </Card>

      <Card className="mb-6">
        <h3 className="font-bold mb-1">Restaurer l'historique</h3>
        <p className="text-muted text-sm mb-3">
          Restaure une sauvegarde.{' '}
          <span className="text-white/90">Cela remplacera ton historique actuel.</span>
        </p>
        <input
          ref={backupInputRef}
          type="file"
          accept="application/json,.json"
          onChange={onBackupChosen}
          className="hidden"
        />
        <Button variant="secondary" onClick={() => backupInputRef.current?.click()}>
          Choisir un fichier
        </Button>
      </Card>

      {/* ============ SECTION PROGRAMME ============ */}
      <h2 className="text-sm font-bold text-muted uppercase tracking-wide mb-2">
        Ton programme
      </h2>

      <Card className="mb-3">
        <div className="flex items-baseline justify-between">
          <div className="font-bold">{program.name ?? 'Programme'}</div>
          <span className="text-xs text-muted">
            {isImported ? 'importé' : 'par défaut'}
          </span>
        </div>
        <p className="text-muted text-sm mt-1">
          {program.sessions.length} séance(s) : {program.sessions.map((s) => s.name).join(', ')}
        </p>
      </Card>

      <Card className="mb-3">
        <h3 className="font-bold mb-1">Exporter pour analyse</h3>
        <p className="text-muted text-sm mb-3">
          Télécharge un fichier contenant <strong>ton programme + ton historique</strong>.
          Donne-le à Claude pour qu'il analyse ta progression et adapte tes prochaines
          séances.
        </p>
        <Button onClick={() => downloadAnalysisExport(program)}>
          Exporter pour analyse
        </Button>
      </Card>

      <Card className="mb-3">
        <h3 className="font-bold mb-1">Importer un programme</h3>
        <p className="text-muted text-sm mb-3">
          Charge un nouveau programme (le fichier généré par Claude).{' '}
          <span className="text-white/90">
            Ton historique est conservé, seul le programme change.
          </span>
        </p>
        <input
          ref={programInputRef}
          type="file"
          accept="application/json,.json"
          onChange={onProgramChosen}
          className="hidden"
        />
        <Button variant="secondary" onClick={() => programInputRef.current?.click()}>
          Choisir un programme
        </Button>
      </Card>

      {/* Retour au programme par défaut, seulement si un programme est importé */}
      {isImported && (
        <Card className="mb-6">
          <h3 className="font-bold mb-1">Revenir au programme par défaut</h3>
          <p className="text-muted text-sm mb-3">
            Efface le programme importé et réaffiche le programme d'origine.
          </p>
          {confirmReset ? (
            <div className="flex gap-3">
              <button
                onClick={() => {
                  resetProgram()
                  setConfirmReset(false)
                  setMessage({ type: 'ok', text: 'Programme par défaut rétabli.' })
                }}
                className="flex-1 bg-accent text-white rounded-xl py-3 font-semibold active:bg-blue-600"
              >
                Confirmer
              </button>
              <button
                onClick={() => setConfirmReset(false)}
                className="flex-1 bg-surface-2 rounded-xl py-3 font-semibold active:bg-border"
              >
                Annuler
              </button>
            </div>
          ) : (
            <Button variant="ghost" onClick={() => setConfirmReset(true)}>
              Revenir au programme par défaut
            </Button>
          )}
        </Card>
      )}

      {/* ============ CONFIRMATION D'IMPORT ============ */}
      {pending && (
        <Card className="mb-4 border-accent/50">
          {pending.kind === 'backup' ? (
            <p className="text-sm mb-3">
              Ce fichier va <strong>remplacer</strong> tes {workouts.length} séance(s)
              actuelle(s). Continuer ?
            </p>
          ) : (
            <p className="text-sm mb-3">
              Ce fichier va <strong>remplacer ton programme</strong> actuel. Ton
              historique sera conservé. Continuer ?
            </p>
          )}
          <div className="flex gap-3">
            <button
              onClick={confirmImport}
              className="flex-1 bg-accent text-white rounded-xl py-3 font-semibold active:bg-blue-600"
            >
              {pending.kind === 'backup' ? 'Remplacer' : 'Importer'}
            </button>
            <button
              onClick={() => setPending(null)}
              className="flex-1 bg-surface-2 rounded-xl py-3 font-semibold active:bg-border"
            >
              Annuler
            </button>
          </div>
        </Card>
      )}

      {/* ============ MESSAGE DE RETOUR ============ */}
      {message && (
        <Card
          className={message.type === 'ok' ? 'border-success/50' : 'border-red-500/50'}
        >
          <p className="text-sm">{message.text}</p>
        </Card>
      )}
    </div>
  )
}
