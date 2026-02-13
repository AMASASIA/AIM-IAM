import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  server: {
    host: '0.0.0.0', // Listen on all network interfaces
    allowedHosts: true, // Allow connections from any host (required for local network access)
    proxy: {
      '/agent': 'http://localhost:3000',
      '/analyze-scene': 'http://localhost:3000',
      '/execute-agentic-purchase': 'http://localhost:3000',
      '/atomicMint': 'http://localhost:3000',
      '/amane-l0': 'http://localhost:3000',
      '/f': 'http://localhost:3000'
    }
  }
})
