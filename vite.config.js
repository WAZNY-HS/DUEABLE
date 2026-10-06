import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import brand from './src/config/brand.js'

const logoSvg = ({ rounded, scale = 1 }) => {
  const offset = (32 - 32 * scale) / 2
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${brand.colors.accent}"/><stop offset="1" stop-color="${brand.colors.accentPartner}"/></linearGradient></defs><rect width="32" height="32" ${rounded ? 'rx="9" ' : ''}fill="url(#g)"/><g transform="translate(${offset} ${offset}) scale(${scale})"><path d="${brand.logoPath}" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></g></svg>`
}
const faviconSvg = logoSvg({ rounded: true })

const manifest = JSON.stringify({
  name: `${brand.name} | ${brand.tagline}`,
  short_name: brand.name,
  description: brand.description,
  start_url: '/',
  scope: '/',
  display: 'standalone',
  background_color: brand.colors.bgLight,
  theme_color: brand.colors.accent,
  icons: [
    { src: '/icons/icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
    { src: '/icons/maskable.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'maskable' },
  ],
})

// PWA files generated from brand.js so re-branding never needs binary assets.
const pwaFiles = {
  'manifest.webmanifest': { type: 'application/manifest+json', body: manifest },
  'icons/icon.svg': { type: 'image/svg+xml', body: logoSvg({ rounded: true }) },
  'icons/maskable.svg': { type: 'image/svg+xml', body: logoSvg({ rounded: false, scale: 0.7 }) },
}

const brandPwa = () => ({
  name: 'brand-pwa',
  configureServer(server) {
    server.middlewares.use((req, res, next) => {
      const file = pwaFiles[req.url?.split('?')[0].slice(1)]
      if (!file) return next()
      res.setHeader('Content-Type', file.type)
      res.end(file.body)
    })
  },
  generateBundle() {
    for (const [fileName, { body }] of Object.entries(pwaFiles)) {
      this.emitFile({ type: 'asset', fileName, source: body })
    }
  },
})

const tokens = {
  __BRAND_NAME__: brand.name,
  __BRAND_TAGLINE__: brand.tagline,
  __BRAND_DESCRIPTION__: brand.description,
  __BRAND_AUTHOR__: brand.author,
  __BRAND_THEME_KEY__: `${brand.storageNamespace}:theme:v1`,
  __BRAND_BG_LIGHT__: brand.colors.bgLight,
  __BRAND_FAVICON__: `data:image/svg+xml,${encodeURIComponent(faviconSvg)}`,
}

// Injects brand.js values into index.html so re-branding never touches HTML.
const brandHtml = () => ({
  name: 'brand-html',
  transformIndexHtml: {
    order: 'pre',
    handler: (html) =>
      Object.entries(tokens).reduce((out, [token, value]) => out.replaceAll(token, value), html),
  },
})

export default defineConfig({
  plugins: [react(), brandHtml(), brandPwa()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.js',
    css: false,
  },
})
