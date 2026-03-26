import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) {
            return undefined;
          }

          if (id.includes('recharts') || id.includes('d3-')) {
            return 'charts';
          }

          if (id.includes('@mui') || id.includes('@emotion')) {
            return 'mui';
          }

          return 'vendor';
        },
      },
    },
  },
  server: {
    port: 5173,
    host: '0.0.0.0'
  }
});
