/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './app/**/*.{vue,js,ts,jsx,tsx}',
    './components/**/*.{vue,js,ts,jsx,tsx}',
    './layouts/**/*.vue',
    './pages/**/*.vue',
    './plugins/**/*.{js,ts}',
    './nuxt.config.{js,ts}',
    './app.vue'
  ],
  theme: {
    extend: {
      colors: {
        "surface-variant": "#34343d",
        "outline-variant": "rgba(70, 69, 84, 0.3)", // Match Stitch's border styling
        "on-primary": "#1000a9",
        "surface-container-high": "#292932",
        "surface-container": "#1f1f27",
        "inverse-primary": "#494bd6",
        "surface-container-highest": "#34343d",
        "error-container": "#93000a",
        "on-tertiary-fixed": "#2a1700",
        "primary-fixed": "#e1e0ff",
        "on-error": "#690005",
        "tertiary": "#ffb95f",
        "surface-bright": "#393841",
        "on-surface-variant": "#c7c4d7",
        "secondary": "#4edea3",
        "error": "#ffb4ab",
        "primary-container": "#8083ff",
        "tertiary-fixed": "#ffddb8",
        "on-primary-fixed": "#07006c",
        "on-primary-container": "#0d0096",
        "on-primary-fixed-variant": "#2f2ebe",
        "on-secondary-fixed": "#002113",
        "on-tertiary-container": "#3e2400",
        "on-tertiary": "#472a00",
        "surface-dim": "#13131b",
        "on-error-container": "#ffdad6",
        "surface": "#13131b",
        "surface-container-lowest": "#0d0d15",
        "on-surface": "#e4e1ed",
        "secondary-fixed": "#6ffbbe",
        "on-secondary-container": "#00311f",
        "inverse-surface": "#e4e1ed",
        "primary": "#c0c1ff",
        "tertiary-container": "#ca8100",
        "primary-fixed-dim": "#c0c1ff",
        "on-tertiary-fixed-variant": "#653e00",
        "inverse-on-surface": "#303038",
        "tertiary-fixed-dim": "#ffb95f",
        "on-secondary": "#003824",
        "secondary-container": "#00a572",
        "surface-tint": "#c0c1ff",
        "on-secondary-fixed-variant": "#005236",
        "background": "#13131b",
        "secondary-fixed-dim": "#4edea3",
        "on-background": "#e4e1ed",
        "outline": "#908fa0",
        "surface-container-low": "#1b1b23"
      },
      borderRadius: {
        "DEFAULT": "0.25rem",
        "lg": "0.5rem",
        "xl": "0.75rem",
        "full": "9999px"
      },
      spacing: {
        "unit": "4px",
        "sidebar-width": "280px",
        "container-margin": "24px",
        "card-padding": "20px",
        "gutter": "16px"
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'ui-sans-serif', 'system-ui'],
        headline: ['"Plus Jakarta Sans"', 'sans-serif'],
        display: ['"Plus Jakarta Sans"', 'sans-serif'],
        numeric: ['"Plus Jakarta Sans"', 'monospace']
      }
    }
  },
  plugins: [
    require('@tailwindcss/forms')
  ]
}
