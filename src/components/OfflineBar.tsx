// =============================================================
//  OfflineBar — indicateur discret "hors ligne"
// =============================================================
// S'affiche seulement quand le navigateur signale l'absence de réseau.
// Rassure l'utilisateur : l'app fonctionne hors ligne, c'est normal.

import { useState, useEffect } from 'react'

export function OfflineBar() {
  const [offline, setOffline] = useState(!navigator.onLine)

  useEffect(() => {
    const goOnline = () => setOffline(false)
    const goOffline = () => setOffline(true)
    window.addEventListener('online', goOnline)
    window.addEventListener('offline', goOffline)
    return () => {
      window.removeEventListener('online', goOnline)
      window.removeEventListener('offline', goOffline)
    }
  }, [])

  if (!offline) return null

  return (
    <div
      className="bg-surface-2 text-muted text-xs text-center py-1.5 border-b border-border"
      style={{ paddingTop: 'max(6px, env(safe-area-inset-top))' }}
    >
      Hors ligne · tes données restent enregistrées sur l'appareil
    </div>
  )
}
