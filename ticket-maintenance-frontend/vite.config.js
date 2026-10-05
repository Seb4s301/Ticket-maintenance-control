import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    fs: {
      // allow importing the brand logo from the repo-root img/ directory
      allow: ['..'],
    },
  },
})
