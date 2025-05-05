import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      'ethers': path.resolve(__dirname, './node_modules/ethers')
    }
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'ethers',
      'react-toastify'
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
