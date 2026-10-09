import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
// GitHub Pages ใช้ base /baanbrew-dashboard/ ส่วน Firebase Hosting (--mode firebase) ใช้ราก /
export default defineConfig(({ mode }) => ({
  base: mode === 'firebase' ? '/' : '/baanbrew-dashboard/',
  plugins: [react(), tailwindcss()],
}))
