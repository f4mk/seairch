import { crx } from '@crxjs/vite-plugin'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'
import { defineConfig } from 'vite'
import zip from 'vite-plugin-zip-pack'
import checker from 'vite-plugin-checker'
// @ts-ignore
import eslint from 'vite-plugin-eslint'

import manifest from './manifest.config.js'
import { name, version } from './package.json'
import { replaceRootWithHost } from './src/plugins/replaceRootWithHost'

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  plugins: [
    react(),
    tailwindcss(),
    replaceRootWithHost(), 
    crx({ manifest }),
    zip({ outDir: 'release', outFileName: `crx-${name}-${version}.zip` }),
    eslint({
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['node_modules/**', 'dist/**'],
      failOnError: false,
      failOnWarning: false,
    }),
    checker({
      typescript: true,
    }),
  ],
  server: {
    cors: {
      origin: [/chrome-extension:\/\//],
    },
  },
})
