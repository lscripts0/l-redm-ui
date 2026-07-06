import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ThemeProvider } from '@mui/material/styles'
import GlobalStyles from '@mui/material/GlobalStyles'
import './assets/fonts/fonts.css'
import '@fortawesome/fontawesome-free/css/fontawesome.css'
import '@fortawesome/fontawesome-free/css/solid.css'
import '@fortawesome/fontawesome-free/css/regular.css'
import { theme } from './theme'
import App from './App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider theme={theme}>
      <GlobalStyles
        styles={{
          ':root': { '--hairline': 'max(1px, calc(100vh / 1080))' },
          html: { fontSize: 'calc(100vh / 54)' },
          body: {
            margin: 0,
            padding: 0,
            background: 'transparent',
            overflow: 'hidden',
            userSelect: 'none'
          },
          '*': { boxSizing: 'border-box' }
        }}
      />
      <App />
    </ThemeProvider>
  </StrictMode>
)
