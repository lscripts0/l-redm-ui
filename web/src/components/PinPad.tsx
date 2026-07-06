import { useEffect, useRef, useState } from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import ButtonBase from '@mui/material/ButtonBase'
import type { SxProps } from '@mui/material/styles'
import { colors, fonts } from '../theme'
import { fetchNui } from '../lib/nui'
import type { PinPadData } from '../types'
import CornerOrnaments from './CornerOrnaments'
import Ornament from './Ornament'

interface PinPadProps {
  data: PinPadData
  onDone: () => void
}

const keySx: SxProps = {
  width: '2.5rem',
  height: '2.1rem',
  fontFamily: fonts.display,
  fontWeight: 400,
  fontSize: '0.95rem',
  color: colors.text,
  border: `var(--hairline) solid ${colors.panelEdge}`,
  borderRadius: '2px',
  boxShadow: colors.innerGlow,
  '&:hover': {
    borderColor: 'rgba(255, 255, 255, 0.6)',
    backgroundColor: 'rgba(255, 255, 255, 0.08)'
  }
}

export default function PinPad({ data, onDone }: PinPadProps) {
  const length = data.length && data.length > 0 ? Math.floor(data.length) : 4
  const [code, setCode] = useState('')
  const codeRef = useRef('')
  const doneRef = useRef(false)
  codeRef.current = code

  const cancel = () => {
    if (doneRef.current) return
    doneRef.current = true
    fetchNui('pinpad:result', { canceled: true })
    onDone()
  }

  const push = (digit: string) => {
    if (doneRef.current) return
    if (codeRef.current.length >= length) return
    const next = codeRef.current + digit
    setCode(next)
    fetchNui('pinpad:nav', {})
    if (next.length >= length) {
      doneRef.current = true
      window.setTimeout(() => {
        fetchNui('pinpad:result', { canceled: false, code: next })
        onDone()
      }, 180)
    }
  }

  const pop = () => {
    if (doneRef.current) return
    setCode((prev) => prev.slice(0, -1))
  }

  const clear = () => {
    if (doneRef.current) return
    setCode('')
  }

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') cancel()
      else if (event.key === 'Backspace') pop()
      else if (event.key >= '0' && event.key <= '9') push(event.key)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  return (
    <Box
      sx={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0, 0, 0, 0.45)',
        pointerEvents: 'auto'
      }}
    >
      <Box
        sx={{
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          px: '1.1rem',
          py: '0.8rem',
          background: `linear-gradient(180deg, rgba(16, 16, 16, 0.55), rgba(0, 0, 0, 0.25)), ${colors.panel}`,
          border: `var(--hairline) solid ${colors.panelEdge}`,
          borderRadius: '0.15rem',
          boxShadow: `${colors.innerGlow}, 0 0.4rem 2.2rem rgba(0, 0, 0, 0.55)`
        }}
      >
        <CornerOrnaments />
        {data.title && (
          <>
            <Typography
              sx={{
                fontFamily: fonts.display,
                fontWeight: 400,
                fontSize: '1.05rem',
                textTransform: 'uppercase',
                textAlign: 'center',
                color: colors.text,
                lineHeight: 1.2
              }}
            >
              {data.title}
            </Typography>
            <Box sx={{ width: '100%' }}>
              <Ornament />
            </Box>
          </>
        )}
        <Box sx={{ display: 'flex', gap: '0.45rem', my: '0.55rem' }}>
          {Array.from({ length }, (_, index) => (
            <Box
              key={index}
              sx={{
                width: '0.55rem',
                height: '0.55rem',
                transform: 'rotate(45deg)',
                border: `var(--hairline) solid rgba(255, 255, 255, 0.55)`,
                backgroundColor: index < code.length ? colors.accent : 'transparent'
              }}
            />
          ))}
        </Box>
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, auto)', gap: '0.4rem' }}>
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
            <ButtonBase key={digit} onClick={() => push(digit)} sx={keySx}>
              {digit}
            </ButtonBase>
          ))}
          <ButtonBase onClick={clear} sx={{ ...keySx, fontSize: '0.7rem' } as SxProps}>
            C
          </ButtonBase>
          <ButtonBase onClick={() => push('0')} sx={keySx}>
            0
          </ButtonBase>
          <ButtonBase onClick={pop} sx={{ ...keySx, fontFamily: fonts.body, fontSize: '1.1rem' } as SxProps}>
            &#8249;
          </ButtonBase>
        </Box>
      </Box>
    </Box>
  )
}
