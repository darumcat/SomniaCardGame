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
      // Фикс для MetaMask
      '@metamask/providers': path.resolve(__dirname, './node_modules/@metamask/providers/dist/metamask-provider.min.js')
      // Фикс для ethers
      'ethers': path.resolve(__dirname, './node_modules/ethers/dist/ethers.min.js')
    },
    extensions: ['.js', '.jsx', '.ts', '.tsx', '.json']
  },

  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-toastify',
      'framer-motion',
      'bad-words'
    ],
    exclude: [
      '@ethersproject/hash',
      '@metamask/providers'
    ]
  },

  build: {
    target: 'es2020',
    minify: 'terser',
    sourcemap: false,
    chunkSizeWarningLimit: 2500, // Увеличенный лимит для Web3-библиотек
    emptyOutDir: true,
    
    rollupOptions: {
      external: [
        '@metamask/providers',
        'web3' // Если используете
      ],
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('ethers')) {
              return 'ethers';
            }
            if (id.includes('framer-motion')) {
              return 'framer-motion';
            }
            if (id.includes('react')) {
              return 'react-vendor';
            }
            return 'vendor';
          }
        },
        assetFileNames: 'assets/[name].[hash][extname]',
        entryFileNames: 'assets/[name].[hash].js',
        chunkFileNames: 'assets/[name].[hash].js'
      }
    }
  },

  server: {
    port: 3000,
    open: true,
    hmr: {
      protocol: 'wss',
      clientPort: 443
    },
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        rewrite: path => path.replace(/^\/api/, '')
      }
    }
  },

  css: {
    modules: {
      localsConvention: 'camelCase'
    },
    preprocessorOptions: {
      scss: {
        additionalData: `@import "@/styles/variables.scss";`
      }
    }
  }
});
