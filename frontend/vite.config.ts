import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // sockjs-client (used for the STOMP/WebSocket connection) assumes a Node-style
  // `global` object exists, which browsers don't provide.
  define: {
    global: 'globalThis',
  },
})
