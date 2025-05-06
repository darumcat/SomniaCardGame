import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    sourcemap: false,
    minify: 'esbuild',
    target: 'esnext'
  },
  server: {
    port: 3000,
    strictPort: true
  }
})
