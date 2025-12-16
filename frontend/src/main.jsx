import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/globals.css'
import './index.css'
import App from './App.jsx'
import AppTest from './AppTest.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AppTest />
  </StrictMode>,
)