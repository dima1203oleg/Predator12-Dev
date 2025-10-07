import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  server: {
    port: 5090,
    host: true,
    strictPort: false,
    hmr: {
      overlay: true
    },
    fs: {
      allow: [
        // Дозволяємо доступ до packages
        path.resolve(__dirname, '../packages'),
        // Дозволяємо доступ до поточної директорії
        path.resolve(__dirname, '.'),
        // Дозволяємо доступ до батьківської директорії
        path.resolve(__dirname, '..')
      ]
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  }
})
