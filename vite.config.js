import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { resolve } from 'path'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  // environmentConfig.js reads YT_-prefixed vars; Vite only exposes VITE_ by default.
  envPrefix: ['VITE_', 'YT_'],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'https://api.yantravidyainfotech.com',
        changeOrigin: true,
        secure: true,
      },
    },
  },
})
