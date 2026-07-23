import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist/client',
  },
  server: {
    port: Number(process.env.PORT) || 5173,
    proxy: {
      '/api': { target: 'http://localhost:5178', changeOrigin: true },
      // Server-rendered SEO pages live on the Express server, not Vite.
      '/cost': { target: 'http://localhost:5178', changeOrigin: true },
      '/sitemap.xml': { target: 'http://localhost:5178', changeOrigin: true },
      '/robots.txt': { target: 'http://localhost:5178', changeOrigin: true },
    },
  },
});
