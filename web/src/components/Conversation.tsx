import { useRef, useState } from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { colors, fonts } from '../theme'
import { fetchNui, useNuiEvent } from '../lib/nui'
import type { ConversationData } from '../types'
import CornerOrnaments from './CornerOrnaments'
import Ornament from './Ornament'

interface ConversationProps {
  data: ConversationData
}

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
        width: '24rem',
        px: '1.1rem',
        py: '0.8rem',
        background: `linear-gradient(180deg, rgba(16, 16, 16, 0.55), rgba(0, 0, 0, 0.25)), ${colors.panel}`,
        border: `var(--hairline) solid ${colors.panelEdge}`,
        borderRadius: '0.15rem',
        boxShadow: `${colors.innerGlow}, 0 0.4rem 2.2rem rgba(0, 0, 0, 0.55)`
      }}
    >
      <CornerOrnaments />
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
          lineHeight: 1.45,
          mb: '0.6rem'
        }}
      >
        {data.text}
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
        {data.choices.map((choice, index) => {
          const active = index === selected
          return (
            <Box
              key={choice.id}
              sx={{
                px: '0.55rem',
                py: '0.26rem',
                borderRadius: '0.1rem',
                border: `var(--hairline) solid ${active ? 'rgba(255, 255, 255, 0.75)' : 'transparent'}`,
                boxShadow: active ? colors.innerGlow : 'none',
                backgroundColor: active ? 'rgba(255, 255, 255, 0.04)' : 'transparent'
              }}
            >
              <Typography
                sx={{
                  fontFamily: fonts.body,
                  fontSize: '0.8rem',
                  textAlign: 'center',
                  color: active ? colors.text : colors.textDim,
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
