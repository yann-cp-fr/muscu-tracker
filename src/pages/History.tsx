// =============================================================
//  Page Historique — deux vues : par séance / par exercice
// =============================================================

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useWorkouts } from '../hooks/useWorkouts'
import { useExerciseHistory } from '../hooks/useExerciseHistory'
import { PageHeader, Card } from '../components/ui'
import { formatLongDate, formatShortDate } from '../utils/helpers'

type Tab = 'sessions' | 'exercises'

export function History() {
  const { workouts } = useWorkouts()
  const exerciseHistory = useExerciseHistory(workouts)
  const navigate = useNavigate()
  const [tab, setTab] = useState<Tab>('sessions')

  // Séances de la plus récente à la plus ancienne
  const recentFirst = [...workouts].sort((a, b) => b.date.localeCompare(a.date))

  return (
    <div>
      <PageHeader title="Historique" subtitle="Tes performances passées" />

      {/* Sélecteur d'onglet */}
      <div className="flex bg-surface-2 rounded-xl p-1 mb-4">
        <TabButton active={tab === 'sessions'} onClick={() => setTab('sessions')}>
          Par séance
        </TabButton>
        <TabButton active={tab === 'exercises'} onClick={() => setTab('exercises')}>
          Par exercice
        </TabButton>
      </div>

      {workouts.length === 0 ? (
        <Card>
          <p className="text-muted text-sm">
            Aucune séance enregistrée pour l'instant. Termine une séance et elle
            apparaîtra ici.
          </p>
        </Card>
      ) : tab === 'sessions' ? (
        // ---- Vue par séance ----
        <div className="space-y-3">
          {recentFirst.map((w) => {
            const totalSets = w.exercises.reduce((n, ex) => n + ex.sets.length, 0)
            return (
              <button
                key={w.id}
                onClick={() => navigate(`/history/${w.id}`)}
                className="w-full text-left active:scale-[0.99] transition-transform"
              >
                <Card>
                  <div className="flex justify-between items-baseline">
                    <span className="font-bold">{w.sessionName}</span>
                    <span className="text-muted text-sm">
                      {formatLongDate(w.date)}
                    </span>
                  </div>
                  <p className="text-muted text-sm mt-1">
                    {w.exercises.length} exercices · {totalSets} séries
                  </p>
                </Card>
              </button>
            )
          })}
        </div>
      ) : (
        // ---- Vue par exercice ----
        <div className="space-y-4">
          {exerciseHistory.map((ex) => (
            <Card key={ex.exerciseId}>
              <div className="flex items-baseline justify-between mb-2">
                <h2 className="font-bold">{ex.exerciseName}</h2>
                <span className="text-muted text-xs">{ex.muscleGroup}</span>
              </div>
              <div className="space-y-2">
                {[...ex.occurrences].reverse().map((occ, i) => (
                  <div key={i} className="flex gap-3 text-sm">
                    <span className="text-muted w-12 shrink-0">
                      {formatShortDate(occ.date)}
                    </span>
                    <span className="text-white/90">
                      {occ.sets
                        .map((s) => `${s.weight}kg×${s.reps}`)
                        .join('  ·  ')}
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-colors ${
        active ? 'bg-accent text-white' : 'text-muted'
      }`}
    >
      {children}
    </button>
  )
}
