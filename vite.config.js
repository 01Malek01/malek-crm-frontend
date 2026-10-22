import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    // Fail loudly instead of silently drifting to another port, which would
    // change the origin and break the API's CORS allow-list.
    strictPort: true,
  },
});