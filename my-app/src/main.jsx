import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

const el =
  document.getElementById('react-app-root') || document.getElementById('shopify-featured-products-data') || document.getElementById('root')

if (el) {
  createRoot(el).render(
    <StrictMode>
      <App />
    </StrictMode>
  )
}