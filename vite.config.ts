import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  base: '/split-bill/',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    host: true, // 監聽所有網路介面
    allowedHosts: [
      '.ngrok-free.dev',  // ngrok 免費版
      '.ngrok.io',        // ngrok 付費版
      '.ngrok.app',       // ngrok 新域名
    ],
    // 可選：指定端口
    port: 5173,
  },
})