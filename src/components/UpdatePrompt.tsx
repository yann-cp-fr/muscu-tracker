// =============================================================
//  UpdatePrompt — bannière "mise à jour disponible"
// =============================================================
// vite-plugin-pwa expose un hook virtuel qui signale quand une nouvelle
// version de l'app a été téléchargée par le service worker. On propose
// alors à l'utilisateur de recharger pour l'appliquer.

import { useRegisterSW } from 'virtual:pwa-register/react'

export function UpdatePrompt() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW()

  if (!needRefresh) return null

  return (
    <div
      className="fixed inset-x-0 bottom-[72px] z-50 px-3"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="max-w-lg mx-auto bg-accent rounded-2xl p-3 flex items-center gap-3 shadow-lg">
        <span className="text-sm font-medium flex-1">
          Une nouvelle version est disponible.
        </span>
        <button
          onClick={() => setNeedRefresh(false)}
          className="text-white/80 text-sm px-2 active:text-white"
        >
          Plus tard
        </button>
        <button
          onClick={() => updateServiceWorker(true)}
          className="bg-white text-black rounded-lg px-3 py-2 text-sm font-semibold active:bg-white/80"
        >
          Mettre à jour
        </button>
      </div>
    </div>
  )
}
