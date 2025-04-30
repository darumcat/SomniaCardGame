import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { nodePolyfills } from 'vite-plugin-node-polyfills'

export default defineConfig({
  plugins: [
    react(),
    nodePolyfills({
      include: ['stream', 'crypto', 'util', 'assert', 'http', 'https', 'os', 'path']
    })
  ],
  define: {
    global: 'window'
  },
  build: {
    commonjsOptions: {
      transformMixedEsModules: true
    }
  }
})
