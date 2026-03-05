import { defineConfig } from 'vitest/config'
// @ts-ignore - version conflict between vite and vitest
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  // @ts-ignore
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    globals: true,
    exclude: ['**/node_modules/**', '**/e2e/**'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
})
