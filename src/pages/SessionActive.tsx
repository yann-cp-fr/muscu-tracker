// =============================================================
//  Page Séance active — LE cœur de l'application
// =============================================================
// Écran utilisé pendant l'entraînement, au téléphone, un poids en main.
// V4 — confort de saisie :
//   • boutons +/− (Stepper) pour ajuster sans clavier
//   • pré-remplissage : valider la série 1 recopie poids/reps sur les
//     séries suivantes non encore remplies
//   • rappel discret « la dernière fois : … » sous chaque exercice

import { useState, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useSession } from '../hooks/useProgram'
import { useWorkouts } from '../hooks/useWorkouts'
import { useLastPerformance } from '../hooks/useLastPerformance'
import { useTimer } from '../hooks/useTimer'
import { Card, Button } from '../components/ui'
import { CollapsibleTips } from '../components/CollapsibleTips'
import { RestTimer } from '../components/RestTimer'
import { Stepper } from '../components/Stepper'
import { makeId, formatShortDate } from '../utils/helpers'
import type { ExerciseLog, SetLog, WorkoutLog } from '../types'

// Incréments des raccourcis de saisie
const WEIGHT_STEP = 2.5
const REPS_STEP = 1

export function SessionActive() {
  const { sessionId } = useParams()
  const session = useSession(sessionId)
  const { workouts, addWorkout } = useWorkouts()
  const lastPerf = useLastPerformance(workouts)
  const navigate = useNavigate()
  const timer = useTimer()

  // État de saisie initialisé depuis le programme.
  // Le poids par défaut vient de la dernière perf connue si dispo, sinon
  // de la charge cible du programme.
  const [logs, setLogs] = useState<ExerciseLog[]>(() => {
    if (!session) return []
    return session.exercises.map((ex) => {
      const last = lastPerf.get(ex.id!)
      const defaultWeight = last?.sets[0]?.weight ?? ex.targetWeight ?? 0
      return {
        exerciseId: ex.id!,
        exerciseName: ex.name,
        muscleGroup: ex.muscleGroup,
        sets: Array.from({ length: ex.sets }, () => ({
          weight: defaultWeight,
          reps: 0,
          done: false,
        })) as SetLog[],
      }
    })
  })

  const [showRpe, setShowRpe] = useState(false)

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

  function updateSet(exIndex: number, setIndex: number, patch: Partial<SetLog>) {
    setLogs((prev) => {
      const next = structuredClone(prev)
      next[exIndex].sets[setIndex] = { ...next[exIndex].sets[setIndex], ...patch }
      return next
    })
  }

  // Valide une série → coche, PRÉ-REMPLIT les séries suivantes vides, lance le repos
  function validateSet(exIndex: number, setIndex: number, restSeconds: number) {
    setLogs((prev) => {
      const next = structuredClone(prev)
      const current = next[exIndex].sets[setIndex]
      current.done = true
      // Pré-remplissage : recopier poids/reps sur les séries suivantes
      // qui n'ont pas encore été remplies (reps encore à 0) ni validées.
      for (let i = setIndex + 1; i < next[exIndex].sets.length; i++) {
        const s = next[exIndex].sets[i]
        if (!s.done && s.reps === 0) {
          s.weight = current.weight
          s.reps = current.reps
        }
      }
      return next
    })
    timer.start(restSeconds)
  }

  function finishWorkout() {
    const workout: WorkoutLog = {
      id: makeId(),
      sessionName: session!.name,
      date: new Date().toISOString(),
      exercises: logs
        .map((ex) => ({ ...ex, sets: ex.sets.filter((s) => s.done) }))
        .filter((ex) => ex.sets.length > 0),
    }
    addWorkout(workout)
    timer.stop()
    navigate('/')
  }

  return (
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
              className="h-full bg-accent transition-all duration-500 ease-out"
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
        {session.exercises.map((ex, exIndex) => {
          const last = lastPerf.get(ex.id!)
          return (
            <Card key={ex.id}>
              <div className="flex items-baseline justify-between">
                <h2 className="text-lg font-bold">{ex.name}</h2>
                <span className="text-muted text-xs">{ex.muscleGroup}</span>
              </div>
              <p className="text-muted text-sm mt-0.5">
                {ex.sets} × {ex.reps}
                {ex.tempo ? ` · tempo ${ex.tempo}` : ''} · repos {ex.rest}s
              </p>

              {/* Rappel discret de la dernière fois */}
              {last && (
                <p className="text-xs text-accent/80 mt-1">
                  Dernière fois ({formatShortDate(last.date)}) :{' '}
                  {last.sets.map((s) => `${s.weight}×${s.reps}`).join(' · ')}
                </p>
              )}

              <CollapsibleTips tips={ex.tips} />

              {/* En-têtes de colonnes */}
              <div className="grid grid-cols-[18px_1fr_1fr_48px] gap-2 mt-4 mb-1 text-[11px] text-muted uppercase tracking-wide">
                <span></span>
                <span className="text-center">Poids</span>
                <span className="text-center">Reps</span>
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
                      <Stepper
                        value={set.weight}
                        step={WEIGHT_STEP}
                        onChange={(v) => updateSet(exIndex, setIndex, { weight: v })}
                        placeholder={String(ex.targetWeight ?? 0)}
                        dimmed={set.done}
                        aria-label="Poids en kg"
                      />
                      <Stepper
                        value={set.reps}
                        step={REPS_STEP}
                        onChange={(v) => updateSet(exIndex, setIndex, { reps: v })}
                        placeholder="0"
                        dimmed={set.done}
                        aria-label="Répétitions"
                      />
                      <button
                        onClick={() =>
                          set.done
                            ? updateSet(exIndex, setIndex, { done: false })
                            : validateSet(exIndex, setIndex, ex.rest)
                        }
                        className={`w-full h-12 rounded-lg text-xl font-bold transition-all active:scale-95 ${
                          set.done
                            ? 'bg-success text-white'
                            : 'bg-surface-2 text-muted active:bg-border'
                        }`}
                        aria-label={
                          set.done ? 'Annuler la validation' : 'Valider la série'
                        }
                      >
                        ✓
                      </button>
                    </div>

                    {/* RPE facultatif */}
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
                              rpe: e.target.value ? parseInt(e.target.value) : undefined,
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
          )
        })}
      </div>

      {/* Bouton terminer */}
      <div
        className="fixed inset-x-0 bottom-[64px] z-20 px-3"
        style={{
          paddingBottom: 'env(safe-area-inset-bottom)',
          display: timer.running ? 'none' : 'block',
        }}
      >
        <div className="max-w-lg mx-auto">
          <Button variant="success" onClick={finishWorkout} disabled={validated === 0}>
            Terminer la séance ({validated}/{total})
          </Button>
        </div>
      </div>

      {/* Chrono de repos */}
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
