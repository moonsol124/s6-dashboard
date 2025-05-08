import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const repoName = 's6-dashboard'; // <<<--- CHANGE THIS

// https://vite.dev/config/
export default defineConfig(({ command }) => {
  const base = command === 'build' ? `/${repoName}/` : '/';
  return {
    plugins: [react()],
    base: base,
    server: {
      host: '0.0.0.0',
      port: 10000,
      allowedHosts: ['s6-dashboard.onrender.com'] // 👈 Add this line
    }
  }
})