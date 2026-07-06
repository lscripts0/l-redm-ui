import { useEffect, useState } from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import type { SxProps } from '@mui/material/styles'
import { colors, fonts } from '../theme'
import { useNuiEvent } from '../lib/nui'
import { slideVariant } from '../lib/slide'
import type { HoldTextUIData } from '../types'

interface HoldTextUIProps {
  data: HoldTextUIData
  hiding: boolean
}

export default function HoldTextUI({ data, hiding }: HoldTextUIProps) {
  const [shown, setShown] = useState(false)
  const [progress, setProgress] = useState(0)
  const variant = slideVariant(data.position, 'bottom-right')

  useNuiEvent<{ value: number }>('textui-hold:progress', (event) => setProgress(Math.min(event.value, 1)))

  useEffect(() => {
    const raf = requestAnimationFrame(() => setShown(true))
    return () => cancelAnimationFrame(raf)
  }, [])

  const visible = shown && !hiding

  return (
    <Box
      sx={{
        position: 'absolute',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        px: '0.65rem',
        py: '0.35rem',
        background: colors.panel,
        border: `var(--hairline) solid ${colors.panelEdge}`,
        borderRadius: '0.15rem',
        boxShadow: colors.innerGlow,
        transform: visible ? variant.rest : variant.hidden,
        opacity: visible ? 1 : 0,
        transition: 'transform 250ms ease-out, opacity 250ms ease-out',
        ...variant.anchor
      } as SxProps}
    >
      <Box
        sx={{
          position: 'relative',
          width: '1.2rem',
          height: '1.2rem',
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: 'var(--hairline) solid rgba(255, 255, 255, 0.8)',
          borderRadius: '0.15rem',
          backgroundColor: 'rgba(0, 0, 0, 0.55)',
          overflow: 'hidden'
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 0,
            height: `${progress * 100}%`,
            background: 'rgba(255, 255, 255, 0.35)',
            transition: 'height 80ms linear'
          }}
        />
        <Typography
          sx={{
            position: 'relative',
            fontFamily: fonts.display,
            fontWeight: 400,
            fontSize: '0.7rem',
            color: '#ffffff'
          }}
        >
          {data.key}
        </Typography>
      </Box>
      <Typography sx={{ fontSize: '0.82rem', color: colors.text, whiteSpace: 'nowrap' }}>{data.text}</Typography>
    </Box>
  )
}
