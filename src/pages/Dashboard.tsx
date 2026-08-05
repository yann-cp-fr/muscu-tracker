// =============================================================
//  Page Tableau de bord (V1 — version de base)
// =============================================================
// En V1, on affiche : la prochaine séance suggérée, le nombre de
// séances effectuées, et les derniers exercices réalisés.
// Les records viendront en V3 avec la page Progression.

import { useNavigate } from 'react-router-dom'
import { useProgram } from '../hooks/useProgram'
import { useWorkouts } from '../hooks/useWorkouts'
import { PageHeader, Card, Button } from '../components/ui'
import { formatLongDate } from '../utils/helpers'

export function Dashboard() {
  const program = useProgram()
  const { workouts } = useWorkouts()
  const navigate = useNavigate()

  // Prochaine séance = on alterne simplement A/B selon la dernière faite
  const last = workouts[workouts.length - 1]
  const sessions = program.sessions
  let nextSession = sessions[0]
  if (last) {
    const lastIndex = sessions.findIndex((s) => s.name === last.sessionName)
    nextSession = sessions[(lastIndex + 1) % sessions.length]
  }

  const lastThree = [...workouts].reverse().slice(0, 3)

  return (
    <div>
      <PageHeader title="Tableau de bord" />

      {/* Prochaine séance */}
      <Card className="mb-4">
        <div className="text-xs text-muted font-medium uppercase tracking-wide">
          Prochaine séance
        </div>
        <div className="text-2xl font-bold mt-1 mb-3">{nextSession.name}</div>
        <Button onClick={() => navigate(`/session/${nextSession.id}`)}>
          Démarrer la séance
        </Button>
      </Card>

      {/* Statistiques simples */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <Card>
          <div className="text-3xl font-bold">{workouts.length}</div>
          <div className="text-muted text-sm mt-1">Séances effectuées</div>
        </Card>
        <Card>
          <div className="text-3xl font-bold">{program.sessions.length}</div>
          <div className="text-muted text-sm mt-1">Séances au programme</div>
        </Card>
      </div>

      {/* Derniers exercices réalisés */}
      <h2 className="text-lg font-bold mb-2 mt-6">Dernières séances</h2>
      {lastThree.length === 0 ? (
        <Card>
          <p className="text-muted text-sm">
            Aucune séance enregistrée pour l'instant. Lance ta première séance
            ci-dessus 💪
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {lastThree.map((w) => (
            <Card key={w.id}>
              <div className="flex justify-between items-baseline">
                <span className="font-semibold">{w.sessionName}</span>
                <span className="text-muted text-sm">
                  {formatLongDate(w.date)}
                </span>
              </div>
              <p className="text-muted text-sm mt-1">
                {w.exercises.length} exercices
              </p>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
