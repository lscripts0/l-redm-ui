import { useEffect, useRef, useState } from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { colors, fonts } from '../theme'
import { fetchNui, isEnvBrowser } from '../lib/nui'

interface ChatSuggestion {
  name: string
  help?: string
  params?: { name: string; help?: string }[]
}

interface ChatMode {
  name: string
  displayName: string
  color?: string
}

export default function Chat() {
  const [inputOpen, setInputOpen] = useState(false)
  const [inputText, setInputText] = useState('')
  const [suggestions, setSuggestions] = useState<Record<string, ChatSuggestion>>({})
  const [modes, setModes] = useState<ChatMode[]>([])
  const [modeIndex, setModeIndex] = useState(-1)

  const historyRef = useRef<string[]>([])
  const historyPos = useRef(-1)
  const inputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    const listener = (event: MessageEvent) => {
      const data = event.data
      if (!data || typeof data.type !== 'string') return
      switch (data.type) {
        case 'ON_OPEN':
          setInputOpen(true)
          break
        case 'ON_FOCUS':
          inputRef.current?.focus()
          break
        case 'ON_SUGGESTION_ADD': {
          const suggestion = data.suggestion as ChatSuggestion
          if (suggestion?.name) {
            setSuggestions((prev) => ({ ...prev, [suggestion.name]: suggestion }))
          }
          break
        }
        case 'ON_SUGGESTION_REMOVE':
          setSuggestions((prev) => {
            const next = { ...prev }
            delete next[data.name]
            return next
          })
          break
        case 'ON_MODE_ADD': {
          const mode = data.mode as ChatMode
          if (mode?.name) {
            setModes((prev) => [...prev.filter((entry) => entry.name !== mode.name), mode])
          }
          break
        }
        case 'ON_MODE_REMOVE':
          setModes((prev) => prev.filter((entry) => entry.name !== data.name?.name && entry.name !== data.name))
          setModeIndex(-1)
          break
      }
    }
    window.addEventListener('message', listener)
    fetchNui('chatLoaded')
    return () => window.removeEventListener('message', listener)
  }, [])

  useEffect(() => {
    if (!inputOpen) return
    let tries = 0
    const interval = window.setInterval(() => {
      tries++
      if (document.activeElement === inputRef.current || tries > 20) {
        window.clearInterval(interval)
        return
      }
      inputRef.current?.focus()
    }, 50)
    const refocus = () => {
      window.setTimeout(() => inputRef.current?.focus(), 0)
    }
    window.addEventListener('focus', refocus)
    document.addEventListener('visibilitychange', refocus)
    document.addEventListener('mousedown', refocus)
    return () => {
      window.clearInterval(interval)
      window.removeEventListener('focus', refocus)
      document.removeEventListener('visibilitychange', refocus)
      document.removeEventListener('mousedown', refocus)
    }
  }, [inputOpen])

  const currentMode = modeIndex >= 0 ? modes[modeIndex] : undefined

  const close = (canceled: boolean, message?: string) => {
    setInputOpen(false)
    setInputText('')
    historyPos.current = -1
    if (isEnvBrowser()) return
    fetchNui('chatResult', canceled ? { canceled: true } : { message, mode: currentMode?.name })
  }

  const matches = (() => {
    if (!inputText.startsWith('/')) return []
    const token = inputText.split(' ')[0]
    if (inputText.includes(' ')) {
      const exact = suggestions[token]
      return exact ? [exact] : []
    }
    return Object.values(suggestions)
      .filter((entry) => entry.name.startsWith(token))
      .slice(0, 3)
  })()

  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      const text = inputText.trim()
      if (text.length > 0) {
        historyRef.current = [text, ...historyRef.current].slice(0, 50)
      }
      close(text.length === 0, text)
    } else if (event.key === 'Escape') {
      close(true)
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      const next = Math.min(historyPos.current + 1, historyRef.current.length - 1)
      if (historyRef.current[next] !== undefined) {
        historyPos.current = next
        setInputText(historyRef.current[next])
      }
    } else if (event.key === 'ArrowDown') {
      event.preventDefault()
      const next = historyPos.current - 1
      historyPos.current = Math.max(next, -1)
      setInputText(next >= 0 ? historyRef.current[next] ?? '' : '')
    } else if (event.key === 'Tab') {
      event.preventDefault()
      if (matches.length > 0 && !inputText.includes(' ')) {
        setInputText(matches[0].name + ' ')
      }
    } else if (event.key === 'PageUp' || event.key === 'PageDown') {
      event.preventDefault()
      if (modes.length > 0) {
        const dir = event.key === 'PageUp' ? 1 : -1
        setModeIndex((prev) => {
          const next = prev + dir
          if (next >= modes.length) return -1
          if (next < -1) return modes.length - 1
          return next
        })
      }
    }
  }

  if (!inputOpen) return null

  return (
    <Box
      sx={{
        position: 'absolute',
        left: '1rem',
        top: '1rem',
        width: '19.5rem',
        pointerEvents: 'auto'
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.4rem',
          px: '0.55rem',
          py: '0.18rem',
          background: colors.panel,
          border: `var(--hairline) solid ${colors.panelEdge}`,
          borderRadius: '0.15rem',
          boxShadow: colors.innerGlow
        }}
      >
        {currentMode && (
          <Typography
            sx={{
              fontFamily: fonts.display,
              fontSize: '0.6rem',
              textTransform: 'uppercase',
              color: currentMode.color ?? colors.textDim,
              flexShrink: 0
            }}
          >
            {currentMode.displayName}
          </Typography>
        )}
        <Typography
          sx={{ fontFamily: fonts.body, fontSize: '1.3rem', color: colors.textDim, flexShrink: 0, lineHeight: 1, mt: '-0.12rem' }}
        >
          &#8250;
        </Typography>
        <Box
          component="input"
          ref={inputRef}
          value={inputText}
          spellCheck={false}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) => setInputText(event.target.value)}
          onKeyDown={onKeyDown}
          sx={{
            flex: 1,
            background: 'transparent',
            border: 'none',
            outline: 'none',
            fontFamily: fonts.body,
            fontSize: '0.8rem',
            color: colors.text,
            padding: 0
          }}
        />
      </Box>
      {matches.length > 0 && (
        <Box
          sx={{
            mt: '0.25rem',
            px: '0.55rem',
            py: '0.3rem',
            background: colors.panel,
            border: `var(--hairline) solid ${colors.panelEdge}`,
            borderRadius: '0.15rem',
            boxShadow: colors.innerGlow
          }}
        >
          {matches.map((entry) => (
            <Box key={entry.name} sx={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem', minWidth: 0 }}>
              <Typography sx={{ fontFamily: fonts.body, fontSize: '0.75rem', color: colors.text, flexShrink: 0 }}>
                {entry.name}
                {entry.params?.length ? ' ' + entry.params.map((param) => `[${param.name}]`).join(' ') : ''}
              </Typography>
              {entry.help && (
                <Typography
                  sx={{
                    fontFamily: fonts.body,
                    fontSize: '0.7rem',
                    color: colors.textDim,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {entry.help}
                </Typography>
              )}
            </Box>
          ))}
        </Box>
      )}
    </Box>
  )
}
