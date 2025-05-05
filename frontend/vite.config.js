import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  // Базовый путь для production (Netlify)
  base: '/',
  
  // Плагины
  plugins: [
    react({
      // Оптимизации для React 18
      jsxRuntime: 'automatic',
      jsxImportSource: '@emotion/react',
      babel: {
        plugins: ['@emotion/babel-plugin']
      }
    })
  ],
  
  // Настройки разрешения модулей
  resolve: {
    alias: {
      // Основные алиасы
      '@': path.resolve(__dirname, './src'),
      '@utils': path.resolve(__dirname, './utils'),
      '@components': path.resolve(__dirname, './src/components'),
      '@assets': path.resolve(__dirname, './src/assets'),
      
      // Web3 и кошельки
      'web3': path.resolve(__dirname, './utils/web3.js'),
      '@metamask/providers': path.resolve(__dirname, './node_modules/@metamask/providers/dist/metamask-provider.min.js'),
      
      // Фикс для ethers.js
      'ethers': path.resolve(__dirname, './node_modules/ethers/dist/ethers.min.js'),
      'ethers/': path.resolve(__dirname, './node_modules/ethers/')
    },
    extensions: ['.js', '.jsx', '.ts', '.tsx', '.json']
  },

  // Оптимизация зависимостей
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'react-toastify',
      'framer-motion',
      'zustand'
    ],
    exclude: [
      '@metamask/providers'
    ],
    esbuildOptions: {
      target: 'es2020'
    }
  },

  // Настройки сборки
  build: {
    target: 'es2020',
    minify: 'terser',
    sourcemap: false,
    chunkSizeWarningLimit: 3000,
    emptyOutDir: true,
    
    rollupOptions: {
      external: [
        '@metamask/providers',
        'web3'
      ],
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('ethers')) return 'ethers';
            if (id.includes('react')) return 'react-vendor';
            if (id.includes('framer-motion')) return 'framer';
            return 'vendor';
          }
        },
        assetFileNames: 'assets/[name].[hash][extname]',
        entryFileNames: 'assets/[name].[hash].js',
        chunkFileNames: 'assets/[name].[hash].js',
        globals: {
          'ethers': 'ethers'
        }
      }
    }
  },

  // Настройки сервера разработки
  server: {
    port: 3000,
    open: true,
    strictPort: true,
    hmr: {
      protocol: 'wss',
      host: 'localhost'
    },
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  },

  // CSS/SCSS обработка
  css: {
    modules: {
      localsConvention: 'camelCaseOnly'
    },
    preprocessorOptions: {
      scss: {
        additionalData: `
          @import "@assets/styles/variables.scss";
          @import "@assets/styles/mixins.scss";
        `
      }
    }
  }
});
