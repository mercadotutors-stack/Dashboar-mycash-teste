/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // Tokens Semânticos (do Design System)
      colors: {
        // Cores semânticas
        'bg-primary': 'var(--color-bg-primary)',
        'bg-secondary': 'var(--color-bg-secondary)',
        'primary': 'var(--color-primary)',
        'secondary': 'var(--color-secondary)',
        'danger': 'var(--color-danger)',
        'text-primary': 'var(--color-text-primary)',
        'text-secondary': 'var(--color-text-secondary)',
        'border': 'var(--color-border)',
        'accent-receita': 'var(--color-accent-receita)',
        'accent-despesa': 'var(--color-accent-despesa)',
        
        // Cores de marca
        'brand-nubank': 'var(--color-brand-nubank)',
        'brand-inter': 'var(--color-brand-inter)',
        'brand-picpay': 'var(--color-brand-picpay)',
      },
      spacing: {
        // Espaçamentos semânticos
        'page': 'var(--spacing-page)',
        'section': 'var(--spacing-section)',
        'card': 'var(--spacing-card)',
        'grid': 'var(--spacing-grid)',
        'item': 'var(--spacing-item)',
        
        // Espaçamentos primitivos
        'xs': 'var(--spacing-xs)',
        'sm': 'var(--spacing-sm)',
        'md': 'var(--spacing-md)',
        'lg': 'var(--spacing-lg)',
        'xl': 'var(--spacing-xl)',
        '2xl': 'var(--spacing-2xl)',
      },
      borderRadius: {
        'sm': 'var(--border-radius-sm)',
        'md': 'var(--border-radius-md)',
        'lg': 'var(--border-radius-lg)',
        'full': 'var(--border-radius-full)',
      },
      fontFamily: {
        'sans': 'var(--font-family-sans)',
      },
      fontSize: {
        'heading-xl': 'var(--font-size-heading-xl)',
        'heading-lg': 'var(--font-size-heading-lg)',
        'heading-md': 'var(--font-size-heading-md)',
        'body': 'var(--font-size-body)',
        'caption': 'var(--font-size-caption)',
        'small': 'var(--font-size-small)',
      },
      fontWeight: {
        'regular': 'var(--font-weight-regular)',
        'medium': 'var(--font-weight-medium)',
        'semibold': 'var(--font-weight-semibold)',
        'bold': 'var(--font-weight-bold)',
      },
      screens: {
        'md': '768px',   // Tablet
        'lg': '1280px',  // Desktop
        'xl': '1920px',  // Wide / 4K
      },
    },
  },
  plugins: [],
}
