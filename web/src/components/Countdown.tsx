import { useEffect, useState } from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { colors, fonts } from '../theme'
import type { CountdownData } from '../types'

interface CountdownProps {
  data: CountdownData
  hiding: boolean
}

function format(seconds: number) {
  const minutes = Math.floor(seconds / 60)
  const rest = seconds % 60
  return `${String(minutes).padStart(2, '0')}:${String(rest).padStart(2, '0')}`
}

export default function Countdown({ data, hiding }: CountdownProps) {
  const [shown, setShown] = useState(false)
  const label = data.value > 0 ? format(data.value) : data.text ?? ''

  useEffect(() => {
    const raf = requestAnimationFrame(() => setShown(true))
    return () => cancelAnimationFrame(raf)
  }, [])

  const visible = shown && !hiding

  return (
    <Box
      sx={{
        position: 'absolute',
        top: '1.1rem',
        left: '50%',
        transform: visible ? 'translateX(-50%)' : 'translateX(-50%) translateY(-1.4rem)',
        opacity: visible ? 1 : 0,
        transition: 'transform 300ms ease-out, opacity 300ms ease-out',
        display: 'flex',
        justifyContent: 'center'
      }}
    >
      <Typography
        sx={{
          fontFamily: fonts.display,
          fontWeight: 400,
          fontSize: '2.6rem',
          lineHeight: 1,
          color: colors.text,
          textShadow: '0 0.1rem 0.6rem rgba(0, 0, 0, 0.85)'
        }}
      >
        {label}
      </Typography>
    </Box>
  )
}
