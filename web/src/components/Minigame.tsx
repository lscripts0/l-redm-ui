import { useEffect, useRef, useState } from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import type { SxProps } from '@mui/material/styles'
import { colors, fonts } from '../theme'
import { fetchNui } from '../lib/nui'
import type { MinigameData } from '../types'

interface MinigameProps {
  data: MinigameData
  onDone: () => void
}

const LETTERS = 'ABCDEFGHIKLMNOPRSTUVWXYZ'
const textShadow = '0 var(--hairline) 0.2rem rgba(0, 0, 0, 0.9)'

const panelSx: SxProps = {
  position: 'absolute',
  left: '50%',
  bottom: '14rem',
  transform: 'translateX(-50%)',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '0.4rem'
}

function KeyBadge({ label, state, size }: { label: string; state: 'idle' | 'active' | 'done'; size?: string }) {
  return (
    <Box
      sx={{
        minWidth: size ?? '1.4rem',
        px: label.length > 1 ? '0.35rem' : 0,
        height: size ?? '1.4rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: `var(--hairline) solid ${state === 'active' ? 'rgba(255, 255, 255, 0.95)' : 'rgba(255, 255, 255, 0.4)'}`,
        borderRadius: '0.15rem',
        backgroundColor: state === 'done' ? 'rgba(255, 255, 255, 0.75)' : 'rgba(0, 0, 0, 0.6)',
        boxShadow: state === 'active' ? 'inset 0 0 1.7vh rgba(255, 255, 255, 0.15)' : 'none'
      }}
    >
      <Typography
        sx={{
          fontFamily: fonts.display,
          fontSize: size ? '0.9rem' : '0.75rem',
          color: state === 'done' ? '#0a0a0a' : state === 'active' ? '#ffffff' : colors.textDim
        }}
      >
        {label}
      </Typography>
    </Box>
  )
}

function result(success: boolean, onDone: () => void) {
  fetchNui('minigame:result', { success })
  onDone()
}

