// =============================================================
//  App — routing + layout général
// =============================================================
// HashRouter (URLs en /#/...) : le plus robuste pour GitHub Pages.
// V4 : la page Progression (qui embarque Recharts, la plus lourde
// dépendance) est chargée À LA DEMANDE via React.lazy. L'app démarre
// donc plus vite ; Recharts n'est téléchargé que si tu ouvres Progression.

import { Suspense, lazy } from 'react'
import { HashRouter, Routes, Route } from 'react-router-dom'
import { BottomNav } from './components/BottomNav'
import { OfflineBar } from './components/OfflineBar'
import { UpdatePrompt } from './components/UpdatePrompt'
import { Dashboard } from './pages/Dashboard'
import { Sessions } from './pages/Sessions'
import { SessionActive } from './pages/SessionActive'
import { History } from './pages/History'
import { WorkoutDetail } from './pages/WorkoutDetail'
import { Settings } from './pages/Settings'

// Chargée à la demande (code-splitting)
const Progress = lazy(() =>
  import('./pages/Progress').then((m) => ({ default: m.Progress }))
)

/** Petit indicateur de chargement pour la page lazy */
function PageLoader() {
  return (
    <div className="flex justify-center py-20 text-muted text-sm">Chargement…</div>
  )
}

export default function App() {
  return (
    <HashRouter>
      <OfflineBar />
      <main className="max-w-lg mx-auto px-4 pt-4 pb-24 min-h-screen overflow-x-hidden">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/sessions" element={<Sessions />} />
          <Route path="/session/:sessionId" element={<SessionActive />} />
          <Route path="/history" element={<History />} />
          <Route path="/history/:workoutId" element={<WorkoutDetail />} />
          <Route
            path="/progress"
            element={
              <Suspense fallback={<PageLoader />}>
                <Progress />
              </Suspense>
            }
          />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </main>
      <BottomNav />
      <UpdatePrompt />
    </HashRouter>
  )
}
