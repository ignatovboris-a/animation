import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      build: {
        lib: {
          entry: path.resolve(__dirname, 'widget.tsx'),
          name: 'OwlWidget',
          formats: ['iife'],
          fileName: () => 'owl-widget-bundle.js',
        },
        rollupOptions: {
          output: {
            assetFileNames: (assetInfo) =>
              assetInfo.name?.endsWith('.css')
                ? 'owl-widget-bundle.css'
                : 'assets/[name]-[hash][extname]',
          },
        },
      },
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
