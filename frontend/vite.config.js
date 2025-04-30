import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  build: {
    rollupOptions: {
      external: [
        'ethers',
        'ethers/providers',
        'ethers/contracts'
      ],
    },
  },
  plugins: [react()],
  optimizeDeps: {
    include: ['ethers']
  }
})
