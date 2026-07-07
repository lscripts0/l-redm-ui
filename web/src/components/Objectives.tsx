import { useEffect, useState } from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import type { SxProps } from '@mui/material/styles'
import { colors, fonts } from '../theme'
import { slideVariant } from '../lib/slide'
import type { ObjectivesData } from '../types'
import Ornament from './Ornament'

interface ObjectivesProps {
  data: ObjectivesData
  hiding: boolean
}

export default function Objectives({ data, hiding }: ObjectivesProps) {
  const [shown, setShown] = useState(false)
  const variant = slideVariant(data.position, 'right-center')

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
        flexDirection: 'column',
        minWidth: '10rem',
        maxWidth: '15rem',
        px: '0.7rem',
        py: '0.5rem',
        background: colors.panel,
        border: `var(--hairline) dashed ${colors.panelEdge}`,
        borderRadius: '0.15rem',
        boxShadow: colors.innerGlow,
        transform: visible ? variant.rest : variant.hidden,
        opacity: visible ? 1 : 0,
        transition: 'transform 250ms ease-out, opacity 250ms ease-out',
        ...variant.anchor
      } as SxProps}
    >
      {data.title && (
        <>
          <Typography
            sx={{
              fontFamily: fonts.display,
              fontWeight: 400,
              fontSize: '0.72rem',
              textTransform: 'uppercase',
              textAlign: 'center',
              color: colors.text,
              lineHeight: 1.2
            }}
          >
            {data.title}
          </Typography>
          <Ornament />
        </>
      )}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: '0.32rem', mt: data.title ? '0.1rem' : 0 }}>
        {data.entries.map((entry) => {
          const done = entry.done === true
          return (
            <Box key={entry.id} sx={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <Box
                sx={{
                  position: 'relative',
                  width: '0.62rem',
                  height: '0.62rem',
                  flexShrink: 0,
                  transform: 'rotate(45deg)',
                  border: `var(--hairline) solid ${done ? '#43ff36' : 'rgba(255, 255, 255, 0.55)'}`,
                  borderRadius: '0.08rem'
                }}
              >
                {done && (
                  <Box
                    sx={{
                      position: 'absolute',
                      inset: '0.13rem',
                      backgroundColor: '#43ff36'
                    }}
                  />
                )}
              </Box>
              <Typography
                sx={{
                  fontFamily: fonts.body,
                  fontSize: '0.78rem',
                  lineHeight: 1.25,
                  color: done ? 'rgba(67, 255, 54, 0.85)' : colors.text,
                  textDecoration: done ? 'line-through' : 'none',
                  textDecorationThickness: 'var(--hairline)'
                }}
              >
                {entry.label}
              </Typography>
            </Box>
          )
        })}
      </Box>
    </Box>
  )
}
