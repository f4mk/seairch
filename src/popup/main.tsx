import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import { PopupApp } from '@/components/PopupApp'

import './index.css'

const root = document.getElementById('root')!
document.body.classList.add('dark')

createRoot(root).render(
  <StrictMode>
    <PopupApp />
  </StrictMode>,
)
