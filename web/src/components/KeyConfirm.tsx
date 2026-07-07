import { useEffect, useState } from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { colors, fonts } from '../theme'
import { useNuiEvent } from '../lib/nui'
import type { KeyConfirmData } from '../types'
import CornerOrnaments from './CornerOrnaments'

interface KeyConfirmProps {
  data: KeyConfirmData
  hiding: boolean
}

function KeyRow({ label, text, fill }: { label: string; text: string; fill: number }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
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
            height: `${fill * 100}%`,
            background: 'rgba(255, 255, 255, 0.35)',
            transition: 'height 80ms linear'
          }}
        />
        <Typography
          sx={{ position: 'relative', fontFamily: fonts.display, fontWeight: 400, fontSize: '0.7rem', color: '#ffffff' }}
        >
          {label}
        </Typography>
      </Box>
      <Typography sx={{ fontFamily: fonts.body, fontSize: '0.78rem', color: colors.textDim }}>{text}</Typography>
    </Box>
  )
}

export default function KeyConfirm({ data, hiding }: KeyConfirmProps) {
  const [shown, setShown] = useState(false)
  const [remaining, setRemaining] = useState(1)
  const [fills, setFills] = useState({ accept: 0, decline: 0 })
  const side = data.position === 'left' ? 'left' : 'right'

  useNuiEvent<{ key: 'accept' | 'decline'; value: number }>('keyconfirm:hold', (event) =>
    setFills((prev) => ({ ...prev, [event.key]: Math.min(event.value, 1) }))
  )

  useEffect(() => {
    const raf = requestAnimationFrame(() => setShown(true))
    const start = performance.now()
    const interval = window.setInterval(() => {
      const value = Math.max(1 - (performance.now() - start) / data.duration, 0)
      setRemaining(value)
      if (value <= 0) window.clearInterval(interval)
    }, 40)
    return () => {
      cancelAnimationFrame(raf)
      window.clearInterval(interval)
    }
  }, [])

  const visible = shown && !hiding
  const offscreen = side === 'left' ? 'translateX(calc(-100% - 1.5rem))' : 'translateX(calc(100% + 1.5rem))'

  return (
    <Box
      sx={{
        position: 'absolute',
        top: '50%',
        [side]: '1rem',
        minWidth: '13.5rem',
        maxWidth: '20rem',
        width: 'max-content',
        transform: visible ? 'translateY(-50%)' : `translateY(-50%) ${offscreen}`,
        opacity: visible ? 1 : 0,
        transition: 'transform 250ms ease-out, opacity 250ms ease-out',
        px: '0.8rem',
        pt: '0.6rem',
        pb: '0.7rem',
        background: `linear-gradient(180deg, rgba(16, 16, 16, 0.55), rgba(0, 0, 0, 0.25)), ${colors.panel}`,
        border: `var(--hairline) dashed ${colors.panelEdge}`,
        borderRadius: '0.15rem',
        boxShadow: `${colors.innerGlow}, 0 0.4rem 2.2rem rgba(0, 0, 0, 0.55)`,
        overflow: 'hidden'
      }}
    >
      <CornerOrnaments />
      <Typography
        sx={{
          fontFamily: fonts.body,
          fontSize: '0.85rem',
          color: colors.text,
          lineHeight: 1.35,
          textAlign: 'center',
          mb: '0.5rem'
        }}
      >
        {data.text}
      </Typography>
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.9rem' }}>
        <KeyRow label={data.acceptLabel ?? 'E'} text={data.acceptText ?? 'Accept'} fill={fills.accept} />
        {data.hasDecline && (
          <KeyRow label={data.declineLabel ?? ''} text={data.declineText ?? 'Decline'} fill={fills.decline} />
        )}
      </Box>
      <Box
        sx={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          height: '0.12rem',
          width: `${remaining * 100}%`,
          background: 'rgba(255, 255, 255, 0.55)'
        }}
      />
    </Box>
  )
}
