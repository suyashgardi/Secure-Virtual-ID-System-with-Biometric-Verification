import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
const APIURL='http://localhost:5000'

export default defineConfig({
  plugins: [react()],
  server: {
    
    proxy: {
      '/api':{
        target:APIURL,
        changeOrigin:true,
      }
    }
  }
})