import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { nodePolyfills } from 'vite-plugin-node-polyfills'

export default defineConfig({
  root: './frontend',  // Явно указываем корень проекта
  publicDir: 'public',
  plugins: [
    react(),
    nodePolyfills()
  ],
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: './frontend/public/index.html'  // Полный путь
      }
    }
  }
})
