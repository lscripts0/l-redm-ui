import { useEffect, useState } from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import CheckCircleOutlined from '@mui/icons-material/CheckCircleOutlined'
import InfoOutlined from '@mui/icons-material/InfoOutlined'
import HighlightOffOutlined from '@mui/icons-material/HighlightOffOutlined'
import SupportAgentOutlined from '@mui/icons-material/SupportAgentOutlined'
import type { SxProps } from '@mui/material/styles'
import { colors, fonts } from '../theme'
import type { NotifyType, ToastItem } from '../types'

interface NotifyProps {
  toasts: ToastItem[]
  onDone: (id: number) => void
}

const stackSx: Record<string, SxProps> = {
  'top-left': { left: '1rem', top: '7.4rem', alignItems: 'flex-start' },
  'top-center': { left: '50%', top: '1.1rem', transform: 'translateX(-50%)', alignItems: 'center' },
  'top-right': { right: '1.1rem', top: '1.1rem', alignItems: 'flex-end' },
  'bottom-left': { left: '1.1rem', bottom: '1.1rem', alignItems: 'flex-start', flexDirection: 'column-reverse' },
  'bottom-center': {
    left: '50%',
    bottom: '1.1rem',
    transform: 'translateX(-50%)',
    alignItems: 'center',
    flexDirection: 'column-reverse'
  },
  'bottom-right': { right: '1.1rem', bottom: '1.1rem', alignItems: 'flex-end', flexDirection: 'column-reverse' }
}

const icons: Record<NotifyType, typeof InfoOutlined> = {
  info: InfoOutlined,
  success: CheckCircleOutlined,
  error: HighlightOffOutlined,
  support: SupportAgentOutlined
}

function Toast({ toast, onDone, slide }: { toast: ToastItem; onDone: (id: number) => void; slide: string }) {
  const [shown, setShown] = useState(false)
  const duration = toast.duration && toast.duration > 0 ? toast.duration : 4000

  useEffect(() => {
    const raf = requestAnimationFrame(() => setShown(true))
    const hide = setTimeout(() => setShown(false), duration)
    const done = setTimeout(() => onDone(toast.id), duration + 250)
    return () => {
      cancelAnimationFrame(raf)
      clearTimeout(hide)
      clearTimeout(done)
    }
  }, [])

  const Icon = icons[toast.type ?? 'info'] ?? InfoOutlined

  return (
    <Box
      sx={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        gap: '0.4rem',
        px: '0.55rem',
        py: '0.35rem',
        pb: '0.45rem',
        width: '15rem',
        overflow: 'hidden',
        background: colors.panel,
        border: `var(--hairline) dashed ${colors.panelEdge}`,
        borderRadius: '0.15rem',
        boxShadow: colors.innerGlow,
        opacity: shown ? 1 : 0,
        transform: shown ? 'none' : slide,
        transition: 'opacity 200ms ease-out, transform 200ms ease-out'
      }}
    >
      <Icon sx={{ fontSize: '0.9rem', color: colors.text, flexShrink: 0 }} />
      <Box sx={{ flex: 1, minWidth: 0 }}>
        {toast.title && (
          <>
            <Typography
              sx={{
                fontFamily: fonts.display,
                fontSize: '0.62rem',
                textTransform: 'uppercase',
                color: colors.text,
                lineHeight: 1.3
              }}
            >
              {toast.title}
            </Typography>
            <Box sx={{ height: 'var(--hairline)', background: 'rgba(255, 255, 255, 0.25)', my: '0.2rem' }} />
          </>
        )}
        <Typography
          sx={{
            fontSize: '0.72rem',
            color: toast.title ? colors.textDim : colors.text,
            lineHeight: 1.3,
            wordBreak: 'break-word'
          }}
        >
          {toast.message}
        </Typography>
      </Box>
      <Box
        sx={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          height: '0.1rem',
          background: 'rgba(255, 255, 255, 0.55)',
          width: shown ? '0%' : '100%',
          transition: `width ${duration}ms linear`
        }}
      />
    </Box>
  )
}

export default function Notify({ toasts, onDone }: NotifyProps) {
  if (toasts.length === 0) return null
  const position = toasts[0].position ?? 'top-left'
  const slide = position.endsWith('right')
    ? 'translateX(1rem)'
    : position.endsWith('left')
      ? 'translateX(-1rem)'
      : position.startsWith('top')
        ? 'translateY(-1rem)'
        : 'translateY(1rem)'

  return (
    <Box
      sx={{
        position: 'absolute',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.35rem',
        ...(stackSx[position] ?? stackSx['top-left'])
      } as SxProps}
    >
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onDone={onDone} slide={slide} />
      ))}
    </Box>
  )
}
