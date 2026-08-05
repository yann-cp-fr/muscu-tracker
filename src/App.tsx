// =============================================================
//  App — routing + layout général
// =============================================================
// On utilise HashRouter (URLs en /#/...) : c'est le choix le plus
// robuste pour GitHub Pages, car il évite les erreurs 404 au
// rechargement d'une page (pas besoin de config serveur).

import { HashRouter, Routes, Route } from 'react-router-dom'
import { BottomNav } from './components/BottomNav'
import { Dashboard } from './pages/Dashboard'
import { Sessions } from './pages/Sessions'
import { SessionActive } from './pages/SessionActive'
import { History, Progress, Settings } from './pages/Placeholders'

export default function App() {
  return (
    <HashRouter>
      {/* Contenu : centré, largeur mobile, marge basse pour la nav */}
      <main className="max-w-lg mx-auto px-4 pt-4 pb-24 min-h-screen overflow-x-hidden">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/sessions" element={<Sessions />} />
          <Route path="/session/:sessionId" element={<SessionActive />} />
          <Route path="/history" element={<History />} />
          <Route path="/progress" element={<Progress />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </main>
      <BottomNav />
    </HashRouter>
  )
}
