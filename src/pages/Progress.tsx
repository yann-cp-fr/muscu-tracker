// =============================================================
//  Page Progression — records, volume, progression par exercice
// =============================================================
// Structure en 3 blocs, du plus motivant au plus détaillé :
//   1. Records personnels (charge max + meilleure séance)
//   2. Volume hebdomadaire (courbe) + répartition par muscle (barres)
//   3. Sélecteur d'exercice → 3 courbes (charge, volume, reps)
//
// Garde-fous : avec trop peu de données, on affiche un message clair
// au lieu d'un graphique vide ou trompeur.

import { useState } from 'react'
import { useWorkouts } from '../hooks/useWorkouts'
import { useStats } from '../hooks/useStats'
import { PageHeader, Card } from '../components/ui'
import { LineChartCard, BarChartCard } from '../components/Charts'
import { formatShortDate, formatLongDate } from '../utils/helpers'

export function Progress() {
  const { workouts } = useWorkouts()
  const stats = useStats(workouts)

  // Exercice sélectionné pour le bloc 3 (par défaut le premier disponible)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const selected =
    stats.byExercise.find((e) => e.exerciseId === selectedId) ??
    stats.byExercise[0] ??
    null

  // État initial : aucune donnée
  if (workouts.length === 0) {
    return (
      <div>
        <PageHeader title="Progression" subtitle="Graphiques et records" />
        <Card>
          <p className="text-muted text-sm">
            Termine quelques séances et tu verras ici l'évolution de tes charges, de
            ton volume et tes records. 📈
          </p>
        </Card>
      </div>
    )
  }

  return (
    <div>
      <PageHeader title="Progression" subtitle="Graphiques et records" />

      {/* ---------- BLOC 1 : Records ---------- */}
      <h2 className="text-sm font-bold text-muted uppercase tracking-wide mb-2">
        Records
      </h2>

      {stats.bestSessionVolume && (
        <Card className="mb-3">
          <div className="text-xs text-muted uppercase tracking-wide">
            Meilleure séance (volume)
          </div>
          <div className="text-2xl font-bold mt-1">
            {stats.bestSessionVolume.volume.toLocaleString('fr-FR')} kg
          </div>
          <div className="text-muted text-sm mt-0.5">
            {stats.bestSessionVolume.sessionName} ·{' '}
            {formatLongDate(stats.bestSessionVolume.date)}
          </div>
        </Card>
      )}

      {stats.records.length > 0 ? (
        <div className="space-y-2 mb-6">
          {stats.records.slice(0, 6).map((pr) => (
            <Card key={pr.exerciseId} className="flex items-center justify-between">
              <div className="min-w-0">
                <div className="font-semibold truncate">{pr.exerciseName}</div>
                <div className="text-muted text-xs">
                  {formatShortDate(pr.date)} · {pr.repsAtMax} reps
                </div>
              </div>
              <div className="text-xl font-bold shrink-0 ml-3">{pr.maxWeight} kg</div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="mb-6">
          <p className="text-muted text-sm">
            Les records de charge apparaîtront dès que tu auras saisi des poids.
          </p>
        </Card>
      )}

      {/* ---------- BLOC 2 : Volume ---------- */}
      <h2 className="text-sm font-bold text-muted uppercase tracking-wide mb-2">
        Volume hebdomadaire
      </h2>
      <Card className="mb-6">
        {stats.weeklyVolume.length >= 2 ? (
          <>
            <p className="text-muted text-xs mb-2">
              Volume total (poids × reps) par semaine, en kg.
            </p>
            <LineChartCard
              data={stats.weeklyVolume.map((w) => ({ label: w.label, value: w.volume }))}
              unit="kg"
            />
          </>
        ) : (
          <p className="text-muted text-sm">
            Il faut au moins deux semaines d'entraînement pour tracer la courbe de
            volume. Continue, ça arrive vite !
          </p>
        )}
      </Card>

      {/* Répartition par muscle */}
      <h2 className="text-sm font-bold text-muted uppercase tracking-wide mb-2">
        Répartition par muscle
      </h2>
      <Card className="mb-6">
        {stats.muscleVolume.length > 0 ? (
          <>
            <p className="text-muted text-xs mb-2">
              Volume cumulé par groupe musculaire (tout l'historique).
            </p>
            <BarChartCard
              data={stats.muscleVolume.map((m) => ({
                label: m.muscleGroup,
                value: m.volume,
              }))}
              unit="kg"
              horizontal
            />
          </>
        ) : (
          <p className="text-muted text-sm">Pas encore de volume à afficher.</p>
        )}
      </Card>

      {/* ---------- BLOC 3 : Progression par exercice ---------- */}
      <h2 className="text-sm font-bold text-muted uppercase tracking-wide mb-2">
        Progression par exercice
      </h2>
      {selected ? (
        <Card>
          {/* Sélecteur d'exercice */}
          <select
            value={selected.exerciseId}
            onChange={(e) => setSelectedId(e.target.value)}
            className="w-full bg-surface-2 rounded-lg py-3 px-3 mb-4 outline-none focus:ring-2 focus:ring-accent font-semibold"
          >
            {stats.byExercise.map((ex) => (
              <option key={ex.exerciseId} value={ex.exerciseId}>
                {ex.exerciseName}
              </option>
            ))}
          </select>

          {selected.points.length >= 2 ? (
            <div className="space-y-6">
              <ChartBlock
                title="Charge max"
                data={selected.points.map((p) => ({
                  label: formatShortDate(p.date),
                  value: p.maxWeight,
                }))}
                color="#3b82f6"
                unit="kg"
              />
              <ChartBlock
                title="Volume"
                data={selected.points.map((p) => ({
                  label: formatShortDate(p.date),
                  value: p.volume,
                }))}
                color="#22c55e"
                unit="kg"
              />
              <ChartBlock
                title="Répétitions totales"
                data={selected.points.map((p) => ({
                  label: formatShortDate(p.date),
                  value: p.totalReps,
                }))}
                color="#f59e0b"
              />
            </div>
          ) : (
            <p className="text-muted text-sm">
              Cet exercice n'a été réalisé qu'une fois. Refais-le pour voir sa
              progression.
            </p>
          )}
        </Card>
      ) : (
        <Card>
          <p className="text-muted text-sm">
            Aucun exercice avec charge à afficher pour l'instant.
          </p>
        </Card>
      )}
    </div>
  )
}

/** Un petit bloc titre + graphique, réutilisé pour les 3 courbes d'exercice */
function ChartBlock({
  title,
  data,
  color,
  unit,
}: {
  title: string
  data: { label: string; value: number }[]
  color: string
  unit?: string
}) {
  return (
    <div>
      <h3 className="text-sm font-semibold mb-1">{title}</h3>
      <LineChartCard data={data} color={color} unit={unit} />
    </div>
  )
}
