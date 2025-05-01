import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    outDir: 'dist',  // Четко указываем выходную директорию
    emptyOutDir: true,
    target: 'es2020',
    commonjsOptions: {
      transformMixedEsModules: true,
    },
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html')  // Явное указание на входной файл
      }
    }
  },
  optimizeDeps: {
    include: ['ethers'],
    esbuildOptions: {
      target: 'es2020'
    }
  }
})
