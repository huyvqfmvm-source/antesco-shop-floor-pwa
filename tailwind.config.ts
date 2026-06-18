/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  safelist: [
    {
      pattern: /^(bg|text|border)-ant-(sx|nk|xk|qm|success|warning|error|offline|sync)(\/(5|8|10|15|20|30|40|50|60))?$/,
    },
    {
      pattern: /^shadow-ant-(sx|nk|xk|qm|success|warning|error|offline|sync)(\/(15|30|40))?$/,
    },
  ],
  theme: {
    extend: {
      colors: {
        'ant-sx': '#16A34A',
        'ant-sx-light': '#DCFCE7',
        'ant-sx-dark': '#15803D',
        'ant-nk': '#2563EB',
        'ant-nk-light': '#DBEAFE',
        'ant-nk-dark': '#1D4ED8',
        'ant-xk': '#F97316',
        'ant-xk-light': '#FFF7ED',
        'ant-xk-dark': '#EA580C',
        'ant-qm': '#374151',
        'ant-qm-light': '#F3F4F6',
        'ant-qm-dark': '#1F2937',
        'ant-success': '#16A34A',
        'ant-warning': '#F59E0B',
        'ant-error': '#DC2626',
        'ant-offline': '#7C3AED',
        'ant-sync': '#0EA5E9',
        'ant-bg': '#F6F8FA',
        'ant-card': '#FFFFFF',
        'ant-text': '#111827',
        'ant-text-secondary': '#6B7280',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      maxWidth: {
        'mobile': '430px',
      },
      fontSize: {
        'xxs': '0.6875rem',
      },
    },
  },
  plugins: [],
}
