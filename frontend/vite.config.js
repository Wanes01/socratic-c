import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    tailwindcss(),
    svelte()
  ],
  server: {
    port: 5173, // vite port
    proxy: {
      // redirects every /api request to the backend service
      '/api': {
        target: 'http://backend:5000',
        changeOrigin: true,
        ws: true
      }
    }
  }
})
