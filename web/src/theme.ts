import { createTheme } from '@mui/material/styles'

export const colors = {
  text: 'var(--ui-text, #f2f2f2)',
  textDim: 'var(--ui-text-dim, rgba(242, 242, 242, 0.55))',
  accent: 'var(--ui-accent, #ffffff)',
  line: 'var(--ui-line, rgba(255, 255, 255, 0.5))',
  panel: 'var(--ui-panel, rgba(6, 6, 6, 0.82))',
  panelEdge: 'var(--ui-panel-edge, rgba(255, 255, 255, 0.15))',
  highlight: 'var(--ui-highlight, rgba(255, 255, 255, 0.75))',
  success: 'var(--ui-success, #43ff36)',
  successGlow: 'var(--ui-success-glow, rgba(67, 255, 54, 0.25))',
  danger: 'var(--ui-danger, #ff3636)',
  dangerGlow: 'var(--ui-danger-glow, rgba(255, 54, 54, 0.25))',
  innerGlow: 'inset 0 0 1.7vh var(--ui-glow, rgba(255, 255, 255, 0.15))'
}

export const fonts = {
  body: '"Zilla Slab", "Times New Roman", serif',
  display: '"Graduate", "Times New Roman", serif'
}

export const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#f2f2f2' },
    text: { primary: '#f2f2f2', secondary: 'rgba(242, 242, 242, 0.55)' },
    background: { default: 'transparent', paper: 'rgba(6, 6, 6, 0.82)' }
  },
  typography: {
    fontFamily: fonts.body,
    button: {
      fontFamily: fonts.display,
      fontWeight: 400,
      letterSpacing: 'normal',
      textTransform: 'uppercase'
    }
  },
  components: {
    MuiButtonBase: {
      defaultProps: { disableRipple: true }
    }
  }
})
