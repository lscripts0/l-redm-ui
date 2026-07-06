import { useEffect, useState } from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { colors, fonts } from '../theme'
import { isEnvBrowser, useNuiEvent } from '../lib/nui'
import type { WarnData } from '../types'
import CornerOrnaments from './CornerOrnaments'
import Ornament from './Ornament'

interface WarnProps {
  data: WarnData
  hiding: boolean
  onDone: () => void
}

export default function Warn({ data, hiding, onDone }: WarnProps) {
  const [shown, setShown] = useState(false)
  const [progress, setProgress] = useState(0)

  useNuiEvent<{ value: number }>('warn:progress', (event) => setProgress(Math.min(event.value, 1)))

  useEffect(() => {
    const raf = requestAnimationFrame(() => setShown(true))
    return () => cancelAnimationFrame(raf)
  }, [])

  useEffect(() => {
    if (hiding) setShown(false)
  }, [hiding])

  useEffect(() => {
    if (!isEnvBrowser()) return
    let interval: number | null = null
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Enter' || interval !== null) return
      interval = window.setInterval(() => setProgress((value) => Math.min(value + 0.02, 1)), 100)
    }
    const onKeyUp = (event: KeyboardEvent) => {
      if (event.key !== 'Enter' || interval === null) return
      window.clearInterval(interval)
      interval = null
      setProgress(0)
    }
    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
      if (interval !== null) window.clearInterval(interval)
    }
  }, [])

  useEffect(() => {
    if (isEnvBrowser() && progress >= 1) onDone()
  }, [progress])

  return (
    <Box
      sx={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'radial-gradient(ellipse at center, rgba(0, 0, 0, 0.78), rgba(0, 0, 0, 0.92))',
        opacity: shown ? 1 : 0,
        transition: 'opacity 250ms ease-out'
      }}
    >
      <Box
        sx={{
          position: 'relative',
          width: '24rem',
          px: '1.8rem',
          py: '1rem',
          background: `linear-gradient(180deg, rgba(16, 16, 16, 0.55), rgba(0, 0, 0, 0.25)), ${colors.panel}`,
          border: `var(--hairline) solid ${colors.panelEdge}`,
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
            fontSize: '1.3rem',
            textTransform: 'uppercase',
            color: colors.text,
            lineHeight: 1.2
          }}
        >
          {data.title ?? 'Warning'}
        </Typography>
        <Ornament />
        <Typography sx={{ fontSize: '0.85rem', color: colors.text, lineHeight: 1.4 }}>{data.message}</Typography>
        {data.author && (
          <Typography sx={{ fontSize: '0.72rem', fontStyle: 'italic', color: colors.textDim, mt: '0.3rem' }}>
            {data.author}
          </Typography>
        )}
        <Box sx={{ mt: '0.9rem' }}>
          <Typography
            sx={{
              fontFamily: fonts.display,
              fontSize: '0.62rem',
              textTransform: 'uppercase',
              color: colors.textDim,
              mb: '0.3rem'
            }}
          >
            {data.holdLabel ?? 'Hold ENTER to acknowledge'}
          </Typography>
          <Box sx={{ height: '0.22rem', background: 'rgba(255, 255, 255, 0.15)', borderRadius: '0.1rem', overflow: 'hidden' }}>
            <Box
              sx={{
                height: '100%',
                width: `${progress * 100}%`,
                background: 'rgba(255, 255, 255, 0.75)',
                transition: 'width 80ms linear'
              }}
            />
          </Box>
        </Box>
      </Box>
    </Box>
  )
}
