import { defineConfig } from 'vite'

export default defineConfig({
  server: {
    proxy: {
      '/log-activities': {
        target: 'http://localhost:8100',
        changeOrigin: true,
      },
    },
  },
})
