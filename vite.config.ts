import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// ⚠️ IMPORTANT — GitHub Pages sert le site depuis /NOM-DU-DEPOT/
// Remplace 'muscu-tracker' ci-dessous par le nom EXACT de ton dépôt GitHub.
// Si tu ne le fais pas, l'app affichera une page blanche une fois publiée.
const REPO_NAME = 'muscu-tracker'

export default defineConfig({
  base: `/${REPO_NAME}/`,
  plugins: [
    react(),
    VitePWA({
      registerType: 'prompt',
      includeAssets: ['favicon.svg', 'apple-touch-icon.png'],
      manifest: {
        name: 'Muscu Tracker',
        short_name: 'Muscu',
        description: 'Suivi de musculation personnel',
        theme_color: '#0a0a0a',
        background_color: '#0a0a0a',
        display: 'standalone',
        orientation: 'portrait',
        // scope et start_url doivent inclure le sous-chemin GitHub Pages
        scope: `/${REPO_NAME}/`,
        start_url: `/${REPO_NAME}/`,
        icons: [
          { src: 'pwa-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'pwa-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        // Met en cache tous les fichiers du build → fonctionne hors connexion
        globPatterns: ['**/*.{js,css,html,svg,png,json}'],
        navigateFallback: `/${REPO_NAME}/index.html`,
      },
    }),
  ],
})
