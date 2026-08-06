// =============================================================
//  Composants graphiques réutilisables (Recharts)
// =============================================================
// Enveloppes minces autour de Recharts, avec le style sombre de l'app.
// On garde une API simple : un tableau de points { label, value }.

import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts'

export interface ChartPoint {
  label: string
  value: number
}

const AXIS = { fontSize: 11, fill: '#8e8e93' }
const GRID = '#323236'

/** Formate les grands nombres de façon compacte pour l'axe Y (6000 → "6k") */
function compactNumber(n: number): string {
  if (Math.abs(n) >= 1000) {
    const k = n / 1000
    return `${k % 1 === 0 ? k : k.toFixed(1)}k`
  }
  return String(n)
}

/** Tooltip sombre cohérent avec le thème */
function DarkTooltip({ active, payload, label, unit }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-surface-2 border border-border rounded-lg px-3 py-2 text-xs">
      <div className="text-muted">{label}</div>
      <div className="font-bold text-white">
        {payload[0].value}
        {unit ? ` ${unit}` : ''}
      </div>
    </div>
  )
}

/** Courbe simple (évolution dans le temps) */
export function LineChartCard({
  data,
  color = '#3b82f6',
  unit,
}: {
  data: ChartPoint[]
  color?: string
  unit?: string
}) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={GRID} vertical={false} />
        <XAxis dataKey="label" tick={AXIS} axisLine={{ stroke: GRID }} tickLine={false} />
        <YAxis tick={AXIS} axisLine={false} tickLine={false} width={40} tickFormatter={compactNumber} />
        <Tooltip content={<DarkTooltip unit={unit} />} cursor={{ stroke: GRID }} />
        <Line
          type="monotone"
          dataKey="value"
          stroke={color}
          strokeWidth={2.5}
          dot={{ r: 3, fill: color }}
          activeDot={{ r: 5 }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}

/** Histogramme (volume hebdo, répartition par muscle) */
export function BarChartCard({
  data,
  color = '#3b82f6',
  unit,
  horizontal = false,
}: {
  data: ChartPoint[]
  color?: string
  unit?: string
  horizontal?: boolean
}) {
  return (
    <ResponsiveContainer width="100%" height={Math.max(200, horizontal ? data.length * 36 + 20 : 200)}>
      <BarChart
        data={data}
        layout={horizontal ? 'vertical' : 'horizontal'}
        margin={{ top: 8, right: 8, left: horizontal ? 8 : -16, bottom: 0 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke={GRID} vertical={!horizontal} horizontal={horizontal} />
        {horizontal ? (
          <>
            <XAxis type="number" tick={AXIS} axisLine={false} tickLine={false} tickFormatter={compactNumber} />
            <YAxis
              type="category"
              dataKey="label"
              tick={AXIS}
              axisLine={false}
              tickLine={false}
              width={110}
            />
          </>
        ) : (
          <>
            <XAxis dataKey="label" tick={AXIS} axisLine={{ stroke: GRID }} tickLine={false} />
            <YAxis tick={AXIS} axisLine={false} tickLine={false} width={40} tickFormatter={compactNumber} />
          </>
        )}
        <Tooltip content={<DarkTooltip unit={unit} />} cursor={{ fill: '#ffffff10' }} />
        <Bar dataKey="value" fill={color} radius={horizontal ? [0, 4, 4, 0] : [4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
