import Box from '@mui/material/Box'
import { colors } from '../theme'

export default function Ornament() {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: '0.5rem', px: '0.7rem', my: '0.45rem' }}>
      <Box
        sx={{ flex: 1, height: 'var(--hairline)', background: `linear-gradient(90deg, transparent, ${colors.line})` }}
      />
      <Box sx={{ width: '0.32rem', height: '0.32rem', transform: 'rotate(45deg)', border: `var(--hairline) solid ${colors.line}` }} />
      <Box
        sx={{ flex: 1, height: 'var(--hairline)', background: `linear-gradient(270deg, transparent, ${colors.line})` }}
      />
    </Box>
  )
}
