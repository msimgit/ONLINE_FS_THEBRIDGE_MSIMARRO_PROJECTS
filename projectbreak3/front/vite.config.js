// Sprint 16 - Despliegue: configuración base de Vite (build) para Netlify.
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
})
