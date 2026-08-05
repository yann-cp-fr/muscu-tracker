// =============================================================
//  Page Progression — placeholder (construite en V3)
// =============================================================

import { PageHeader, Card } from '../components/ui'

export function Progress() {
  return (
    <div>
      <PageHeader title="Progression" subtitle="Graphiques et records" />
      <Card>
        <p className="text-muted text-sm">
          Cette section arrive dans la{' '}
          <span className="text-white font-semibold">Version 3</span> : graphiques
          d'évolution, records personnels et volume hebdomadaire.
        </p>
      </Card>
    </div>
  )
}
