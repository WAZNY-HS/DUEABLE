import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import brand from './src/config/brand.js'

const faviconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${brand.colors.accent}"/><stop offset="1" stop-color="${brand.colors.accentPartner}"/></linearGradient></defs><rect width="32" height="32" rx="9" fill="url(#g)"/><path d="${brand.logoPath}" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>`

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
  plugins: [react(), brandHtml()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.js',
    css: false,
  },
})
