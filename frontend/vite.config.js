import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@utils': path.resolve(__dirname, './src/utils'),
      'ethers': path.resolve(__dirname, './node_modules/ethers')
    },
    extensions: ['.js', '.jsx']
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'ethers',
      'react-toastify',
      'framer-motion', // Добавлено
      'bad-words'     // Добавлено
    ],
    exclude: ['js-big-decimal']
  },
  build: {
    target: 'es2020',
    outDir: 'dist',
    rollupOptions: {
      external: ['react-toastify']
    }
  }
})
