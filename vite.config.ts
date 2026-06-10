import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// ---------------------------------------------------------------------------
// GitHub Pages deployment configuration
//
// IMPORTANT: Set VITE_BASE_PATH in your repository's GitHub Actions secrets
// or environment, OR hard-code your repo name below.
//
// Examples:
//   - Repo: github.com/yourname/pos-file-checker  → base: '/pos-file-checker/'
//   - Custom domain / root deploy                  → base: '/'
//
// The CI workflow passes --base at build time via the VITE_BASE env var,
// so this file stays generic and works for any repo name.
// ---------------------------------------------------------------------------
export default defineConfig(({ mode }) => {
  // In CI the workflow sets VITE_BASE; locally it falls back to '/'
  const base = process.env.VITE_BASE ?? '/'

  return {
    base,

    plugins: [
      react(),

      VitePWA({
        registerType: 'autoUpdate',

        // ── PWA assets ───────────────────────────────────────────────────
        includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'pwa-192x192.png', 'pwa-512x512.png'],

        // ── Web App Manifest ─────────────────────────────────────────────
        manifest: {
          name: 'POS File Checker',
          short_name: 'POSChecker',
          description: 'Validate POS .001 remittance files against admin-computed expected values. Runs entirely in the browser — your files never leave your device.',
          theme_color: '#0F1C2E',
          background_color: '#0F1C2E',
          display: 'standalone',
          orientation: 'any',
          scope: base,
          start_url: base,
          icons: [
            {
              src: 'pwa-192x192.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: 'pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any maskable',
            },
            {
              src: 'apple-touch-icon.png',
              sizes: '180x180',
              type: 'image/png',
            },
            {
              src: 'favicon.ico',
              sizes: '64x64 32x32 24x24 16x16',
              type: 'image/x-icon',
            },
          ],
        },

        // ── Workbox (service worker) config ──────────────────────────────
        workbox: {
          // Precache all build output
          globPatterns: ['**/*.{js,css,html,ico,png,svg,webmanifest}'],

          // No runtime caching needed — app is fully static / offline-capable
          runtimeCaching: [],

          // Ensures the SW path is correct under a sub-path base
          navigateFallback: 'index.html',
          navigateFallbackDenylist: [/^\/api\//],

          // Clean up old caches when a new SW activates
          cleanupOutdatedCaches: true,
        },

        // ── Dev options ───────────────────────────────────────────────────
        devOptions: {
          // Enable SW in dev for easier testing
          enabled: false,
          type: 'module',
        },
      }),
    ],

    // ── Build options ──────────────────────────────────────────────────────
    build: {
      // Raise the warning limit slightly — jsPDF and xlsx are large but lazy-loaded
      chunkSizeWarningLimit: 600,

      rollupOptions: {
        output: {
          // Manual chunk splitting: keep the heavy export libs out of the main bundle
          manualChunks: {
            'vendor-react': ['react', 'react-dom'],
            'vendor-jspdf': ['jspdf', 'jspdf-autotable'],
            'vendor-xlsx': ['xlsx'],
          },
        },
      },
    },
  }
})
