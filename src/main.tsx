import '@/i18n'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'

import ThemeProvider from '@/contexts/theme/ThemeProvider.tsx'

import './assets/css/tailwind.css'
import '@/styles/theme.css'
import '@/styles/global.css'
import '@/styles/dark.css'
import '@/styles/api.css'
import App from './App.tsx'

const rootElement = document.getElementById('root')
if (!rootElement) throw new Error('Root element #root was not found')

createRoot(rootElement).render(<StrictMode>
  <BrowserRouter>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </BrowserRouter>
</StrictMode>)
