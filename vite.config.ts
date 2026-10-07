import { defineConfig } from 'vite';
import { resolve } from 'node:path';

export default defineConfig({
  root: 'client',
  server: { host: '127.0.0.1', port: 5173, strictPort: true },
  preview: { host: '127.0.0.1', port: 4173, strictPort: true },
  build: { outDir: '../dist/client', emptyOutDir: true,
    rolldownOptions: { input: [resolve('client/index.html'), resolve('client/chibi-pilot.html')] },
  },
});
