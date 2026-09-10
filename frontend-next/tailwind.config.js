/** @type {import('tailwindcss').Config} */
module.exports = {
  // Scope Tailwind to our own markup. PrimeReact / primeflex keep their own styling.
  content: [
    './src/app/**/*.{js,jsx,ts,tsx}',
    './src/components/**/*.{js,jsx,ts,tsx}',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  // IMPORTANT: Tailwind's Preflight reset is disabled so it does NOT clobber
  // PrimeReact / primeflex base styles. The app ships its own reset in globals.css.
  corePlugins: {
    preflight: false,
  },
  theme: {
    extend: {
      colors: {
        // Mapped 1:1 to the existing :root design tokens so colours stay identical.
        primary: 'var(--color-primary)',
        'primary-accent': '#1a73e8',
        'primary-accent-hover': '#1557b0',
        secondary: 'var(--color-secondary)',
        white: 'var(--color-white)',
        'dark-grey': 'var(--color-dark-grey)',
        'breadcrumb-bold': 'var(--color-bold-breadcrumb)',
        'breadcrumb-normal': 'var(--color-normal-breadcrumb)',
        green: 'var(--color-green)',
        warning: 'var(--color-warning)',
        red: 'var(--color-red)',
        'red-validation': 'var(--color-red-validation)',
        hover: 'var(--hover-color)',
        'bg-grey': 'var(--bg-grey)',
        'disable-bg': 'var(--disable-bg)',
        'warning-bg': 'var(--warning-bg)',
        'chat-status': 'var(--chat-status)',
        'bg-light': 'var(--bg-light-color)',
        'bg-chat': 'var(--bg-chat)',
        'border-btn-secondary': 'var(--border-btn-secondary)',
        'border-primary': 'var(--border-primary)',
        'border-secondary': 'var(--border-secondary)',
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'Arial Nova', 'Arial', 'Helvetica', 'sans-serif'],
        condensed: ['Arial Nova Condensed', 'Arial Narrow', 'sans-serif'],
      },
      fontSize: {
        // Fluid type scale already defined as CSS vars in globals.css.
        'fluid-xs': 'var(--fs-xs)',
        'fluid-sm': 'var(--fs-sm)',
        'fluid-md': 'var(--fs-md)',
        'fluid-lg': 'var(--fs-lg)',
        'fluid-xl': 'var(--fs-xl)',
        'fluid-2xl': 'var(--fs-2xl)',
      },
      borderRadius: {
        dialog: 'var(--border-radius-dialog)',
        submit: 'var(--border-radius-submit-btn)',
        field: 'var(--border-radius-form-fields)',
      },
      maxWidth: {
        container: 'var(--container-max)',
      },
    },
  },
  plugins: [],
};
