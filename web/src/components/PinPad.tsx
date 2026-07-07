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

const buttonSx = (accent: string): SxProps => ({
  flex: 1,
  fontFamily: fonts.display,
  fontWeight: 400,
  fontSize: '0.72rem',
  textTransform: 'uppercase',
  letterSpacing: 'normal',
  color: colors.text,
  py: '0.32rem',
  border: `var(--hairline) solid ${colors.panelEdge}`,
  borderRadius: '2px',
  boxShadow: colors.innerGlow,
  '&:hover': {
    color: accent,
    borderColor: accent,
    boxShadow: `inset 0 0 1.7vh ${accent}40`
  }
})

function Chevron({ up }: { up: boolean }) {
  return (
    <Box
      sx={{
        width: '0.45rem',
        height: '0.45rem',
        borderTop: '0.13rem solid currentColor',
        borderRight: '0.13rem solid currentColor',
        transform: up ? 'rotate(-45deg) translate(-15%, 15%)' : 'rotate(135deg) translate(-15%, 15%)'
      }}
    />
  )
}

export default function PinPad({ data, onDone }: PinPadProps) {
  const length = data.length && data.length > 0 ? Math.min(Math.floor(data.length), 8) : 4
  const [digits, setDigits] = useState<number[]>(() => Array.from({ length }, () => 0))
  const [selected, setSelected] = useState(0)
  const digitsRef = useRef(digits)
  const selectedRef = useRef(0)
  const doneRef = useRef(false)
  digitsRef.current = digits
  selectedRef.current = selected

  const cancel = () => {
    if (doneRef.current) return
    doneRef.current = true
    fetchNui('pinpad:result', { canceled: true })
    onDone()
  }

  const submit = () => {
    if (doneRef.current) return
    doneRef.current = true
    fetchNui('pinpad:result', { canceled: false, code: digitsRef.current.join('') })
    onDone()
  }

  const turn = (index: number, delta: number) => {
    if (doneRef.current) return
    setSelected(index)
    setDigits((prev) => {
      const next = [...prev]
      next[index] = (next[index] + delta + 10) % 10
      return next
    })
    fetchNui('pinpad:nav', {})
  }

  const setDigit = (index: number, value: number) => {
    if (doneRef.current) return
    setDigits((prev) => {
      const next = [...prev]
      next[index] = value
      return next
    })
    setSelected(Math.min(index + 1, length - 1))
    fetchNui('pinpad:nav', {})
  }

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') cancel()
      else if (event.key === 'Enter') submit()
      else if (event.key === 'ArrowUp') turn(selectedRef.current, 1)
      else if (event.key === 'ArrowDown') turn(selectedRef.current, -1)
      else if (event.key === 'ArrowLeft') setSelected((prev) => Math.max(prev - 1, 0))
      else if (event.key === 'ArrowRight') setSelected((prev) => Math.min(prev + 1, length - 1))
      else if (event.key >= '0' && event.key <= '9') setDigit(selectedRef.current, Number(event.key))
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  const arrowSx = (): SxProps => ({
    width: '2rem',
    height: '1.05rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: colors.textDim,
    borderRadius: '0.1rem',
    '&:hover': {
      color: '#ffffff',
      backgroundColor: 'rgba(255, 255, 255, 0.12)'
    }
  })

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
          border: `var(--hairline) dashed ${colors.panelEdge}`,
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
        <Box sx={{ display: 'flex', gap: '0.45rem', my: '0.5rem' }}>
          {digits.map((digit, index) => {
            const active = index === selected
            return (
              <Box key={index} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.18rem' }}>
                <ButtonBase onClick={() => turn(index, 1)} sx={arrowSx()}>
                  <Chevron up />
                </ButtonBase>
                <Box
                  onClick={() => setSelected(index)}
                  sx={{
                    width: '2rem',
                    height: '2.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    background: 'rgba(0, 0, 0, 0.45)',
                    border: `var(--hairline) solid ${active ? 'rgba(255, 255, 255, 0.75)' : colors.panelEdge}`,
                    borderRadius: '0.12rem',
                    boxShadow: active ? colors.innerGlow : 'none'
                  }}
                >
                  <Typography
                    sx={{
                      fontFamily: fonts.display,
                      fontWeight: 400,
                      fontSize: '1.25rem',
                      color: active ? colors.text : colors.textDim
                    }}
                  >
                    {digit}
                  </Typography>
                </Box>
                <ButtonBase onClick={() => turn(index, -1)} sx={arrowSx()}>
                  <Chevron up={false} />
                </ButtonBase>
              </Box>
            )
          })}
        </Box>
        <Box sx={{ display: 'flex', gap: '0.5rem', mt: '0.35rem', width: '100%' }}>
          <ButtonBase onClick={cancel} sx={buttonSx('#ff3636')}>
            {data.cancelLabel ?? 'Cancel'}
          </ButtonBase>
          <ButtonBase onClick={submit} sx={buttonSx('#43ff36')}>
            {data.submitLabel ?? 'Confirm'}
          </ButtonBase>
        </Box>
      </Box>
    </Box>
  )
}
