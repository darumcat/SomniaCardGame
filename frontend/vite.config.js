import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  base: '/',
  plugins: [react()],
  
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@utils': path.resolve(__dirname, './src/utils'),
      '@components': path.resolve(__dirname, './src/components'),
      // Алиасы для Web3-библиотек
      '@metamask/providers': path.resolve(__dirname, './node_modules/@metamask/providers/dist/metamask-provider.min.js'),
      'ethers': path.resolve(__dirname, './node_modules/ethers/dist/ethers.min.js')
    },
    extensions: ['.js', '.jsx', '.json']
  },

  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-toastify',
      'framer-motion'
    ],
    exclude: [
      '@metamask/providers',
      '@ethersproject/hash'
    ]
  },

  build: {
    target: 'es2020',
    minify: 'terser',
    sourcemap: false,
    chunkSizeWarningLimit: 2500,
    rollupOptions: {
      external: [
        '@metamask/providers',
        'web3'
      ],
      output: {
        manualChunks: {
          ethers: ['ethers'],
          react: ['react', 'react-dom'],
          framer: ['framer-motion'],
          toastify: ['react-toastify']
        }
      }
    }
  },

  server: {
    host: true,
    port: 3000,
    strictPort: true,
    hmr: {
      protocol: 'wss',
      clientPort: 443
    }
  }
});
