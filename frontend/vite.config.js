import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { nodePolyfills } from 'vite-plugin-node-polyfills'

export default defineConfig({
  root: './',
  publicDir: 'public',
  plugins: [
    react(),
    nodePolyfills()
  ],
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: './public/index.html' // Указываем относительный путь
    }
  }
})
