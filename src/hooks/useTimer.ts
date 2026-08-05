// =============================================================
//  useTimer — chronomètre de repos (compte à rebours)
// =============================================================

import { useState, useRef, useCallback, useEffect } from 'react'

export function useTimer() {
  const [secondsLeft, setSecondsLeft] = useState(0)
  const [running, setRunning] = useState(false)
  const intervalRef = useRef<number | null>(null)

  const clear = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  /** Démarre (ou redémarre) le compte à rebours pour `seconds` secondes */
  const start = useCallback(
    (seconds: number) => {
      clear()
      setSecondsLeft(seconds)
      setRunning(true)
      intervalRef.current = window.setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            clear()
            setRunning(false)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    },
    [clear]
  )

  /** Arrête et remet à zéro */
  const stop = useCallback(() => {
    clear()
    setRunning(false)
    setSecondsLeft(0)
  }, [clear])

  /** Ajoute du temps (ex bouton +15s) */
  const addTime = useCallback((seconds: number) => {
    setSecondsLeft((prev) => prev + seconds)
  }, [])

  // Nettoyage si le composant est démonté pendant que le timer tourne
  useEffect(() => clear, [clear])

  return { secondsLeft, running, start, stop, addTime }
}
