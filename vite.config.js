import { defineConfig } from 'vite';

export default defineConfig({
  base: './', // Permite desplegar en cualquier subdirectorio, Vercel, Netlify o GitHub Pages
  server: {
    port: 5173,
    open: false,
    host: true
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    chunkSizeWarningLimit: 1200
  }
});
