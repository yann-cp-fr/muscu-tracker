// =============================================================
//  Page Réglages — Export / Import JSON
// =============================================================

import { useRef, useState } from 'react'
import { useWorkouts } from '../hooks/useWorkouts'
import { downloadBackup, importBackup } from '../utils/backup'
import { PageHeader, Card, Button } from '../components/ui'

export function Settings() {
  const { workouts, reload } = useWorkouts()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [message, setMessage] = useState<{ type: 'ok' | 'error'; text: string } | null>(
    null
  )
  // Contenu du fichier en attente de confirmation d'import
  const [pending, setPending] = useState<string | null>(null)

  function handleFileChosen(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      setPending(String(reader.result))
      setMessage(null)
    }
    reader.readAsText(file)
    // Réinitialise pour pouvoir réimporter le même fichier plus tard
    e.target.value = ''
  }

  function confirmImport() {
    if (!pending) return
    const result = importBackup(pending)
    if (result.ok) {
      reload()
      setMessage({
        type: 'ok',
        text: `Import réussi : ${result.count} séance(s) restaurée(s).`,
      })
    } else {
      setMessage({ type: 'error', text: result.error })
    }
    setPending(null)
  }

  return (
    <div>
      <PageHeader title="Réglages" subtitle="Sauvegarde de tes données" />

      {/* Résumé */}
      <Card className="mb-4">
        <div className="text-3xl font-bold">{workouts.length}</div>
        <div className="text-muted text-sm mt-1">séances enregistrées</div>
      </Card>

      {/* Export */}
      <Card className="mb-4">
        <h2 className="font-bold mb-1">Exporter</h2>
        <p className="text-muted text-sm mb-3">
          Télécharge un fichier de sauvegarde de tout ton historique. Garde-le en
          lieu sûr ou utilise-le pour changer de téléphone.
        </p>
        <Button onClick={downloadBackup} disabled={workouts.length === 0}>
          Télécharger la sauvegarde
        </Button>
      </Card>

      {/* Import */}
      <Card className="mb-4">
        <h2 className="font-bold mb-1">Importer</h2>
        <p className="text-muted text-sm mb-3">
          Restaure un fichier de sauvegarde.{' '}
          <span className="text-white/90">
            Attention : cela remplacera tout ton historique actuel.
          </span>
        </p>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/json,.json"
          onChange={handleFileChosen}
          className="hidden"
        />
        <Button variant="secondary" onClick={() => fileInputRef.current?.click()}>
          Choisir un fichier
        </Button>
      </Card>

      {/* Confirmation d'import */}
      {pending && (
        <Card className="mb-4 border-accent/50">
          <p className="text-sm mb-3">
            Ce fichier va <strong>remplacer</strong> tes {workouts.length} séance(s)
            actuelle(s). Continuer ?
          </p>
          <div className="flex gap-3">
            <button
              onClick={confirmImport}
              className="flex-1 bg-accent text-white rounded-xl py-3 font-semibold active:bg-blue-600"
            >
              Remplacer
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

      {/* Message de retour */}
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
