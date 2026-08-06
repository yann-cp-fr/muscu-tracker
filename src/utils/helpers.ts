// =============================================================
//  FONCTIONS UTILITAIRES — petites aides sans état
// =============================================================

/** Génère un identifiant unique simple (suffisant pour un usage local) */
export function makeId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

/** Transforme un nom en identifiant stable (ex "Développé incliné" → "developpe-incline")
 *  Utilisé quand un exercice n'a pas d'id explicite dans program.json.
 *  Ainsi l'historique reste relié au bon exercice même sans id manuel. */
export function slugify(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // retire les accents
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

/** Formate une date ISO en "05/08" (jour/mois) pour l'historique */
export function formatShortDate(iso: string): string {
  const d = new Date(iso)
  const day = String(d.getDate()).padStart(2, '0')
  const month = String(d.getMonth() + 1).padStart(2, '0')
  return `${day}/${month}`
}

/** Formate une date ISO en "5 août 2026" pour l'affichage long */
export function formatLongDate(iso: string): string {
  return new Date(iso).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

/** Formate un nombre de secondes en "1:30" */
export function formatTime(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60)
  const s = totalSeconds % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

/** Renvoie le lundi (début de semaine ISO) de la date donnée, à minuit.
 *  Sert à regrouper les séances par semaine pour le volume hebdomadaire. */
export function startOfWeek(iso: string): Date {
  const d = new Date(iso)
  d.setHours(0, 0, 0, 0)
  // getDay() : 0 = dimanche, 1 = lundi… On ramène au lundi.
  const day = (d.getDay() + 6) % 7 // 0 = lundi
  d.setDate(d.getDate() - day)
  return d
}

/** Clé de semaine stable (AAAA-MM-JJ du lundi), pour regrouper */
export function weekKey(iso: string): string {
  return startOfWeek(iso).toISOString().slice(0, 10)
}

/** Libellé court de semaine pour l'axe des graphiques (ex "5 août") */
export function weekLabel(weekStartIso: string): string {
  return new Date(weekStartIso).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
  })
}
