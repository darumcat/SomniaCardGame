import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  base: '/',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@utils': path.resolve(__dirname, './src/utils'),
      'ethers': path.resolve(__dirname, './node_modules/ethers')
    },
    extensions: ['.js', '.jsx', '.json'] // Сохраняем расширения
  },
  optimizeDeps: {
    include: [ // Сохраняем важные зависимости
      'react',
      'react-dom',
      'ethers',
      'react-toastify',
      'framer-motion',
      'bad-words'
    ],
    exclude: ['js-big-decimal'] // Сохраняем исключения
  },
  build: {
    target: 'es2020', // Сохраняем target
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: false, // Оставляем выключенным
    rollupOptions: {
      input: path.resolve(__dirname, 'index.html'),
      external: ['react-toastify'], // Сохраняем external
      output: {
        format: 'es',
        generatedCode: 'es2015', // Ключевое исправление
        assetFileNames: 'assets/[name].[hash][extname]',
        entryFileNames: 'assets/[name].[hash].js',
        chunkFileNames: 'assets/[name].[hash].js' // Сохраняем именование
      }
    }
  },
  server: {
    open: true // Оставляем автооткрытие
  }
})
