// =============================================================
//  CollapsibleTips — conseils d'exécution repliables
// =============================================================

import { useState } from 'react'

export function CollapsibleTips({ tips }: { tips?: string[] }) {
  const [open, setOpen] = useState(false)

  if (!tips || tips.length === 0) return null

  return (
    <div className="mt-3">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 text-sm text-muted active:text-white"
      >
        <span
          className={`transition-transform text-xs ${open ? 'rotate-90' : ''}`}
        >
          ▶
        </span>
        Conseils d'exécution
      </button>
      {open && (
        <ul className="mt-2 space-y-1.5 pl-1">
          {tips.map((tip, i) => (
            <li key={i} className="text-sm text-white/80 flex gap-2">
              <span className="text-accent">•</span>
              <span>{tip}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
