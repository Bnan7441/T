import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  server: {
    port: 3000,
    host: '0.0.0.0',
  },
  preview: {
    port: 4173,
    host: '0.0.0.0',
    allowedHosts: ['tondino.ir', 'www.tondino.ir', 'localhost', '188.121.122.181']
  },
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    }
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom')) {
              return 'vendor.react';
            }
            if (id.includes('framer-motion')) {
              return 'vendor.framer';
            }
            return 'vendor';
          }
        }
      }
    }
  }
});
