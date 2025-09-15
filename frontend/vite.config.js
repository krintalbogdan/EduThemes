import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig(() => {
  return {
    build: {
      outDir: 'build',
    },
    plugins: [react(), tailwindcss()],
    server: {
        port: 3000, // Change this to your desired port
    },
  };
});