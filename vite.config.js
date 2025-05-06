import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const repoName = 'crud-dashboard'; // <<<--- CHANGE THIS

// https://vite.dev/config/
export default defineConfig(({ command }) => {
  // Set base path only for production build, not for local dev server
  const base = command === 'build' ? `/${repoName}/` : '/';

  return {
    plugins: [react()],
    base: base, // <<<--- ADD OR UPDATE THIS LINE
    // Optional: Ensure build output goes to 'dist' (Vite's default)
    // build: {
    //   outDir: 'dist'
    // }
  }
})