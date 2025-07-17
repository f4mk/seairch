import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import { ContentApp } from '@/components/ContentApp'
import { setupMessageListener } from '@/lib/messaging'

import tailwind from './index.css?inline'
import { setupShadowDOM } from './utils'

let keepAlivePort: chrome.runtime.Port | null = null
let pingInterval: NodeJS.Timeout | null = null
let reconnectTimeout: NodeJS.Timeout | null = null

const waitForDocumentReady = async (): Promise<void> => {
  if (document.body) return

  await new Promise<void>((resolve) => {
    document.addEventListener('DOMContentLoaded', () => resolve())
  })
}

const setupKeepAlive = (): void => {
  if (keepAlivePort) return

  keepAlivePort = chrome.runtime.connect({ name: 'keepAlivePort' })

  keepAlivePort.onDisconnect.addListener(() => {
    keepAlivePort = null
    if (pingInterval) {
      clearInterval(pingInterval)
      pingInterval = null
    }
    reconnectTimeout = setTimeout(() => {
      setupKeepAlive()
    }, 1000)
  })

  pingInterval = setInterval(() => {
    if (keepAlivePort) {
      keepAlivePort.postMessage({ type: 'ping' })
    }
  }, 25000)
}

const setupApp = (): void => {
  const { shadow, mount, host } = setupShadowDOM(tailwind)

  document.body.appendChild(host)
  setupMessageListener()

  const root = createRoot(mount)
  root.render(
    <StrictMode>
      <ContentApp shadowRoot={shadow} />
    </StrictMode>,
  )
}

const cleanup = (): void => {
  if (pingInterval) {
    clearInterval(pingInterval)
    pingInterval = null
  }
  if (reconnectTimeout) {
    clearTimeout(reconnectTimeout)
    reconnectTimeout = null
  }
  if (keepAlivePort) {
    keepAlivePort.disconnect()
    keepAlivePort = null
  }
}

const initializeApp = async (): Promise<void> => {
  try {
    await waitForDocumentReady()
    setupApp()
    setupKeepAlive()
  } catch (error) {
    console.error('Failed to initialize app:', error)
  }
}

window.addEventListener('beforeunload', () => {
  cleanup()
})

void initializeApp()
