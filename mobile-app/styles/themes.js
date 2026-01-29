// styles/themes.js

const common = {
  // Colors that stay the same in both modes
  errorBg: 'rgba(217, 48, 37, 0.1)',
  errorText: '#d93025',
};

const light = {
  ...common,
  bgMain: '#f8fafd',        // var(--bg-main)
  bgPrimary: '#ffffff',     // var(--bg-primary)
  bgForm: '#ffffff',        // var(--bg-form)
  bgHover: '#f1f3f4',       // var(--bg-hover)
  
  textMain: '#202124',      // var(--text-main)
  textSecondary: '#5f6368', // var(--text-secondary)
  textDisabled: '#9aa0a6',  // var(--text-disabled)
  
  borderSubtle: '#dadce0',  // var(--border-subtle)
  brandBlue: '#1a73e8',     // var(--brand-blue)
  
  inputPlaceholder: '#5f6368',
};

const dark = {
  ...common,
  bgMain: '#2d2f31',        // var(--bg-main) [Slate]
  bgPrimary: '#37393b',     // var(--bg-primary)
  bgForm: '#3c3e42',        // var(--bg-form)
  bgHover: '#505257',       // var(--bg-hover)
  
  textMain: '#f1f3f4',      // var(--text-main) [Near white]
  textSecondary: '#dfe1e5', // var(--text-secondary)
  textDisabled: '#9aa0a6',  // var(--text-disabled)
  
  borderSubtle: '#5f6368',  // var(--border-subtle)
  brandBlue: '#c7d0e0',     // var(--brand-blue) [Pastel]
  
  inputPlaceholder: '#9aa0a6',
};

export default { light, dark };