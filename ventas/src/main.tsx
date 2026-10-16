import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { aplicarTema, temaInicial } from '@/components/comunes'

aplicarTema(temaInicial()) // oscuro por defecto; el interruptor de la barra lo cambia

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
