import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // Exposes server to local network (0.0.0.0 / 192.168.1.6)
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:1119',
        changeOrigin: true,
      },
    },
  },
})

