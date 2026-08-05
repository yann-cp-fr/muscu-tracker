// =============================================================
//  Pages Historique / Progression / Réglages — placeholders V1
// =============================================================
// Ces écrans seront enrichis dans les versions suivantes :
//   - Historique  → V2
//   - Progression → V3
//   - Réglages (export/import) → V2
// On les affiche déjà pour que la navigation soit complète dès la V1.

import { PageHeader, Card } from '../components/ui'

function ComingSoon({ version }: { version: string }) {
  return (
    <Card>
      <p className="text-muted text-sm">
        Cette section arrive dans la <span className="text-white font-semibold">{version}</span>.
      </p>
    </Card>
  )
}

export function History() {
  return (
    <div>
      <PageHeader title="Historique" subtitle="Tes performances passées" />
      <ComingSoon version="Version 2" />
    </div>
  )
}

export function Progress() {
  return (
    <div>
      <PageHeader title="Progression" subtitle="Graphiques et records" />
      <ComingSoon version="Version 3" />
    </div>
  )
}

export function Settings() {
  return (
    <div>
      <PageHeader title="Réglages" subtitle="Sauvegarde et options" />
      <ComingSoon version="Version 2 (export / import JSON)" />
    </div>
  )
}
