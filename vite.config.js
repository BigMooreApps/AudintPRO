import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { viteSingleFile } from 'vite-plugin-singlefile'

const isSingleFile = process.env.BUILD_SINGLEFILE === 'true';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    ...(isSingleFile ? [viteSingleFile()] : [])
  ],
  build: {
    chunkSizeWarningLimit: 2500,
    outDir: 'dist'
  },
  preview: {
    host: '0.0.0.0',
    port: process.env.PORT ? parseInt(process.env.PORT) : 3000,
    allowedHosts: true
  },
  server: {
    host: '0.0.0.0',
    port: 5173
  }
})
