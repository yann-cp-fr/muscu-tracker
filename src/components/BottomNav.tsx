// =============================================================
//  BottomNav — barre de navigation fixe en bas (style app mobile)
// =============================================================

import { NavLink } from 'react-router-dom'

const items = [
  { to: '/', label: 'Accueil', icon: '🏠' },
  { to: '/sessions', label: 'Séances', icon: '💪' },
  { to: '/history', label: 'Historique', icon: '📈' },
  { to: '/progress', label: 'Progrès', icon: '📊' },
  { to: '/settings', label: 'Réglages', icon: '⚙️' },
]

export function BottomNav() {
  return (
    <nav
      className="fixed bottom-0 inset-x-0 bg-surface/95 backdrop-blur border-t border-border z-40"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="flex justify-around max-w-lg mx-auto">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            // `end` sur l'accueil pour ne pas rester actif sur les autres routes
            end={item.to === '/'}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 py-2 px-3 flex-1 text-center transition-colors ${
                isActive ? 'text-accent' : 'text-muted'
              }`
            }
          >
            <span className="text-xl leading-none">{item.icon}</span>
            <span className="text-[10px] font-medium">{item.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
