// =============================================================
//  Audio — bips de fin de repos (Web Audio API, sans fichier son)
// =============================================================
// Les sons sont synthétisés à la volée : aucune dépendance, aucun
// fichier à héberger. Contrainte navigateur (surtout iOS) : le son est
// bloqué tant que l'utilisateur n'a pas interagi avec la page. On
// "débloque" donc l'AudioContext au premier geste (unlock), typiquement
// à la première validation de série.

let ctx: AudioContext | null = null

/** Crée (ou réutilise) l'AudioContext */
function getContext(): AudioContext | null {
  if (typeof window === 'undefined') return null
  if (!ctx) {
    const AC =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext
    if (!AC) return null
    ctx = new AC()
  }
  return ctx
}

/** À appeler lors d'une interaction utilisateur pour autoriser le son.
 *  Sans effet audible : réveille juste l'AudioContext s'il est suspendu. */
export function unlockAudio(): void {
  const c = getContext()
  if (c && c.state === 'suspended') {
    c.resume().catch(() => {})
  }
}

/** Joue un bip court. freq en Hz, durée en ms, volume 0-1. */
function beep(freq: number, durationMs: number, volume = 0.2): void {
  const c = getContext()
  if (!c) return
  if (c.state === 'suspended') c.resume().catch(() => {})

  const osc = c.createOscillator()
  const gain = c.createGain()
  osc.type = 'sine'
  osc.frequency.value = freq
  gain.gain.value = volume

  // Petite enveloppe pour éviter les "clics" au début/fin du son
  const now = c.currentTime
  const dur = durationMs / 1000
  gain.gain.setValueAtTime(0, now)
  gain.gain.linearRampToValueAtTime(volume, now + 0.01)
  gain.gain.linearRampToValueAtTime(0, now + dur)

  osc.connect(gain)
  gain.connect(c.destination)
  osc.start(now)
  osc.stop(now + dur)
}

/** Bip d'égrenage (T-3, T-2, T-1) : court et médium */
export function beepTick(): void {
  beep(880, 120)
}

/** Bip de fin (à 0) : plus long et plus aigu, pour marquer la reprise */
export function beepEnd(): void {
  beep(1320, 260, 0.25)
}
