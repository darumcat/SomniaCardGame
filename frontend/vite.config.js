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
        generatedCode: 'es2015',
        assetFileNames: 'assets/[name].[hash][extname]',
        entryFileNames: 'assets/[name].[hash].js',
        chunkFileNames: 'assets/[name].[hash].js'
      }
    }
  },
  server: {
    open: true,
    headers: {
      "Content-Security-Policy": "default-src 'self'; script-src 'self' 'unsafe-eval' 'wasm-unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'"
    }
  }
})
