import { useEffect, useState } from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { colors, fonts } from '../theme'
import type { AnnounceData } from '../types'
import CornerOrnaments from './CornerOrnaments'

interface AnnounceProps {
  data: AnnounceData
  onDone: () => void
}

export default function Announce({ data, onDone }: AnnounceProps) {
  const [shown, setShown] = useState(false)
  const duration = data.duration && data.duration > 0 ? data.duration : 5000

  useEffect(() => {
    const raf = requestAnimationFrame(() => setShown(true))
    const hide = setTimeout(() => setShown(false), duration)
    const done = setTimeout(onDone, duration + 350)
    return () => {
      cancelAnimationFrame(raf)
      clearTimeout(hide)
      clearTimeout(done)
    }
  }, [])

  return (
    <Box
      sx={{
        position: 'absolute',
        top: '1.1rem',
        left: '50%',
        transform: shown ? 'translateX(-50%)' : 'translateX(-50%) translateY(-0.6rem)',
        opacity: shown ? 1 : 0,
        transition: 'opacity 300ms ease-out, transform 300ms ease-out',
        minWidth: '20rem',
        maxWidth: '36rem',
        px: '1.8rem',
        py: '0.4rem',
        background: `linear-gradient(180deg, rgba(16, 16, 16, 0.55), rgba(0, 0, 0, 0.25)), ${colors.panel}`,
        border: `var(--hairline) dashed ${colors.panelEdge}`,
        borderRadius: '0.15rem',
        boxShadow: `${colors.innerGlow}, 0 0.4rem 2.2rem rgba(0, 0, 0, 0.55)`,
        textAlign: 'center'
      }}
    >
      <CornerOrnaments />
      <Typography
        sx={{
          fontFamily: fonts.display,
          fontWeight: 400,
          fontSize: '1.05rem',
          textTransform: 'uppercase',
          color: colors.text,
          lineHeight: 1.25,
          mt: '0.15rem',
          mb: data.subtitle ? '0.15rem' : '0.15rem'
        }}
      >
        {data.title}
      </Typography>
      {data.subtitle && (
        <>
          <Box
            sx={{
              height: 'var(--hairline)',
              background: 'rgba(255, 255, 255, 0.25)',
              mx: '5rem',
              mb: '0.2rem'
            }}
          />
          <Typography
            sx={{
              fontSize: '0.72rem',
              fontStyle: 'italic',
              color: colors.textDim,
              mb: '0.25rem'
            }}
          >
            {data.subtitle}
          </Typography>
        </>
      )}
    </Box>
  )
}
