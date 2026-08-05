// =============================================================
//  Page Séance active — LE cœur de l'application
// =============================================================
// C'est l'écran utilisé pendant l'entraînement, en salle, au téléphone.
// Pour chaque exercice et chaque série, on saisit poids + reps (+ RPE,
// commentaire facultatifs), on valide (✓), ce qui coche la série et
// lance automatiquement le chrono de repos. À la fin, on enregistre.

import { useState, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useSession } from '../hooks/useProgram'
import { useWorkouts } from '../hooks/useWorkouts'
import { useTimer } from '../hooks/useTimer'
import { Card, Button } from '../components/ui'
import { CollapsibleTips } from '../components/CollapsibleTips'
import { RestTimer } from '../components/RestTimer'
import { makeId } from '../utils/helpers'
import type { ExerciseLog, SetLog, WorkoutLog } from '../types'

export function SessionActive() {
  const { sessionId } = useParams()
  const session = useSession(sessionId)
  const { addWorkout } = useWorkouts()
  const navigate = useNavigate()
  const timer = useTimer()

  // État de saisie : un tableau de logs d'exercices, initialisé à partir
  // du programme (autant de séries vides que prévu dans program.json).
  const [logs, setLogs] = useState<ExerciseLog[]>(() => {
    if (!session) return []
    return session.exercises.map((ex) => ({
      exerciseId: ex.id!,
      exerciseName: ex.name,
      muscleGroup: ex.muscleGroup,
      sets: Array.from({ length: ex.sets }, () => ({
        weight: ex.targetWeight ?? 0,
        reps: 0,
        done: false,
      })) as SetLog[],
    }))
  })

  const [showRpe, setShowRpe] = useState(false)

  // Nombre de séries validées / total, pour la barre de progression
  const { validated, total } = useMemo(() => {
    let v = 0
    let t = 0
    for (const ex of logs) {
      for (const s of ex.sets) {
        t++
        if (s.done) v++
      }
    }
    return { validated: v, total: t }
  }, [logs])

  if (!session) {
    return (
      <div>
        <p className="text-muted">Séance introuvable.</p>
        <button onClick={() => navigate('/sessions')} className="text-accent mt-2">
          ← Retour aux séances
        </button>
      </div>
    )
  }

  // Met à jour un champ d'une série donnée
  function updateSet(exIndex: number, setIndex: number, patch: Partial<SetLog>) {
    setLogs((prev) => {
      const next = structuredClone(prev)
      next[exIndex].sets[setIndex] = { ...next[exIndex].sets[setIndex], ...patch }
      return next
    })
  }

  // Valide une série → coche + lance le chrono de repos de l'exercice
  function validateSet(exIndex: number, setIndex: number, restSeconds: number) {
    updateSet(exIndex, setIndex, { done: true })
    timer.start(restSeconds)
  }

  // Enregistre la séance dans l'historique et revient à l'accueil
  function finishWorkout() {
    const workout: WorkoutLog = {
      id: makeId(),
      sessionName: session!.name,
      date: new Date().toISOString(),
      // On ne garde que les exercices ayant au moins une série validée
      exercises: logs
        .map((ex) => ({ ...ex, sets: ex.sets.filter((s) => s.done) }))
        .filter((ex) => ex.sets.length > 0),
    }
    addWorkout(workout)
    timer.stop()
    navigate('/')
  }

  return (
    // pb-40 : laisse de la place pour le chrono + le bouton flottant + la nav
    <div className="pb-40">
      {/* En-tête avec progression */}
      <header className="mb-4">
        <button
          onClick={() => navigate('/sessions')}
          className="text-muted text-sm active:text-white mb-2"
        >
          ← Séances
        </button>
        <h1 className="text-2xl font-bold">{session.name}</h1>
        <div className="mt-3">
          <div className="h-2 bg-surface-2 rounded-full overflow-hidden">
            <div
              className="h-full bg-accent transition-all"
              style={{ width: total ? `${(validated / total) * 100}%` : '0%' }}
            />
          </div>
          <p className="text-muted text-xs mt-1">
            {validated} / {total} séries validées
          </p>
        </div>
        <label className="flex items-center gap-2 mt-3 text-sm text-muted">
          <input
            type="checkbox"
            checked={showRpe}
            onChange={(e) => setShowRpe(e.target.checked)}
            className="w-4 h-4 accent-accent"
          />
          Afficher le RPE
        </label>
      </header>

      {/* Liste des exercices */}
      <div className="space-y-4">
        {session.exercises.map((ex, exIndex) => (
          <Card key={ex.id}>
            <div className="flex items-baseline justify-between">
              <h2 className="text-lg font-bold">{ex.name}</h2>
              <span className="text-muted text-xs">{ex.muscleGroup}</span>
            </div>
            <p className="text-muted text-sm mt-0.5">
              {ex.sets} × {ex.reps}
              {ex.tempo ? ` · tempo ${ex.tempo}` : ''} · repos {ex.rest}s
            </p>

            <CollapsibleTips tips={ex.tips} />

            {/* En-têtes de colonnes */}
            <div className="grid grid-cols-[18px_1fr_1fr_48px] gap-2 mt-4 mb-1 text-[11px] text-muted uppercase tracking-wide">
              <span></span>
              <span>Poids</span>
              <span>Reps</span>
              <span className="text-center">OK</span>
            </div>

            {/* Lignes de séries */}
            <div className="space-y-2">
              {logs[exIndex].sets.map((set, setIndex) => (
                <div key={setIndex}>
                  <div className="grid grid-cols-[18px_1fr_1fr_48px] gap-2 items-center">
                    <span className="text-muted text-sm text-center">
                      {setIndex + 1}
                    </span>
                    <input
                      type="number"
                      inputMode="decimal"
                      value={set.weight || ''}
                      onChange={(e) =>
                        updateSet(exIndex, setIndex, {
                          weight: parseFloat(e.target.value) || 0,
                        })
                      }
                      placeholder={String(ex.targetWeight ?? 0)}
                      className={`w-full min-w-0 bg-surface-2 rounded-lg py-3 px-1 text-center text-lg font-semibold outline-none focus:ring-2 focus:ring-accent ${
                        set.done ? 'opacity-60' : ''
                      }`}
                    />
                    <input
                      type="number"
                      inputMode="numeric"
                      value={set.reps || ''}
                      onChange={(e) =>
                        updateSet(exIndex, setIndex, {
                          reps: parseInt(e.target.value) || 0,
                        })
                      }
                      placeholder="0"
                      className={`w-full min-w-0 bg-surface-2 rounded-lg py-3 px-1 text-center text-lg font-semibold outline-none focus:ring-2 focus:ring-accent ${
                        set.done ? 'opacity-60' : ''
                      }`}
                    />
                    <button
                      onClick={() =>
                        set.done
                          ? updateSet(exIndex, setIndex, { done: false })
                          : validateSet(exIndex, setIndex, ex.rest)
                      }
                      className={`w-full h-12 rounded-lg text-xl font-bold transition-colors active:scale-95 ${
                        set.done
                          ? 'bg-success text-white'
                          : 'bg-surface-2 text-muted active:bg-border'
                      }`}
                      aria-label={set.done ? 'Annuler la validation' : 'Valider la série'}
                    >
                      ✓
                    </button>
                  </div>

                  {/* Champs facultatifs : RPE (si activé) + commentaire */}
                  {showRpe && (
                    <div className="grid grid-cols-[18px_1fr] gap-2 items-center mt-1.5">
                      <span></span>
                      <input
                        type="number"
                        inputMode="numeric"
                        min={1}
                        max={10}
                        value={set.rpe ?? ''}
                        onChange={(e) =>
                          updateSet(exIndex, setIndex, {
                            rpe: e.target.value
                              ? parseInt(e.target.value)
                              : undefined,
                          })
                        }
                        placeholder="RPE (1-10)"
                        className="bg-surface-2 rounded-lg py-2 px-3 text-sm outline-none focus:ring-2 focus:ring-accent"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>

      {/* Bouton terminer (flottant au-dessus du chrono/nav) */}
      <div
        className="fixed inset-x-0 bottom-[64px] z-20 px-3"
        style={{
          paddingBottom: 'env(safe-area-inset-bottom)',
          // Caché quand le chrono est affiché pour éviter la superposition
          display: timer.running ? 'none' : 'block',
        }}
      >
        <div className="max-w-lg mx-auto">
          <Button
            variant="success"
            onClick={finishWorkout}
            disabled={validated === 0}
          >
            Terminer la séance ({validated}/{total})
          </Button>
        </div>
      </div>

      {/* Chrono de repos (s'affiche automatiquement quand il tourne) */}
      {timer.running && (
        <RestTimer
          secondsLeft={timer.secondsLeft}
          onAddTime={timer.addTime}
          onSkip={timer.stop}
        />
      )}
    </div>
  )
}
