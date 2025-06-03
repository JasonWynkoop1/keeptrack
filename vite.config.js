import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/keeptrack/', // Deploying to GitHub Pages subdirectory
  build: {
    chunkSizeWarningLimit: 1000, // Increase the size limit to 1000 kB (1 MB)
  }
})
