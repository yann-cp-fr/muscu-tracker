// =============================================================
//  useSettings — préférences utilisateur (son, écran allumé)
// =============================================================

import { useState, useCallback } from 'react'
import type { AppSettings } from '../types'
import { storage } from '../utils/storage'

export function useSettings() {
  const [settings, setSettings] = useState<AppSettings>(() => storage.getSettings())

  const update = useCallback((patch: Partial<AppSettings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...patch }
      storage.saveSettings(next)
      return next
    })
  }, [])

  return { settings, update }
}
