import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// This tells Vercel how to bundle your React application
export default defineConfig({
  plugins: [react()],
})
