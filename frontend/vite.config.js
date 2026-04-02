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
      // redirects every /api call goes to the docker container
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true
      }
    }
  }
})
