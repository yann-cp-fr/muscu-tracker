// =============================================================
//  useTimer — chrono de repos basé sur l'horloge réelle
// =============================================================
// V4.5 : le temps restant est calculé à partir d'un instant-cible
// (Date.now() + durée), et non par un compteur qui décrémente. Deux
// bénéfices majeurs :
//   • pas de dérive : même si le navigateur ralentit les timers en
//     arrière-plan (écran verrouillé), au retour le temps affiché est
//     JUSTE car recalculé depuis l'horloge.
//   • les bips se déclenchent aux bons instants (T-3, T-2, T-1, fin).
//
// Le tick reste à ~250ms pour un affichage fluide, mais il ne sert
// qu'à rafraîchir : la vérité, c'est l'instant-cible.

import { useState, useRef, useCallback, useEffect } from 'react'

interface TimerCallbacks {
  /** appelé à T-3, T-2 et T-1 secondes */
  onTick3s?: () => void
  /** appelé quand le repos atteint 0 */
  onEnd?: () => void
}

export function useTimer(callbacks: TimerCallbacks = {}) {
  const [secondsLeft, setSecondsLeft] = useState(0)
  const [running, setRunning] = useState(false)

  const targetRef = useRef<number | null>(null) // instant de fin (ms epoch)
  const rafRef = useRef<number | null>(null)
  // Mémorise le dernier "seuil de bip" déclenché pour ne pas répéter
  const lastBeepSecondRef = useRef<number | null>(null)
  const cbRef = useRef(callbacks)
  cbRef.current = callbacks // toujours à jour sans relancer le timer

  const clearLoop = useCallback(() => {
    if (rafRef.current !== null) {
      clearInterval(rafRef.current)
      rafRef.current = null
    }
  }, [])

  const stop = useCallback(() => {
    clearLoop()
    targetRef.current = null
    lastBeepSecondRef.current = null
    setRunning(false)
    setSecondsLeft(0)
  }, [clearLoop])

  /** Boucle de rafraîchissement : recalcule le restant depuis l'horloge */
  const tick = useCallback(() => {
    if (targetRef.current === null) return
    const msLeft = targetRef.current - Date.now()
    const secLeft = Math.max(0, Math.ceil(msLeft / 1000))

    setSecondsLeft(secLeft)

    // Bips à 3, 2, 1 (une seule fois par palier)
    if (secLeft <= 3 && secLeft >= 1 && lastBeepSecondRef.current !== secLeft) {
      lastBeepSecondRef.current = secLeft
      cbRef.current.onTick3s?.()
    }

    if (msLeft <= 0) {
      clearLoop()
      targetRef.current = null
      lastBeepSecondRef.current = null
      setRunning(false)
      setSecondsLeft(0)
      cbRef.current.onEnd?.()
    }
  }, [clearLoop])

  const start = useCallback(
    (seconds: number) => {
      clearLoop()
      targetRef.current = Date.now() + seconds * 1000
      lastBeepSecondRef.current = null
      setSecondsLeft(seconds)
      setRunning(true)
      rafRef.current = window.setInterval(tick, 250)
    },
    [clearLoop, tick]
  )

  /** Ajoute du temps (bouton +15s) en repoussant l'instant-cible */
  const addTime = useCallback((seconds: number) => {
    if (targetRef.current !== null) {
      targetRef.current += seconds * 1000
      setSecondsLeft((prev) => prev + seconds)
    }
  }, [])

  // Quand l'app revient au premier plan (déverrouillage), on recalcule
  // immédiatement pour rattraper le temps écoulé en arrière-plan.
  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === 'visible' && targetRef.current !== null) {
        tick()
      }
    }
    document.addEventListener('visibilitychange', onVisible)
    return () => document.removeEventListener('visibilitychange', onVisible)
  }, [tick])

  // Nettoyage au démontage
  useEffect(() => clearLoop, [clearLoop])

  return { secondsLeft, running, start, stop, addTime }
}
