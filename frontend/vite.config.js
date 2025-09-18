import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig(() => {
  return {
    build: {
      manifest: true,
    },
    plugins: [react(), tailwindcss()],
    server: {
        port: 3000, // Change this to your desired port
    },
    base: "/",
  };
});