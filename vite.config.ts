/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // `npm start` / `npm run preview` serve the built app (dist/) on $PORT (default 3000)
  preview: {
    port: Number(process.env.PORT) || 3000,
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
    css: true,
    // Measure the app source, not just the files a test happened to import.
    // main.tsx is bootstrap glue (mounts <App/>) and has no testable behaviour.
    coverage: {
      provider: 'v8',
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['src/main.tsx'],
      // The floor from .gse/config.yaml (testing.coverage.minimum). A run that
      // drops below it exits non-zero (TST-017).
      thresholds: {
        lines: 60,
      },
    },
  },
})
