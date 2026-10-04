// Dueable | Developed by Shaffron Wazny
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource-variable/plus-jakarta-sans'
import './index.css'
import { applyBrand } from './config/applyBrand'
import App from './App'

applyBrand()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
