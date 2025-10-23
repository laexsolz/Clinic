// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Ensures built CSS/JS use relative paths so assets load correctly on Vercel
  base: './',
  // Optional: only keep exclude if you have a reason
  // optimizeDeps: {
  //   exclude: ['lucide-react'],
  // },
});
