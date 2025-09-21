import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import electron from 'vite-plugin-electron';
import renderer from 'vite-plugin-electron-renderer';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    electron([
      {
        // Main process entry file
        entry: 'electron/main.ts',
        // Vite config for the main process
        vite: {
          build: {
            outDir: 'dist-electron',
            rollupOptions: {
              output: {
                // Compile to CommonJS format
                format: 'cjs', 
              },
            },
          },
        },
      },
      {
        // Preload script entry file
        entry: 'electron/preload.ts',
        onstart(options) {
          options.reload();
        },
        // Vite config for the preload script
        vite: {
          build: {
            outDir: 'dist-electron',
            rollupOptions: {
              output: {
                // Compile to CommonJS format
                format: 'cjs',
              },
            },
          },
        },
      },
    ]),
    renderer(),
  ],
});