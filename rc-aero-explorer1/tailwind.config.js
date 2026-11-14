export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: { extend: {
    colors: { ink: '#0a0f1e', volt: '#2ea8ff', amber: '#ff8a1f' },
    fontFamily: { mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'], sans: ['"IBM Plex Sans"', 'system-ui', 'sans-serif'] },
  } },
  plugins: [],
}
