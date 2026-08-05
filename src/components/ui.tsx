// =============================================================
//  Composants UI de base réutilisables
// =============================================================
// Petites briques neutres réutilisées dans toutes les pages.
// Garder ces éléments ici évite de dupliquer les styles.

import type { ReactNode, ButtonHTMLAttributes } from 'react'

/** Carte au style sombre arrondi */
export function Card({
  children,
  className = '',
}: {
  children: ReactNode
  className?: string
}) {
  return <div className={`card p-4 ${className}`}>{children}</div>
}

/** En-tête de page cohérent (titre + sous-titre optionnel) */
export function PageHeader({
  title,
  subtitle,
}: {
  title: string
  subtitle?: string
}) {
  return (
    <header className="mb-5">
      <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
      {subtitle && <p className="text-muted text-sm mt-1">{subtitle}</p>}
    </header>
  )
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost' | 'success'
}

/** Bouton large, pensé pour les doigts en salle */
export function Button({
  children,
  variant = 'primary',
  className = '',
  ...props
}: ButtonProps) {
  const base =
    'w-full rounded-xl font-semibold text-base py-4 px-4 transition-colors active:scale-[0.98] disabled:opacity-40 disabled:active:scale-100'
  const variants: Record<string, string> = {
    primary: 'bg-accent text-white active:bg-blue-600',
    secondary: 'bg-surface-2 text-white active:bg-border',
    ghost: 'bg-transparent text-muted active:bg-surface',
    success: 'bg-success text-white active:bg-green-600',
  }
  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  )
}
