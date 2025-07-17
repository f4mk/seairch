import { ID_HOST } from '@/consts/host'
import { Z_INDEX_MODAL } from '@/consts/styles'
import { applyDarkClass } from '@/lib/utils'

const createHost = (): HTMLElement => {
  const host = document.createElement('div')
  host.style.position = 'fixed'
  host.style.pointerEvents = 'none'
  host.id = ID_HOST
  host.style.zIndex = Z_INDEX_MODAL.toString()
  return host
}

const createMount = (): HTMLElement => {
  const mount = document.createElement('div')
  applyDarkClass(mount)
  return mount
}

export const setupShadowDOM = (tailwind: string) => {
  const host = createHost()
  const shadow = host.attachShadow({ mode: 'open' })
  const mount = createMount()

  const style = document.createElement('style')
  style.textContent = tailwind
  shadow.appendChild(style)
  shadow.appendChild(mount)

  return { shadow, mount, host }
}
