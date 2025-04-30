import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  publicDir: 'public', // Явно указываем папку с static-файлами
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: './public/index.html' // Явный путь к входному файлу
      }
    }
  },
  plugins: [react()]
})