function Skillbar({ data, onDone }: MinigameProps) {
  const rounds = data.rounds && data.rounds > 0 ? data.rounds : 1
  const zoneSize = data.zoneSize && data.zoneSize > 0 ? data.zoneSize : 15
  const speed = data.speed && data.speed > 0 ? data.speed : 1
  const [round, setRound] = useState(1)
  const [zoneStart, setZoneStart] = useState(() => 10 + Math.random() * (80 - zoneSize))
  const [pos, setPos] = useState(0)
  const posRef = useRef(0)
  const zoneRef = useRef(zoneStart)
  const roundRef = useRef(1)
  zoneRef.current = zoneStart
  roundRef.current = round

  useEffect(() => {
    let raf = 0
    const start = performance.now()
    const tick = (now: number) => {
      const t = ((now - start) / 1000) * speed
      const cycle = t % 2
      const value = (cycle < 1 ? cycle : 2 - cycle) * 100
      posRef.current = value
      setPos(value)
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        result(false, onDone)
        return
      }
      if (event.key !== ' ' && event.key !== 'Enter') return
      if (event.repeat) return
      const hit = posRef.current >= zoneRef.current && posRef.current <= zoneRef.current + zoneSize
      if (!hit) {
        result(false, onDone)
        return
      }
      if (roundRef.current >= rounds) {
        result(true, onDone)
        return
      }
      setRound(roundRef.current + 1)
      setZoneStart(10 + Math.random() * (80 - zoneSize))
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  return (
    <Box sx={panelSx}>
      <Typography sx={{ fontFamily: fonts.body, fontSize: '0.78rem', color: colors.text, textShadow }}>
        {data.label ?? ''}
        {rounds > 1 ? ` ${round} / ${rounds}` : ''}
      </Typography>
      <Box
        sx={{
          position: 'relative',
          width: '14rem',
          height: '0.55rem',
          border: 'var(--hairline) solid rgba(255, 255, 255, 0.4)',
          borderRadius: '0.08rem',
          background: 'rgba(0, 0, 0, 0.55)',
          overflow: 'hidden'
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: `${zoneStart}%`,
            width: `${zoneSize}%`,
            background: 'rgba(255, 255, 255, 0.35)'
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: `${pos}%`,
            width: '0.14rem',
            marginLeft: '-0.07rem',
            background: '#ffffff'
          }}
        />
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
        <KeyBadge label={'⏎'} state="active" size="1.1rem" />
        <Typography sx={{ fontFamily: fonts.display, fontSize: '0.52rem', textTransform: 'uppercase', color: colors.text, textShadow }}>
          {data.hint ?? ''}
        </Typography>
      </Box>
    </Box>
  )
}

function Circle({ data, onDone }: MinigameProps) {
  const rounds = data.rounds && data.rounds > 0 ? data.rounds : 1
  const zoneSize = data.zoneSize && data.zoneSize > 0 ? data.zoneSize : 40
  const speed = data.speed && data.speed > 0 ? data.speed : 0.6
  const [round, setRound] = useState(1)
  const [zoneStart, setZoneStart] = useState(() => Math.random() * (360 - zoneSize))
  const [angle, setAngle] = useState(0)
  const angleRef = useRef(0)
  const zoneRef = useRef(zoneStart)
  const roundRef = useRef(1)
  zoneRef.current = zoneStart
  roundRef.current = round

  useEffect(() => {
    let raf = 0
    const start = performance.now()
    const tick = (now: number) => {
      const value = (((now - start) / 1000) * speed * 360) % 360
      angleRef.current = value
      setAngle(value)
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        result(false, onDone)
        return
      }
      if (event.key !== ' ' && event.key !== 'Enter') return
      if (event.repeat) return
      const hit = angleRef.current >= zoneRef.current && angleRef.current <= zoneRef.current + zoneSize
      if (!hit) {
        result(false, onDone)
        return
      }
      if (roundRef.current >= rounds) {
        result(true, onDone)
        return
      }
      setRound(roundRef.current + 1)
      setZoneStart(Math.random() * (360 - zoneSize))
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  const radius = 42
  const circumference = 2 * Math.PI * radius

  return (
    <Box sx={panelSx}>
      <Typography sx={{ fontFamily: fonts.body, fontSize: '0.78rem', color: colors.text, textShadow }}>
        {data.label ?? ''}
        {rounds > 1 ? ` ${round} / ${rounds}` : ''}
      </Typography>
      <Box component="svg" viewBox="0 0 100 100" sx={{ width: '7rem', height: '7rem' }}>
        <circle cx="50" cy="50" r={radius} fill="none" stroke="rgba(0, 0, 0, 0.55)" strokeWidth="8" />
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke="rgba(255, 255, 255, 0.35)"
          strokeWidth="8"
          strokeDasharray={`${(zoneSize / 360) * circumference} ${circumference}`}
          transform={`rotate(${zoneStart - 90} 50 50)`}
        />
        <g transform={`rotate(${angle} 50 50)`}>
          <line x1="50" y1="13" x2="50" y2="1" stroke="#ffffff" strokeWidth="2.6" />
        </g>
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
        <KeyBadge label={'⏎'} state="active" size="1.1rem" />
        <Typography sx={{ fontFamily: fonts.display, fontSize: '0.52rem', textTransform: 'uppercase', color: colors.text, textShadow }}>
          {data.hint ?? ''}
        </Typography>
      </Box>
    </Box>
  )
}

function Tension({ data, onDone }: MinigameProps) {
  const time = data.time && data.time > 0 ? data.time : 15000
  const zoneSize = data.zoneSize && data.zoneSize > 0 ? data.zoneSize : 25
  const speed = data.speed && data.speed > 0 ? data.speed : 1
  const gain = data.gain && data.gain > 0 ? data.gain : 22
  const decay = data.decay && data.decay > 0 ? data.decay : 16
  const keyLabel = data.key ? data.key.toUpperCase() : 'SPACE'
  const [marker, setMarker] = useState(10)
  const [zoneStart, setZoneStart] = useState(35)
  const [progress, setProgress] = useState(30)
  const [remaining, setRemaining] = useState(1)
  const markerRef = useRef(10)
  const zoneStartRef = useRef(35)
  const zoneTargetRef = useRef(35)
  const progressRef = useRef(30)
  const holdRef = useRef(false)
  const doneRef = useRef(false)

  useEffect(() => {
    const start = performance.now()
    let last = start
    const interval = window.setInterval(() => {
      if (doneRef.current) return
      const now = performance.now()
      const dt = (now - last) / 1000
      last = now
      markerRef.current = Math.min(Math.max(markerRef.current + (holdRef.current ? 65 : -65) * dt, 0), 100)
      setMarker(markerRef.current)
      const drift = 26 * speed * dt
      const delta = zoneTargetRef.current - zoneStartRef.current
      if (Math.abs(delta) <= drift) {
        zoneStartRef.current = zoneTargetRef.current
        zoneTargetRef.current = Math.random() * (100 - zoneSize)
      } else {
        zoneStartRef.current += Math.sign(delta) * drift
      }
      setZoneStart(zoneStartRef.current)
      const inZone = markerRef.current >= zoneStartRef.current && markerRef.current <= zoneStartRef.current + zoneSize
      progressRef.current = Math.min(Math.max(progressRef.current + (inZone ? gain : -decay) * dt, 0), 100)
      setProgress(progressRef.current)
      const left = Math.max(1 - (now - start) / time, 0)
      setRemaining(left)
      if (progressRef.current >= 100) {
        doneRef.current = true
        window.clearInterval(interval)
        result(true, onDone)
      } else if (progressRef.current <= 0 || left <= 0) {
        doneRef.current = true
        window.clearInterval(interval)
        result(false, onDone)
      }
    }, 40)
    return () => window.clearInterval(interval)
  }, [])

  useEffect(() => {
    const matches = (event: KeyboardEvent) =>
      data.key ? event.key.toUpperCase() === data.key.toUpperCase() : event.key === ' '
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (!doneRef.current) {
          doneRef.current = true
          result(false, onDone)
        }
        return
      }
      if (matches(event)) holdRef.current = true
    }
    const onKeyUp = (event: KeyboardEvent) => {
      if (matches(event)) holdRef.current = false
    }
    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
    }
  }, [])

  return (
    <Box sx={panelSx}>
      {data.label && (
        <Typography sx={{ fontFamily: fonts.body, fontSize: '0.78rem', color: colors.text, textShadow }}>
          {data.label}
        </Typography>
      )}
      <Box
        sx={{
          position: 'relative',
          width: '14rem',
          height: '0.55rem',
          border: 'var(--hairline) solid rgba(255, 255, 255, 0.4)',
          borderRadius: '0.08rem',
          background: 'rgba(0, 0, 0, 0.55)',
          overflow: 'hidden'
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: `${zoneStart}%`,
            width: `${zoneSize}%`,
            background: 'rgba(255, 255, 255, 0.35)'
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: `${marker}%`,
            width: '0.14rem',
            marginLeft: '-0.07rem',
            background: '#ffffff'
          }}
        />
      </Box>
      <Box
        sx={{
          width: '14rem',
          height: '0.35rem',
          border: 'var(--hairline) solid rgba(255, 255, 255, 0.4)',
          borderRadius: '0.08rem',
          background: 'rgba(0, 0, 0, 0.55)',
          overflow: 'hidden'
        }}
      >
        <Box sx={{ height: '100%', width: `${progress}%`, background: 'rgba(255, 255, 255, 0.85)' }} />
      </Box>
      <Box
        sx={{
          width: '14rem',
          height: '0.18rem',
          background: 'rgba(0, 0, 0, 0.55)',
          borderRadius: '0.08rem',
          overflow: 'hidden'
        }}
      >
        <Box sx={{ height: '100%', width: `${remaining * 100}%`, background: 'rgba(255, 255, 255, 0.45)' }} />
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
        <KeyBadge label={keyLabel} state="active" size="1.1rem" />
        <Typography sx={{ fontFamily: fonts.display, fontSize: '0.52rem', textTransform: 'uppercase', color: colors.text, textShadow }}>
          {data.hint ?? ''}
        </Typography>
      </Box>
    </Box>
  )
}

function Sequence({ data, onDone }: MinigameProps) {
  const length = data.length && data.length > 0 ? data.length : 5
  const time = data.time && data.time > 0 ? data.time : 6000
  const [keys] = useState(() =>
    Array.from({ length }, () => LETTERS[Math.floor(Math.random() * LETTERS.length)])
  )
  const [index, setIndex] = useState(0)
  const [remaining, setRemaining] = useState(1)
  const indexRef = useRef(0)
  indexRef.current = index

  useEffect(() => {
    const start = performance.now()
    const interval = window.setInterval(() => {
      const value = Math.max(1 - (performance.now() - start) / time, 0)
      setRemaining(value)
      if (value <= 0) {
        window.clearInterval(interval)
        result(false, onDone)
      }
    }, 40)
    return () => window.clearInterval(interval)
  }, [])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        result(false, onDone)
        return
      }
      const pressed = event.key.toUpperCase()
      if (pressed.length !== 1 || !LETTERS.includes(pressed)) return
      if (pressed === keys[indexRef.current]) {
        if (indexRef.current + 1 >= keys.length) {
          result(true, onDone)
          return
        }
        setIndex(indexRef.current + 1)
      } else {
        result(false, onDone)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  return (
    <Box sx={panelSx}>
      {data.label && (
        <Typography sx={{ fontFamily: fonts.body, fontSize: '0.78rem', color: colors.text, textShadow }}>
          {data.label}
        </Typography>
      )}
      <Box sx={{ display: 'flex', gap: '0.35rem' }}>
        {keys.map((letter, i) => (
          <KeyBadge key={i} label={letter} state={i < index ? 'done' : i === index ? 'active' : 'idle'} />
        ))}
      </Box>
      <Box
        sx={{
          width: '14rem',
          height: '0.18rem',
          background: 'rgba(0, 0, 0, 0.55)',
          borderRadius: '0.08rem',
          overflow: 'hidden'
        }}
      >
        <Box sx={{ height: '100%', width: `${remaining * 100}%`, background: 'rgba(255, 255, 255, 0.7)' }} />
      </Box>
    </Box>
  )
}

function Mash({ data, onDone }: MinigameProps) {
  const key = (data.key ?? 'E').toUpperCase()
  const time = data.time && data.time > 0 ? data.time : 6000
  const gain = data.gain && data.gain > 0 ? data.gain : 8
  const decay = data.decay && data.decay > 0 ? data.decay : 20
  const [fill, setFill] = useState(0)
  const [remaining, setRemaining] = useState(1)
  const fillRef = useRef(0)
  const doneRef = useRef(false)

  useEffect(() => {
    const start = performance.now()
    let last = start
    const interval = window.setInterval(() => {
      const now = performance.now()
      const dt = (now - last) / 1000
      last = now
      fillRef.current = Math.max(fillRef.current - decay * dt, 0)
      setFill(fillRef.current)
      const value = Math.max(1 - (now - start) / time, 0)
      setRemaining(value)
      if (value <= 0 && !doneRef.current) {
        doneRef.current = true
        window.clearInterval(interval)
        result(false, onDone)
      }
    }, 40)
    return () => window.clearInterval(interval)
  }, [])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (!doneRef.current) {
          doneRef.current = true
          result(false, onDone)
        }
        return
      }
      if (event.key.toUpperCase() !== key || event.repeat) return
      fillRef.current = Math.min(fillRef.current + gain, 100)
      setFill(fillRef.current)
      if (fillRef.current >= 100 && !doneRef.current) {
        doneRef.current = true
        result(true, onDone)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  return (
    <Box sx={panelSx}>
      {data.label && (
        <Typography sx={{ fontFamily: fonts.body, fontSize: '0.78rem', color: colors.text, textShadow }}>
          {data.label}
        </Typography>
      )}
      <KeyBadge label={key} state="active" size="1.8rem" />
      <Box
        sx={{
          width: '14rem',
          height: '0.55rem',
          border: 'var(--hairline) solid rgba(255, 255, 255, 0.4)',
          borderRadius: '0.08rem',
          background: 'rgba(0, 0, 0, 0.55)',
          overflow: 'hidden'
        }}
      >
        <Box sx={{ height: '100%', width: `${fill}%`, background: 'rgba(255, 255, 255, 0.85)' }} />
      </Box>
      <Box
        sx={{
          width: '14rem',
          height: '0.18rem',
          background: 'rgba(0, 0, 0, 0.55)',
          borderRadius: '0.08rem',
          overflow: 'hidden'
        }}
      >
        <Box sx={{ height: '100%', width: `${remaining * 100}%`, background: 'rgba(255, 255, 255, 0.45)' }} />
      </Box>
    </Box>
  )
}

export default function Minigame({ data, onDone }: MinigameProps) {
  if (data.kind === 'sequence') return <Sequence data={data} onDone={onDone} />
  if (data.kind === 'mash') return <Mash data={data} onDone={onDone} />
  if (data.kind === 'circle') return <Circle data={data} onDone={onDone} />
  if (data.kind === 'tension') return <Tension data={data} onDone={onDone} />
  return <Skillbar data={data} onDone={onDone} />
}
