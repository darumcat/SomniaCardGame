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
    extensions: ['.js', '.jsx', '.json']
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'ethers',
      'react-toastify',
      'framer-motion',
      'bad-words'
    ],
    exclude: ['js-big-decimal']
  },
  build: {
    target: 'es2020',
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: false,
    rollupOptions: {
      input: path.resolve(__dirname, 'index.html'),
      external: ['react-toastify'],
      output: {
        format: 'es',
        assetFileNames: 'assets/[name].[hash][extname]',  // Изменил дефис на точку
        entryFileNames: 'assets/[name].[hash].js',       // Изменил дефис на точку
        chunkFileNames: 'assets/[name].[hash].js'        // Добавил новую строку
      }
    }
  },
  server: {
    open: true
  }
})
