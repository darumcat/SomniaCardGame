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
    minify: 'terser',
    sourcemap: false,
    terserOptions: {
      compress: {
        defaults: false,
        drop_console: true
      }
    }
  },
 server: {
    open: true,
    hmr: {
      protocol: 'wss',
      clientPort: 443
    }
  },
  preview: {
    headers: {
      "Content-Security-Policy": "default-src 'self' https:; script-src 'self' 'unsafe-eval' 'unsafe-inline' https: blob:; style-src 'self' 'unsafe-inline' https:; img-src 'self' data: https:; font-src 'self' https: data:; connect-src 'self' https: wss:; frame-src 'self' https:; worker-src 'self' blob:;"
    }
  }
})
