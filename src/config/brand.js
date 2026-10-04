// Single source of truth for branding. Edit this file to re-brand the app.
// Consumed by: Header/Logo/Footer, runtime CSS variables (applyBrand.js),
// and index.html (title, meta, favicon) through the plugin in vite.config.js.
const brand = {
  name: 'Dueable',
  tagline: 'Every deadline, doable.',
  description:
    'Dueable is a fast, mobile-first task manager for students. Every deadline, doable.',
  author: 'Shaffron Wazny',
  storageNamespace: 'dueable',
  colors: {
    accent: '#7C5CFF',
    accentPartner: '#FF7AC3',
    bgLight: '#F7F7FB',
    bgDark: '#0F0F1A',
    success: '#2DD4A0',
    overdue: '#FF6B6B',
  },
  // Checkmark inside a 32x32 box: short stroke, then a long stroke curving up like a flag.
  logoPath: 'M8.5 17.5 L12.8 21.6 C15.2 15.4 19 11 24.6 9.4',
}

export default brand
