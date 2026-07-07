import { useRef, useState } from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { colors, fonts } from '../theme'
import { fetchNui, useNuiEvent } from '../lib/nui'
import type { ConversationData } from '../types'
import Ornament from './Ornament'

interface ConversationProps {
  data: ConversationData
}

const ROW_HEIGHT = 1.5

export default function Conversation({ data }: ConversationProps) {
  const [selected, setSelected] = useState(0)
  const selectedRef = useRef(0)
  selectedRef.current = selected

  const move = (dir: number) => {
    const count = data.choices.length
    if (count === 0) return
    const next = (selectedRef.current + dir + count) % count
    setSelected(next)
    fetchNui('conversation:nav', {})
  }

  const select = () => {
    const choice = data.choices[selectedRef.current]
    if (!choice) return
    fetchNui('conversation:select', { id: choice.id })
  }

  useNuiEvent<{ key: string }>('conversation:key', (event) => {
    if (event.key === 'up') move(-1)
    else if (event.key === 'down') move(1)
    else if (event.key === 'select') select()
  })

  return (
    <Box
      sx={{
        position: 'absolute',
        left: '50%',
        bottom: '5.5rem',
        transform: 'translateX(-50%)',
        width: '32rem',
        px: '1.3rem',
        py: '0.55rem',
        isolation: 'isolate'
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          zIndex: -1,
          background: colors.panel,
          filter: 'url(#paint-edge-0)',
          clipPath: 'inset(-0.35rem)',
          pointerEvents: 'none'
        }}
      />
      {data.name && (
        <>
          <Typography
            sx={{
              fontFamily: fonts.display,
              fontWeight: 400,
              fontSize: '0.95rem',
              textTransform: 'uppercase',
              textAlign: 'center',
              color: colors.text,
              lineHeight: 1.2
            }}
          >
            {data.name}
          </Typography>
          <Ornament />
        </>
      )}
      <Typography
        sx={{
          fontFamily: fonts.body,
          fontSize: '0.82rem',
          color: colors.text,
          textAlign: 'center',
          lineHeight: 1.4,
          mb: '0.4rem'
        }}
      >
        {data.text}
      </Typography>
      <Box sx={{ position: 'relative' }}>
        <Box
          sx={{
            position: 'absolute',
            top: `${selected * ROW_HEIGHT}rem`,
            left: 0,
            right: 0,
            height: `${ROW_HEIGHT}rem`,
            border: `var(--hairline) solid ${colors.highlight}`,
            borderRadius: '0.1rem',
            boxShadow: colors.innerGlow,
            backgroundColor: 'rgba(255, 255, 255, 0.04)',
            transition: 'top 130ms ease-out',
            pointerEvents: 'none'
          }}
        />
        {data.choices.map((choice, index) => {
          const active = index === selected
          return (
            <Box
              key={choice.id}
              sx={{
                height: `${ROW_HEIGHT}rem`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                px: '0.55rem'
              }}
            >
              <Typography
                noWrap
                sx={{
                  fontFamily: fonts.body,
                  fontSize: '0.8rem',
                  textAlign: 'center',
                  color: active ? colors.text : colors.textDim,
                  transition: 'color 130ms ease-out',
                  lineHeight: 1.3
                }}
              >
                {choice.label}
              </Typography>
            </Box>
          )
        })}
      </Box>
    </Box>
  )
}
