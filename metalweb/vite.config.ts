import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  server: {
    port: 3006,      // 👈 dev server runs at http://localhost:3000
    strictPort: true // fail instead of auto-switching if 3000 is busy
  },
  preview: {
    port: 8080       // vite preview after `vite build`
  }
});
