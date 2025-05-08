import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const repoName = 's6-dashboard'; // <<<--- CHANGE THIS

// https://vite.dev/config/
export default defineConfig(({ command }) => {
  const base = command === 'build' ? `/${repoName}/` : '/'; // Should resolve to '/s6-dashboard/' for build
  return {
    plugins: [react()],
    base: base,
    server: {
      host: '0.0.0.0',
      port: 10000
    }
  }
})
