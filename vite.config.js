import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  // Use relative base path for GitHub Pages deployment
  base: './',
  publicDir: 'public/assets',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
  server: {
    port: 3000,
    open: true,
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
});