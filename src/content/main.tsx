import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import { Z_INDEX_MODAL } from '@/consts/styles'

import { App } from './App'
import tailwind from './index.css?inline'

// Create a small host element that acts as a container for the modal
const host = document.createElement('div')
host.style.position = 'fixed'
host.style.pointerEvents = 'none'
host.style.zIndex = Z_INDEX_MODAL.toString()

const shadow = host.attachShadow({ mode: 'open' })

// Inject styles into shadow DOM
const style = document.createElement('style')
style.textContent = tailwind
shadow.appendChild(style)

// Inject mount node
const mount = document.createElement('div')
shadow.appendChild(mount)

// Attach to body
document.body.appendChild(host)

// Mount app
createRoot(mount).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
