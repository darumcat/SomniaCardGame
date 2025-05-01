import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  root: path.resolve(__dirname, './'),  // Явно указываем корень
  publicDir: 'public',  // Указываем папку с static файлами
  plugins: [react()],
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: path.resolve(__dirname, 'public/index.html')  // Абсолютный путь
    }
  }
})
