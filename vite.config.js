import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/keeptrack/', // Deploying to GitHub Pages subdirectory
  build: {
    chunkSizeWarningLimit: 1000, // Increase the size limit to 1000 kB (1 MB)
    rollupOptions: {
      output: {
        // Use relative paths for assets
        assetFileNames: 'assets/[name].[hash].[ext]',
        chunkFileNames: 'assets/[name].[hash].js',
        entryFileNames: 'assets/[name].[hash].js',
      }
    }
  }
})
