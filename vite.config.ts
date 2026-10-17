import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import path from 'node:path'
export default defineConfig({
  cacheDir: './.vite-cache',

  plugins: [react()],

  // 경로, 조건
  resolve: {
    conditions: ['browser'],
    alias: {
    '@': path.resolve(import.meta.dirname, './src'),
    '~': path.resolve(import.meta.dirname, './src'),
    },
  },

  // 서버 옵션 (필요하면 주석 풀어서 사용)
  server: {
    // proxy: {
    //   '/api': {
    //     target: 'http://localhost:8081',
    //     changeOrigin: true,
    //   },
    // },
  },
  optimizeDeps: {
    include: ['axios'],
  },
})