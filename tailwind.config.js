/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    container: {
      center: true,
      padding: { DEFAULT: '1rem', sm: '1.5rem', lg: '2rem' },
      screens: { '2xl': '1400px' },
    },
    extend: {
      colors: {
        // Brand palette
        gold: {
          DEFAULT: '#C9A84C',
          50:  '#FDF8EC',
          100: '#FAF0D0',
          200: '#F4DFA1',
          300: '#EDCC6E',
          400: '#E6BA44',
          500: '#C9A84C',
          600: '#A88A36',
          700: '#836C28',
          800: '#5E4E1C',
          900: '#3A3010',
        },
        navy: {
          DEFAULT: '#1A1A2E',
          50:  '#E8E8F0',
          100: '#C5C5D8',
          200: '#9393B5',
          300: '#626291',
          400: '#3D3D6A',
          500: '#1A1A2E',
          600: '#151528',
          700: '#101020',
          800: '#0A0A18',
          900: '#050510',
        },
        cream: {
          DEFAULT: '#F5F0E8',
          50:  '#FFFFFF',
          100: '#FDFCF9',
          200: '#FAF8F3',
          300: '#F8F4EE',
          400: '#F5F0E8',
          500: '#EDE5D4',
          600: '#E0D4BC',
          700: '#CEBFA0',
          800: '#BAA77E',
          900: '#9F8A5C',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
      },
      fontFamily: {
        serif: ['Playfair Display', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'display-2xl': ['4.5rem', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
        'display-xl':  ['3.75rem', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
        'display-lg':  ['3rem',    { lineHeight: '1.2', letterSpacing: '-0.01em' }],
        'display-md':  ['2.25rem', { lineHeight: '1.2', letterSpacing: '-0.01em' }],
        'display-sm':  ['1.875rem', { lineHeight: '1.3' }],
        'display-xs':  ['1.5rem',   { lineHeight: '1.3' }],
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'fade-in': {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        shimmer: 'shimmer 2s infinite linear',
        'fade-in': 'fade-in 0.3s ease-out',
      },
      backgroundImage: {
        'gold-gradient': 'linear-gradient(135deg, #C9A84C 0%, #E6BA44 50%, #C9A84C 100%)',
        'navy-gradient': 'linear-gradient(135deg, #1A1A2E 0%, #2D2D4E 100%)',
        shimmer: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.4) 50%, transparent 100%)',
      },
      boxShadow: {
        gold: '0 4px 24px -4px rgba(201,168,76,0.4)',
        'gold-lg': '0 8px 40px -8px rgba(201,168,76,0.5)',
        navy: '0 4px 24px -4px rgba(26,26,46,0.3)',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}
