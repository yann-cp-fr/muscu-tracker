// =============================================================
//  AddExerciseForm — ajout d'un exercice à la volée (séance en cours)
// =============================================================
// L'ajout est PONCTUEL : il n'est pas enregistré dans le programme,
// donc il ne réapparaîtra pas la prochaine fois. Il compte en revanche
// normalement dans l'historique une fois les séries validées.
//
// Choix de l'exercice : liste déroulante des exercices connus (tout le
// programme) + option "Autre…" en saisie libre. On ne définit ici que
// le nombre de séries ; poids et reps se saisissent pendant la séance.

import { useState } from 'react'
import { Card, Button } from './ui'

export interface KnownExercise {
  name: string
  muscleGroup: string
}

export function AddExerciseForm({
  knownExercises,
  onAdd,
  onCancel,
}: {
  knownExercises: KnownExercise[]
  onAdd: (data: { name: string; muscleGroup: string; sets: number }) => void
  onCancel: () => void
}) {
  // "" = aucune sélection ; "__free__" = saisie libre
  const [selected, setSelected] = useState('')
  const [freeName, setFreeName] = useState('')
  const [freeMuscle, setFreeMuscle] = useState('')
  const [sets, setSets] = useState(3)

  const isFree = selected === '__free__'
  const canSubmit = isFree ? freeName.trim().length > 0 : selected.length > 0

  function submit() {
    if (!canSubmit) return
    if (isFree) {
      onAdd({
        name: freeName.trim(),
        muscleGroup: freeMuscle.trim() || 'Autre',
        sets,
      })
    } else {
      const ex = knownExercises.find((e) => e.name === selected)
      if (ex) onAdd({ name: ex.name, muscleGroup: ex.muscleGroup, sets })
    }
  }

  return (
    <Card className="border-accent/50">
      <h3 className="font-bold mb-1">Ajouter un exercice</h3>
      <p className="text-muted text-xs mb-3">
        Ajout ponctuel pour cette séance uniquement — non mémorisé dans le programme.
      </p>

      {/* Choix de l'exercice */}
      <label className="text-xs text-muted uppercase tracking-wide">Exercice</label>
      <select
        value={selected}
        onChange={(e) => setSelected(e.target.value)}
        className="w-full bg-surface-2 rounded-lg py-3 px-3 mt-1 mb-3 outline-none focus:ring-2 focus:ring-accent font-semibold"
      >
        <option value="" disabled>
          Choisir…
        </option>
        {knownExercises.map((ex) => (
          <option key={ex.name} value={ex.name}>
            {ex.name}
          </option>
        ))}
        <option value="__free__">Autre exercice (saisie libre)…</option>
      </select>

      {/* Saisie libre si "Autre" */}
      {isFree && (
        <div className="mb-3 space-y-2">
          <input
            type="text"
            value={freeName}
            onChange={(e) => setFreeName(e.target.value)}
            placeholder="Nom de l'exercice"
            className="w-full bg-surface-2 rounded-lg py-3 px-3 outline-none focus:ring-2 focus:ring-accent"
          />
          <input
            type="text"
            value={freeMuscle}
            onChange={(e) => setFreeMuscle(e.target.value)}
            placeholder="Groupe musculaire (optionnel)"
            className="w-full bg-surface-2 rounded-lg py-3 px-3 outline-none focus:ring-2 focus:ring-accent text-sm"
          />
        </div>
      )}

      {/* Nombre de séries */}
      <label className="text-xs text-muted uppercase tracking-wide">Séries</label>
      <div className="flex items-center gap-3 mt-1 mb-4">
        <button
          onClick={() => setSets((s) => Math.max(1, s - 1))}
          className="w-12 h-12 rounded-lg bg-surface-2 text-xl font-bold active:bg-border"
          aria-label="Moins de séries"
        >
          −
        </button>
        <span className="text-2xl font-bold w-10 text-center">{sets}</span>
        <button
          onClick={() => setSets((s) => Math.min(10, s + 1))}
          className="w-12 h-12 rounded-lg bg-surface-2 text-xl font-bold active:bg-border"
          aria-label="Plus de séries"
        >
          +
        </button>
      </div>

      <div className="space-y-2">
        <Button onClick={submit} disabled={!canSubmit}>
          Ajouter à la séance
        </Button>
        <Button variant="ghost" onClick={onCancel}>
          Annuler
        </Button>
      </div>
    </Card>
  )
}
