import { defineConfig } from 'vite';
import { resolve } from 'node:path';
import { mapEditorApi } from './scripts/map-editor-api.ts';

export default defineConfig({
  plugins: [mapEditorApi()],
  root: 'client',
  server: { host: '127.0.0.1', port: 5173, strictPort: true },
  preview: { host: '127.0.0.1', port: 4173, strictPort: true },
  build: { outDir: '../dist/client', emptyOutDir: true,
    rolldownOptions: { input: [resolve('client/index.html'), resolve('client/hang-nhac.html'), resolve('client/chibi-pilot.html'), resolve('client/starter-region.html'), resolve('client/map-design.html'), resolve('client/layered-map.html'), resolve('client/map-pilot.html'), resolve('client/map-editor.html')] },
  },
});
