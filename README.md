# react-shopify
# install react 
npm create vite@latest my-app
cd my-app
npm install
# install tailwindcss 
npm install tailwindcss @tailwindcss/vite
npx tailwindcss init -p

# vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss()
  ],
})

# src/index.css

@import "tailwindcss";