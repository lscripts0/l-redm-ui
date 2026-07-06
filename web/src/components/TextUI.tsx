import { useEffect, useState } from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import type { SxProps } from '@mui/material/styles'
import { colors, fonts } from '../theme'
import { slideVariant } from '../lib/slide'
import type { TextUIData } from '../types'

interface TextUIProps {
  data: TextUIData
  hiding: boolean
}

export default function TextUI({ data, hiding }: TextUIProps) {
  const [shown, setShown] = useState(false)
  const variant = slideVariant(data.position, 'bottom-right')

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
      {data.key && (
        <Box
          sx={{
            width: '1.2rem',
            height: '1.2rem',
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: 'var(--hairline) solid rgba(255, 255, 255, 0.8)',
            borderRadius: '0.15rem',
            backgroundColor: 'rgba(0, 0, 0, 0.55)'
          }}
        >
          <Typography sx={{ fontFamily: fonts.display, fontWeight: 400, fontSize: '0.7rem', color: '#ffffff' }}>
            {data.key}
          </Typography>
        </Box>
      )}
      <Typography sx={{ fontSize: '0.82rem', color: colors.text, whiteSpace: 'nowrap' }}>{data.text}</Typography>
    </Box>
  )
}
