import brand from './brand'

/**
 * Overrides the default palette in index.css with the values from brand.js,
 * so re-branding only requires editing that one file.
 */
export function applyBrand() {
  const { accent, accentPartner, success, overdue, bgLight, bgDark } = brand.colors
  const style = document.createElement('style')
  style.id = 'brand-vars'
  style.textContent = `
:root{--accent:${accent};--accent-2:${accentPartner};--success:${success};--overdue:${overdue};--bg:${bgLight}}
[data-theme="dark"]{--bg:${bgDark}}`
  document.head.appendChild(style)
}
