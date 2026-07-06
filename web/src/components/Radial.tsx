import { useEffect, useState } from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { colors, fonts } from '../theme'
import { fetchNui } from '../lib/nui'
import { faClass } from '../lib/fa'
import type { RadialData, RadialItem } from '../types'

interface RadialProps {
  data: RadialData
}

const SIZE = 200
const CENTER = SIZE / 2
const OUTER = 95
const INNER = 46
const GAP = 2

function polar(radius: number, degrees: number) {
  const rad = ((degrees - 90) * Math.PI) / 180
  return { x: CENTER + radius * Math.cos(rad), y: CENTER + radius * Math.sin(rad) }
}

function wedgePath(startAngle: number, endAngle: number) {
  const outerStart = polar(OUTER, startAngle)
  const outerEnd = polar(OUTER, endAngle)
  const innerStart = polar(INNER, endAngle)
  const innerEnd = polar(INNER, startAngle)
  const large = endAngle - startAngle > 180 ? 1 : 0
  return [
    `M ${outerStart.x} ${outerStart.y}`,
    `A ${OUTER} ${OUTER} 0 ${large} 1 ${outerEnd.x} ${outerEnd.y}`,
    `L ${innerStart.x} ${innerStart.y}`,
    `A ${INNER} ${INNER} 0 ${large} 0 ${innerEnd.x} ${innerEnd.y}`,
    'Z'
  ].join(' ')
}

export default function Radial({ data }: RadialProps) {
  const items = data.items
  const [hovered, setHovered] = useState<number | null>(null)
  const step = 360 / items.length

  const close = () => {
    fetchNui('radial:close', {})
  }

  const select = (item: RadialItem) => {
    fetchNui('radial:select', { id: item.id })
  }

  const hover = (index: number | null) => {
    setHovered((prev) => {
      if (index !== null && index !== prev) fetchNui('radial:nav', {})
      return index
    })
  }

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close()
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
        background: 'rgba(0, 0, 0, 0.35)',
        pointerEvents: 'auto'
      }}
      onContextMenu={(event) => {
        event.preventDefault()
        close()
      }}
    >
      <Box sx={{ position: 'relative', width: '17rem', height: '17rem' }}>
        <Box component="svg" viewBox={`0 0 ${SIZE} ${SIZE}`} sx={{ width: '100%', height: '100%', display: 'block' }}>
          {items.map((item, index) => {
            const start = index * step + GAP / 2
            const end = (index + 1) * step - GAP / 2
            const active = hovered === index
            return (
              <path
                key={item.id}
                d={wedgePath(start, end)}
                fill={active ? 'rgba(242, 242, 242, 0.92)' : 'rgba(6, 6, 6, 0.82)'}
                stroke={active ? 'rgba(255, 255, 255, 0.9)' : 'rgba(255, 255, 255, 0.15)'}
                strokeWidth="0.6"
                style={{ cursor: 'pointer', transition: 'fill 90ms ease-out' }}
                onMouseEnter={() => hover(index)}
                onMouseLeave={() => hover(null)}
                onClick={() => select(item)}
              />
            )
          })}
          <circle
            cx={CENTER}
            cy={CENTER}
            r={INNER - 6}
            fill="rgba(6, 6, 6, 0.82)"
            stroke="rgba(255, 255, 255, 0.15)"
            strokeWidth="0.6"
          />
        </Box>
        {items.map((item, index) => {
          const mid = index * step + step / 2
          const pos = polar((OUTER + INNER) / 2, mid)
          const active = hovered === index
          return (
            <Box
              key={item.id}
              sx={{
                position: 'absolute',
                left: `${(pos.x / SIZE) * 100}%`,
                top: `${(pos.y / SIZE) * 100}%`,
                transform: 'translate(-50%, -50%)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.12rem',
                pointerEvents: 'none',
                maxWidth: '4rem'
              }}
            >
              {item.icon && (
                <Box
                  component="i"
                  className={faClass(item.icon)}
                  sx={{ fontSize: '0.85rem', color: active ? '#0a0a0a' : colors.text }}
                />
              )}
              <Typography
                sx={{
                  fontFamily: fonts.display,
                  fontSize: '0.5rem',
                  textTransform: 'uppercase',
                  textAlign: 'center',
                  lineHeight: 1.15,
                  color: active ? '#0a0a0a' : colors.textDim
                }}
              >
                {item.label}
              </Typography>
            </Box>
          )
        })}
        <Box
          sx={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            width: '5.6rem',
            pointerEvents: 'none'
          }}
        >
          <Typography
            sx={{
              fontFamily: fonts.display,
              fontSize: '0.62rem',
              textTransform: 'uppercase',
              textAlign: 'center',
              lineHeight: 1.2,
              color: colors.text
            }}
          >
            {hovered !== null ? items[hovered]?.label : ''}
          </Typography>
        </Box>
      </Box>
    </Box>
  )
}
