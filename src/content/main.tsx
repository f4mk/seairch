import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import { ContentApp } from '@/components/ContentApp'
import { ID_HOST } from '@/consts/host'
import { Z_INDEX_MODAL } from '@/consts/styles'
import { setupMessageListener } from '@/lib/messaging'
import { applyDarkClass } from '@/lib/utils'

import tailwind from './index.css?inline'

const host = document.createElement('div')
host.style.position = 'fixed'
host.style.pointerEvents = 'none'
host.id = ID_HOST
host.style.zIndex = Z_INDEX_MODAL.toString()

const shadow = host.attachShadow({ mode: 'open' })
const style = document.createElement('style')
style.textContent = tailwind
shadow.appendChild(style)

const mount = document.createElement('div')

applyDarkClass(mount)

shadow.appendChild(mount)

document.body.appendChild(host)

setupMessageListener()

createRoot(mount).render(
  <StrictMode>
    <ContentApp shadowRoot={shadow} />
  </StrictMode>,
)
