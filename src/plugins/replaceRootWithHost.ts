import type { Plugin } from 'vite'

export const replaceRootWithHost = (): Plugin => {
  return {
    name: 'replace-root-with-host-in-inline-css',
    enforce: 'pre',
    transform(code, id) {
      if (id.includes('?inline') && id.match(/\.css(\?|$)/)) {
        return code.replace(/:root/g, ':host')
      }
      return null
    },
  }
}
