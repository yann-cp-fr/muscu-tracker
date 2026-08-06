// =============================================================
//  useWakeLock — empêche la mise en veille de l'écran
// =============================================================
// Utilise l'API Screen Wake Lock (supportée sur Android/Chrome et iOS
// Safari récent). Réacquiert le verrou automatiquement quand l'app
// revient au premier plan (le verrou est perdu en arrière-plan).
// Dégradation silencieuse si l'API n'existe pas.

import { useEffect, useRef } from 'react'

export function useWakeLock(enabled: boolean): void {
  const lockRef = useRef<WakeLockSentinel | null>(null)

  useEffect(() => {
    if (!enabled) return
    // API non disponible → on ne fait rien (pas d'erreur)
    if (!('wakeLock' in navigator)) return

    let cancelled = false

    const acquire = async () => {
      try {
        lockRef.current = await navigator.wakeLock.request('screen')
      } catch {
        // Refus (batterie faible, etc.) : sans conséquence
      }
    }

    const onVisible = () => {
      if (document.visibilityState === 'visible' && !cancelled) acquire()
    }

    acquire()
    document.addEventListener('visibilitychange', onVisible)

    return () => {
      cancelled = true
      document.removeEventListener('visibilitychange', onVisible)
      lockRef.current?.release().catch(() => {})
      lockRef.current = null
    }
  }, [enabled])
}
