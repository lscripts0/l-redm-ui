import { createTheme } from '@mui/material/styles'

export const colors = {
  text: '#f2f2f2',
  textDim: 'rgba(242, 242, 242, 0.55)',
  accent: '#ffffff',
  line: 'rgba(255, 255, 255, 0.5)',
  panel: 'rgba(6, 6, 6, 0.82)',
  panelEdge: 'rgba(255, 255, 255, 0.15)',
  innerGlow: 'inset 0 0 1.7vh rgba(255, 255, 255, 0.15)'
}

export const fonts = {
  body: '"Zilla Slab", "Times New Roman", serif',
  display: '"Graduate", "Times New Roman", serif'
}

export const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: colors.text },
    text: { primary: colors.text, secondary: colors.textDim },
    background: { default: 'transparent', paper: colors.panel }
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
