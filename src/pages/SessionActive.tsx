// =============================================================
//  Page Séance active — LE cœur de l'application
// =============================================================
// V4.5 — confort avancé :
//   • bips de fin de repos (T-3/2/1 + fin), selon préférence son
//   • chrono fiable écran verrouillé (géré dans useTimer)
//   • écran maintenu allumé pendant la séance (Wake Lock)
//   • séance en cours sauvegardée → reprise après fermeture de l'app
//   • bouton "répéter la dernière série"
//   • réglage du temps de repos à la volée
//   • résumé de fin de séance avant enregistrement

import { useState, useMemo, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useSession } from '../hooks/useProgram'
import { useWorkouts } from '../hooks/useWorkouts'
import { useLastPerformance } from '../hooks/useLastPerformance'
import { useSettings } from '../hooks/useSettings'
import { useTimer } from '../hooks/useTimer'
import { useWakeLock } from '../hooks/useWakeLock'
import { Card, Button } from '../components/ui'
import { CollapsibleTips } from '../components/CollapsibleTips'
import { RestTimer } from '../components/RestTimer'
import { Stepper } from '../components/Stepper'
import { SessionSummary } from '../components/SessionSummary'
import { makeId, formatShortDate } from '../utils/helpers'
import { storage } from '../utils/storage'
import { unlockAudio, beepTick, beepEnd } from '../utils/audio'
import type { ExerciseLog, SetLog, WorkoutLog } from '../types'

const WEIGHT_STEP = 2.5
const REPS_STEP = 1

function buildInitialLogs(
  session: NonNullable<ReturnType<typeof useSession>>,
  lastPerf: Map<string, { sets: SetLog[] }>
): ExerciseLog[] {
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
}

export function SessionActive() {
  const { sessionId } = useParams()
  const session = useSession(sessionId)
  const { workouts, addWorkout } = useWorkouts()
  const lastPerf = useLastPerformance(workouts)
  const { settings } = useSettings()
  const navigate = useNavigate()

  // Bips branchés sur le chrono (respectent la préférence son)
  const handleTick3s = useCallback(() => {
    if (settings.soundEnabled) beepTick()
  }, [settings.soundEnabled])
  const handleEnd = useCallback(() => {
    if (settings.soundEnabled) beepEnd()
  }, [settings.soundEnabled])
  const timer = useTimer({ onTick3s: handleTick3s, onEnd: handleEnd })

  // Écran maintenu allumé pendant la séance (selon préférence)
  useWakeLock(settings.keepAwake)

  // --- Reprise d'une séance en cours ---
  // Au montage, on regarde s'il existe une séance en cours POUR cette séance.
  const [logs, setLogs] = useState<ExerciseLog[]>(() => {
    if (!session) return []
    const active = storage.getActiveSession()
    if (active && active.sessionId === session.id) {
      return active.logs
    }
    return buildInitialLogs(session, lastPerf)
  })
  // Bandeau "reprise" affiché si on a chargé une séance en cours non vide
  const [resumed, setResumed] = useState(() => {
    const active = storage.getActiveSession()
    return !!(
      active &&
      session &&
      active.sessionId === session.id &&
      active.logs.some((ex) => ex.sets.some((s) => s.done))
    )
  })

  const [showRpe, setShowRpe] = useState(false)
  const [showSummary, setShowSummary] = useState(false)

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

  // Sauvegarde automatique de la séance en cours à chaque changement,
  // tant qu'au moins une série est validée (sinon rien à reprendre).
  useEffect(() => {
    if (!session) return
    if (validated > 0) {
      storage.saveActiveSession({
        sessionId: session.id!,
        sessionName: session.name,
        startedAt: new Date().toISOString(),
        logs,
      })
    }
  }, [logs, validated, session])

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

  function validateSet(exIndex: number, setIndex: number, restSeconds: number) {
    unlockAudio() // 1re interaction → autorise le son pour la suite
    setLogs((prev) => {
      const next = structuredClone(prev)
      const current = next[exIndex].sets[setIndex]
      current.done = true
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

  /** Recopie poids+reps de la série précédente dans une série donnée */
  function repeatPrevious(exIndex: number, setIndex: number) {
    if (setIndex === 0) return
    setLogs((prev) => {
      const next = structuredClone(prev)
      const p = next[exIndex].sets[setIndex - 1]
      next[exIndex].sets[setIndex] = {
        ...next[exIndex].sets[setIndex],
        weight: p.weight,
        reps: p.reps,
      }
      return next
    })
  }

  function restartSession() {
    setLogs(buildInitialLogs(session!, lastPerf))
    setResumed(false)
    storage.clearActiveSession()
    timer.stop()
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
    storage.clearActiveSession() // la séance en cours est consommée
    timer.stop()
    navigate('/')
  }

  // Dernière séance du même nom, pour la comparaison de volume du résumé
  const previousSameSession =
    [...workouts]
      .filter((w) => w.sessionName === session.name)
      .sort((a, b) => b.date.localeCompare(a.date))[0] ?? null

  return (
    <div className="pb-40">
      {/* Bandeau de reprise de séance */}
      {resumed && (
        <div className="mb-3 bg-accent-dim border border-accent rounded-xl p-3">
          <p className="text-sm mb-2">Séance en cours reprise là où tu t'étais arrêté.</p>
          <button
            onClick={restartSession}
            className="text-accent text-sm font-semibold active:text-white"
          >
            Recommencer à zéro
          </button>
        </div>
      )}

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

              {last && (
                <p className="text-xs text-accent/80 mt-1">
                  Dernière fois ({formatShortDate(last.date)}) :{' '}
                  {last.sets.map((s) => `${s.weight}×${s.reps}`).join(' · ')}
                </p>
              )}

              <CollapsibleTips tips={ex.tips} />

              <div className="grid grid-cols-[18px_1fr_1fr_48px] gap-2 mt-4 mb-1 text-[11px] text-muted uppercase tracking-wide">
                <span></span>
                <span className="text-center">Poids</span>
                <span className="text-center">Reps</span>
                <span className="text-center">OK</span>
              </div>

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

                    {/* Bouton "répéter la série précédente" (dès la 2e série, non validée) */}
                    {setIndex > 0 && !set.done && (
                      <button
                        onClick={() => repeatPrevious(exIndex, setIndex)}
                        className="text-xs text-muted active:text-white mt-1 ml-[26px]"
                      >
                        ↩ répéter la série précédente
                      </button>
                    )}

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

      {/* Bouton terminer → ouvre le résumé */}
      <div
        className="fixed inset-x-0 bottom-[64px] z-20 px-3"
        style={{
          paddingBottom: 'env(safe-area-inset-bottom)',
          display: timer.running ? 'none' : 'block',
        }}
      >
        <div className="max-w-lg mx-auto">
          <Button
            variant="success"
            onClick={() => setShowSummary(true)}
            disabled={validated === 0}
          >
            Terminer la séance ({validated}/{total})
          </Button>
        </div>
      </div>

      {/* Chrono de repos (avec réglage à la volée via +/-15s) */}
      {timer.running && (
        <RestTimer
          secondsLeft={timer.secondsLeft}
          onAddTime={timer.addTime}
          onSkip={timer.stop}
        />
      )}

      {/* Résumé de fin de séance */}
      {showSummary && (
        <SessionSummary
          sessionName={session.name}
          exercises={logs}
          previousSameSession={previousSameSession}
          onConfirm={finishWorkout}
          onCancel={() => setShowSummary(false)}
        />
      )}
    </div>
  )
}
