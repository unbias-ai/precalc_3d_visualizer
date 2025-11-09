module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,html}'],
  theme: {
    extend: {
      colors: {
        bg: '#070707',
        panel: '#0f1113',
        cyan: '#00e5ff',
        magenta: '#ff2dd4',
        accent: '#7cf47c',
        orange: '#ff8a00',
      },
      fontFamily: {
        mono: ['Iosevka', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      boxShadow: {
        glow: '0 6px 24px rgba(0,229,255,0.08), 0 2px 8px rgba(255,45,212,0.04)',
      },
      borderRadius: {
        'xl-tilt': '12px',
      },
    },
  },
  plugins: [],
};
