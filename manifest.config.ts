import { defineManifest } from '@crxjs/vite-plugin'

import pkg from './package.json'

export default defineManifest({
  manifest_version: 3,
  name: pkg.name,
  version: pkg.version,
  permissions: ['storage', 'activeTab', 'tabs'],
  host_permissions: ['https://*/*'],
  icons: {
    48: 'public/logo.png',
  },
  action: {
    default_icon: {
      48: 'public/logo.png',
    },
    default_popup: 'src/popup/index.html',
  },
  content_scripts: [
    {
      js: ['src/content/main.tsx'],
      matches: ['https://*/*'],
      run_at: 'document_start',
    },
  ],
  background: {
    service_worker: 'src/background/main.ts',
    type: 'module',
  },
})
