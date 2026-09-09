import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// If you deploy to GitHub Pages as a project site (https://<user>.github.io/<repo>/),
// set BASE_PATH="/<repo>/" as an env var in the build step. Vercel/Netlify need no base.
export default defineConfig({
  base: process.env.BASE_PATH || '/',
  plugins: [react(), tailwindcss()],
})
