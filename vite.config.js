// import { defineConfig } from 'vite'
// import react from '@vitejs/plugin-react'
// import tailwindcss from '@tailwindcss/vite'

// export default defineConfig({
//   plugins: [react(), tailwindcss()],
// })


import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const BASE_PORT = import.meta.env.BASE_PORT;


export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: parseInt(BASE_PORT) || 8080, // use Render's provided port or fallback
    host: '0.0.0.0', // must be 0.0.0.0 for Render to detect
  },
})
