/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Brand / Material primary palette
        primary: '#022448',
        'primary-container': '#1E3A5F',
        accent: '#0EA5E9',
        'on-primary': '#ffffff',
        'on-primary-container': '#8aa4cf',
        secondary: '#30628d',
        'secondary-container': '#9fceff',
        'on-secondary': '#ffffff',
        'on-secondary-container': '#245882',

        // Material surface scale
        surface: '#faf9fc',
        'surface-bright': '#faf9fc',
        'surface-dim': '#dad9dd',
        'surface-variant': '#e3e2e6',
        'surface-container-lowest': '#ffffff',
        'surface-container-low': '#f4f3f7',
        'surface-container': '#eeedf1',
        'surface-container-high': '#e9e7eb',
        'surface-container-highest': '#e3e2e6',
        background: '#faf9fc',
        'on-background': '#1a1c1e',
        'on-surface': '#1a1c1e',
        'on-surface-variant': '#43474e',
        outline: '#74777f',
        'outline-variant': '#c4c6cf',
        'inverse-surface': '#2f3033',
        'inverse-on-surface': '#f1f0f4',
        'inverse-primary': '#adc8f5',

        // Material error
        error: '#ba1a1a',
        'on-error': '#ffffff',
        'error-container': '#ffdad6',
        'on-error-container': '#93000a',

        // Neutral grey scale
        'grey-50': '#F8FAFC',
        'grey-100': '#F1F5F9',
        'grey-200': '#E2E8F0',
        'grey-300': '#CBD5E1',
        'grey-400': '#94A3B8',
        'grey-600': '#475569',
        'grey-800': '#1E293B',
        'grey-900': '#0F172A',

        // Semantic status colours
        'success-bg': '#F0FDF4',
        'success-text': '#166534',
        'success-border': '#86EFAC',

        'danger-bg': '#FEF2F2',
        'danger-text': '#991B1B',
        'danger-border': '#FCA5A5',

        'warning-bg': '#FFFBEB',
        'warning-text': '#92400E',
        'warning-border': '#FCD34D',

        'info-bg': '#EFF6FF',
        'info-text': '#1E40AF',
        'info-border': '#93C5FD',

        'escalated-bg': '#FAF5FF',
        'escalated-text': '#6B21A8',
        'escalated-border': '#C4B5FD',

        'orange-bg': '#FFF7ED',
        'orange-text': '#9A3412',
        'orange-border': '#FDBA74',
      },

      spacing: {
        xs: '4px',
        sm: '8px',
        md: '12px',
        lg: '16px',
        xl: '20px',
        '2xl': '24px',
        '3xl': '32px',
        '4xl': '48px',
      },

      borderRadius: {
        DEFAULT: '4px',
        lg: '8px',
        xl: '12px',
        '2xl': '16px',
        full: '9999px',
      },

      fontSize: {
        'display-title': ['32px', { lineHeight: '1.25', fontWeight: '700' }],
        'section-heading': ['20px', { lineHeight: '1.3', fontWeight: '600' }],
        'card-heading': ['16px', { lineHeight: '1.4', fontWeight: '600' }],
        'body-regular': ['14px', { lineHeight: '1.6', fontWeight: '400' }],
        'body-small': ['13px', { lineHeight: '1.5', fontWeight: '400' }],
        'label-overline': [
          '11px',
          { lineHeight: '1.0', fontWeight: '500', letterSpacing: '0.06em' },
        ],
        'mono-data': ['13px', { lineHeight: '1.0', fontWeight: '400' }],
      },

      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        'display-title': ['Inter', 'sans-serif'],
        'section-heading': ['Inter', 'sans-serif'],
        'card-heading': ['Inter', 'sans-serif'],
        'body-regular': ['Inter', 'sans-serif'],
        'body-small': ['Inter', 'sans-serif'],
        'label-overline': ['Inter', 'sans-serif'],
        'mono-data': ['monospace'],
      },

      boxShadow: {
        'login-card': '0 2px 4px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.10)',
        modal: '0 10px 25px -5px rgba(0,0,0,0.10), 0 8px 10px -6px rgba(0,0,0,0.10)',
        'sticky-bottom': '0 -4px 12px rgba(0,0,0,0.05)',
        card: '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)',
      },
    },
  },
  plugins: [],
}
