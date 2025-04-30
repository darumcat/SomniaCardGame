import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  define: {
    global: 'window', // Решает проблему с global в ethers.js
  },
  optimizeDeps: {
    esbuildOptions: {
      // Настройки для корректной работы с Node.js полифилами
      define: {
        global: 'globalThis',
      },
    },
  },
  build: {
    commonjsOptions: {
      transformMixedEsModules: true, // Важно для ethers.js
    },
    rollupOptions: {
      // Плагины для обработки проблемных модулей
      plugins: [
        {
          name: 'fix-ethers',
          resolveId(source) {
            if (source === 'ethers') {
              return { id: 'ethers', external: true }
            }
            return null
          }
        }
      ]
    }
  },
  resolve: {
    alias: {
      // Алиасы для совместимости
      stream: 'stream-browserify',
      crypto: 'crypto-browserify',
      util: 'util',
      assert: 'assert',
      http: 'stream-http',
      https: 'https-browserify',
      os: 'os-browserify/browser',
      path: 'path-browserify',
    }
  }
})
