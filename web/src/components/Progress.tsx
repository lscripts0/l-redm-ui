import { useEffect, useState } from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import type { SxProps } from '@mui/material/styles'
import { colors, fonts } from '../theme'
import { isEnvBrowser } from '../lib/nui'
import type { ProgressData } from '../types'

interface ProgressProps {
  data: ProgressData
  onDone: () => void
}

const positionSx: Record<string, SxProps> = {
  'top-left': { left: '3rem', top: '2.6rem' },
  'top-center': { left: '50%', top: '2.6rem', transform: 'translateX(-50%)' },
  'top-right': { right: '3rem', top: '2.6rem' },
  'left-center': { left: '3rem', top: '50%', transform: 'translateY(-50%)' },
  'right-center': { right: '3rem', top: '50%', transform: 'translateY(-50%)' },
  'bottom-left': { left: '3rem', bottom: '2.6rem' },
  'bottom-center': { left: '50%', bottom: '2.6rem', transform: 'translateX(-50%)' },
  'bottom-right': { right: '3rem', bottom: '2.6rem' }
}

const textShadow = '0 var(--hairline) 0.2rem rgba(0, 0, 0, 0.9)'

function CancelHint({ label }: { label: string }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem', mt: '0.35rem' }}>
      <Box
        sx={{
          width: '0.85rem',
          height: '0.85rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: 'var(--hairline) solid rgba(255, 255, 255, 0.55)',
          borderRadius: '0.12rem',
          backgroundColor: 'rgba(0, 0, 0, 0.55)'
        }}
      >
        <Typography sx={{ fontFamily: fonts.display, fontSize: '0.5rem', color: colors.text }}>{label}</Typography>
      </Box>
      <Typography
        sx={{
          fontFamily: fonts.display,
          fontSize: '0.52rem',
          textTransform: 'uppercase',
          color: colors.text,
          textShadow
        }}
      >
        Cancel
      </Typography>
    </Box>
  )
}

export default function Progress({ data, onDone }: ProgressProps) {
  const [progress, setProgress] = useState(0)
  const segments = data.segments && data.segments > 0 ? data.segments : 12
  const isCircle = data.progressType === 'circle'

  useEffect(() => {
    const start = performance.now()
    const interval = window.setInterval(() => {
      const value = Math.min((performance.now() - start) / data.duration, 1)
      setProgress(value)
      if (value >= 1) window.clearInterval(interval)
    }, 40)
    return () => window.clearInterval(interval)
  }, [])

  useEffect(() => {
    if (isEnvBrowser() && progress >= 1) {
      const timeout = setTimeout(onDone, 300)
      return () => clearTimeout(timeout)
    }
  }, [progress])

  const percent = Math.round(progress * 100)

  if (isCircle) {
    const circumference = 2 * Math.PI * 16
    return (
      <Box
        sx={{
          position: 'absolute',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          ...(positionSx[data.position ?? 'bottom-center'] ?? positionSx['bottom-center'])
        } as SxProps}
      >
        <Box sx={{ position: 'relative', width: '3.4rem', height: '3.4rem' }}>
          <Box component="svg" viewBox="0 0 36 36" sx={{ width: '100%', height: '100%' }}>
            <circle cx="18" cy="18" r="16" fill="rgba(0, 0, 0, 0.45)" stroke="rgba(255, 255, 255, 0.18)" strokeWidth="2.4" />
            <circle
              cx="18"
              cy="18"
              r="16"
              fill="none"
              stroke="rgba(255, 255, 255, 0.85)"
              strokeWidth="2.4"
              strokeDasharray={`${progress * circumference} ${circumference}`}
              transform="rotate(-90 18 18)"
            />
          </Box>
          <Typography
            sx={{
              position: 'absolute',
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)',
              fontFamily: fonts.display,
              fontSize: '0.72rem',
              color: colors.text
            }}
          >
            {percent}%
          </Typography>
        </Box>
        {data.label && (
          <Typography
            sx={{
              fontFamily: fonts.body,
              fontSize: '0.78rem',
              color: colors.text,
              textShadow,
              mt: '0.3rem'
            }}
          >
            {data.label}
          </Typography>
        )}
        {data.cancelLabel && <CancelHint label={data.cancelLabel} />}
      </Box>
    )
  }

  const filled = Math.round(progress * segments)

  return (
    <Box
      sx={{
        position: 'absolute',
        width: '13rem',
        ...(positionSx[data.position ?? 'bottom-center'] ?? positionSx['bottom-center'])
      } as SxProps}
    >
      <Box sx={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', mb: '0.25rem' }}>
        <Typography
          sx={{
            fontFamily: fonts.body,
            fontSize: '0.78rem',
            color: colors.text,
            textShadow,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            mr: '0.5rem'
          }}
        >
          {data.label ?? ''}
        </Typography>
        <Typography sx={{ fontFamily: fonts.display, fontSize: '0.68rem', color: colors.text, textShadow }}>
          {percent}%
        </Typography>
      </Box>
      <Box sx={{ display: 'flex', gap: '0.14rem' }}>
        {Array.from({ length: segments }, (_, index) => (
          <Box
            key={index}
            sx={{
              flex: 1,
              height: '0.38rem',
              borderRadius: '0.06rem',
              border: 'var(--hairline) solid rgba(255, 255, 255, 0.35)',
              background: index < filled ? 'rgba(255, 255, 255, 0.85)' : 'rgba(0, 0, 0, 0.45)',
              boxShadow: '0 var(--hairline) 0.2rem rgba(0, 0, 0, 0.6)'
            }}
          />
        ))}
      </Box>
      {data.cancelLabel && <CancelHint label={data.cancelLabel} />}
    </Box>
  )
}
