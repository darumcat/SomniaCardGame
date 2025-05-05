import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  base: '/',
  plugins: [react()],
  
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@utils': path.resolve(__dirname, './src/utils')
    },
    extensions: ['.js', '.jsx', '.ts', '.tsx']
  },

  // Оптимизация зависимостей для Web3
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'ethers',
      '@metamask/providers',
      'framer-motion',
      'react-toastify'
    ],
    exclude: ['@ethersproject/hash']
  },

  // Настройки сборки
  build: {
    target: 'es2020',
    minify: 'terser',
    sourcemap: false,
    chunkSizeWarningLimit: 2000, // Увеличенный лимит для больших Web3-бандлов
    
    rollupOptions: {
      output: {
        manualChunks: {
          // Выносим тяжелые зависимости в отдельные чанки
          ethers: ['ethers'],
          metamask: ['@metamask/providers'],
          react: ['react', 'react-dom'],
          vendor: ['framer-motion', 'react-toastify']
        },
        assetFileNames: 'assets/[name].[hash][extname]',
        entryFileNames: 'assets/[name].[hash].js',
        chunkFileNames: 'assets/[name].[hash].js'
      }
    }
  },

  // Настройки сервера для разработки
  server: {
    port: 3000,
    open: true,
    hmr: {
      protocol: 'wss',
      clientPort: 443
    },
    proxy: {
      // Пример прокси для API (если нужно)
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true
      }
    }
  },

  // Глобальные CSS-настройки
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
