import path from 'node:path'

import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  cacheDir: './.vite-cache',
  plugins: [react()],
  resolve: { conditions: ['browser'], alias: { '@': path.resolve(import.meta.dirname, './src'), '~': path.resolve(import.meta.dirname, './src') } },
  server: { proxy: { '/api': { target: 'http://localhost:8080', changeOrigin: true } } },
  optimizeDeps: { include: ['axios'] },
})
