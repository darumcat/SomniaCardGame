import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@utils': path.resolve(__dirname, './src/utils'),
      '@context': path.resolve(__dirname, './src/context')
    }
  },
  build: {
    sourcemap: false,
    minify: 'esbuild',
    target: 'esnext'
  },
  server: {
    port: 3000,
    strictPort: true
  }
});
