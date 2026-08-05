// =============================================================
//  Page Séances — liste des séances du programme
// =============================================================

import { useNavigate } from 'react-router-dom'
import { useProgram } from '../hooks/useProgram'
import { PageHeader, Card } from '../components/ui'

export function Sessions() {
  const program = useProgram()
  const navigate = useNavigate()

  return (
    <div>
      <PageHeader title="Mes séances" subtitle={program.name} />
      <div className="space-y-3">
        {program.sessions.map((session) => (
          <button
            key={session.id}
            onClick={() => navigate(`/session/${session.id}`)}
            className="w-full text-left active:scale-[0.99] transition-transform"
          >
            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold">{session.name}</h2>
                  <p className="text-muted text-sm mt-0.5">
                    {session.exercises.length} exercices
                  </p>
                </div>
                <span className="text-muted text-xl">›</span>
              </div>
            </Card>
          </button>
        ))}
      </div>
    </div>
  )
}
