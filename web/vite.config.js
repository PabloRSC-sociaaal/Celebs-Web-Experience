import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/Celebs-Web-Experience/',
  server: {
    port: process.env.PORT ? parseInt(process.env.PORT) : 5174,
    strictPort: false,
  },
  build: {
    chunkSizeWarningLimit: 1500,
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            { name: "face-api", test: /@vladmandic[\\/]face-api/ },
          ],
        },
      },
    },
  },
})
