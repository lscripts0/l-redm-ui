import Box from '@mui/material/Box'
import { colors } from '../theme'

const SIZE = '0.75rem'
const INSET = '0.28rem'
const LINE = `var(--hairline) solid ${colors.line}`

const corners = [
  { top: INSET, left: INSET, borderTop: LINE, borderLeft: LINE },
  { top: INSET, right: INSET, borderTop: LINE, borderRight: LINE },
  { bottom: INSET, left: INSET, borderBottom: LINE, borderLeft: LINE },
  { bottom: INSET, right: INSET, borderBottom: LINE, borderRight: LINE }
]

export default function CornerOrnaments() {
  return (
    <>
      {corners.map((corner, index) => (
        <Box
          key={index}
          sx={{
            position: 'absolute',
            width: SIZE,
            height: SIZE,
            pointerEvents: 'none',
            ...corner
          }}
        />
      ))}
    </>
  )
}
