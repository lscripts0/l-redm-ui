import { useEffect, useRef, useState } from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import ButtonBase from '@mui/material/ButtonBase'
import Slider from '@mui/material/Slider'
import type { SxProps } from '@mui/material/styles'
import { colors, fonts } from '../theme'
import { fetchNui } from '../lib/nui'
import type { DialogData, FormField } from '../types'
import Ornament from './Ornament'

interface DialogProps {
  data: DialogData
  onDone: () => void
}

type FieldValue = string | number | boolean

const fieldBoxSx: SxProps = {
  width: '100%',
  background: 'rgba(0, 0, 0, 0.45)',
  borderRadius: '0.12rem',
  px: '0.5rem',
  py: '0.28rem'
}

const scrollbarSx = {
  '&::-webkit-scrollbar': { width: '0.15rem' },
  '&::-webkit-scrollbar-track': { background: 'rgba(255, 255, 255, 0.08)' },
  '&::-webkit-scrollbar-thumb': { background: 'rgba(255, 255, 255, 0.35)' }
}

const inputSx = {
  width: '100%',
  background: 'transparent',
  border: 'none',
  outline: 'none',
  fontFamily: fonts.body,
  fontSize: '0.8rem',
  color: colors.text,
  padding: 0,
  resize: 'none' as const,
  ...scrollbarSx
}

const buttonSx = (accent: string, glow: string): SxProps => ({
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
    boxShadow: `inset 0 0 1.7vh ${glow}`
  }
})

export default function Dialog({ data, onDone }: DialogProps) {
  const fields = data.fields ?? []
  const [values, setValues] = useState<Record<string, FieldValue>>(() => {
    const initial: Record<string, FieldValue> = {}
    for (const field of fields) {
      if (field.type === 'checkbox') {
        initial[field.id] = field.checked === true
      } else if (field.type === 'select') {
        initial[field.id] = field.options?.[(field.index ?? 1) - 1] ?? ''
      } else if (field.type === 'slider') {
        initial[field.id] = Number(field.value ?? field.min ?? 0)
      } else {
        initial[field.id] = field.value ?? ''
      }
    }
    return initial
  })
  const [errors, setErrors] = useState<Record<string, boolean>>({})
  const firstInputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    let tries = 0
    const interval = window.setInterval(() => {
      tries++
      if (document.activeElement === firstInputRef.current || tries > 20) {
        window.clearInterval(interval)
        return
      }
      firstInputRef.current?.focus()
    }, 50)
    return () => window.clearInterval(interval)
  }, [])

  const setValue = (id: string, value: FieldValue) => {
    setValues((prev) => ({ ...prev, [id]: value }))
    setErrors((prev) => ({ ...prev, [id]: false }))
  }

  const cancel = () => {
    fetchNui('dialog:result', { canceled: true })
    onDone()
  }

  const submit = () => {
    if (data.kind === 'alert') {
      fetchNui('dialog:result', { canceled: false })
      onDone()
      return
    }
    const out: Record<string, FieldValue> = {}
    const nextErrors: Record<string, boolean> = {}
    for (const field of fields) {
      let value = values[field.id]
      if (field.type === 'number') {
        let num = Number(value)
        if (value === '' || Number.isNaN(num)) num = field.min ?? 0
        if (field.min !== undefined) num = Math.max(num, field.min)
        if (field.max !== undefined) num = Math.min(num, field.max)
        value = num
      }
      if (field.required && (value === '' || value === undefined)) {
        nextErrors[field.id] = true
      }
      out[field.id] = value
    }
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      return
    }
    fetchNui('dialog:result', { canceled: false, values: out })
    onDone()
  }

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        cancel()
      } else if (event.key === 'Enter' && !(event.target instanceof HTMLTextAreaElement)) {
        submit()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  })

  const renderField = (field: FormField, index: number) => {
    const error = errors[field.id] === true
    const borderColor = error ? 'rgba(255, 90, 80, 0.75)' : colors.panelEdge

    if (field.type === 'checkbox') {
      const checked = values[field.id] === true
      return (
        <ButtonBase
          key={field.id}
          component="div"
          onClick={() => setValue(field.id, !checked)}
          sx={{
            width: '100%',
            display: 'flex',
            justifyContent: 'flex-start',
            alignItems: 'center',
            gap: '0.45rem',
            cursor: 'pointer',
            py: '0.15rem'
          }}
        >
          <Box
            sx={{
              position: 'relative',
              width: '0.75rem',
              height: '0.75rem',
              flexShrink: 0,
              border: `var(--hairline) solid rgba(255, 255, 255, 0.55)`,
              borderRadius: '0.1rem'
            }}
          >
            {checked && (
              <Box
                sx={{
                  position: 'absolute',
                  left: '50%',
                  top: '50%',
                  width: '0.38rem',
                  height: '0.38rem',
                  transform: 'translate(-50%, -50%) rotate(45deg)',
                  backgroundColor: colors.accent
                }}
              />
            )}
          </Box>
          <Typography sx={{ fontFamily: fonts.body, fontSize: '0.8rem', color: colors.text }}>
            {field.label ?? field.id}
          </Typography>
        </ButtonBase>
      )
    }

    if (field.type === 'slider') {
      const min = field.min ?? 0
      const max = field.max ?? 100
      const current = Number(values[field.id] ?? min)
      return (
        <Box key={field.id}>
          {field.label && <FieldLabel label={field.label} required={field.required} />}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: '0.6rem', px: '0.2rem' }}>
            <Slider
              value={current}
              min={min}
              max={max}
              step={field.step ?? 1}
              size="small"
              onChange={(_, value) => setValue(field.id, value as number)}
              sx={{
                flex: 1,
                color: colors.text,
                height: '0.15rem',
                padding: '0.5rem 0',
                '& .MuiSlider-thumb': {
                  width: '0.5rem',
                  height: '0.5rem',
                  borderRadius: 0,
                  transform: 'translate(-50%, -50%) rotate(45deg)',
                  backgroundColor: colors.accent,
                  '&:hover, &.Mui-focusVisible, &.Mui-active': { boxShadow: 'none' },
                  '&::before': { boxShadow: 'none' }
                },
                '& .MuiSlider-rail': { backgroundColor: 'rgba(255, 255, 255, 0.25)' }
              }}
            />
            <Typography sx={{ fontFamily: fonts.body, fontSize: '0.78rem', color: colors.textDim, minWidth: '1.8rem', textAlign: 'right' }}>
              {current}
            </Typography>
          </Box>
        </Box>
      )
    }

    if (field.type === 'select') {
      const options = field.options ?? []
      const current = String(values[field.id] ?? '')
      const currentIndex = Math.max(options.indexOf(current), 0)
      const shift = (dir: number) => {
        if (options.length === 0) return
        const next = (currentIndex + dir + options.length) % options.length
        setValue(field.id, options[next])
      }
      const arrowSx: SxProps = {
        fontFamily: fonts.body,
        fontSize: '1.5rem',
        lineHeight: 1,
        color: colors.textDim,
        cursor: 'pointer',
        px: '0.4rem',
        mt: '-0.12rem',
        borderRadius: '0.1rem',
        transition: 'color 100ms ease-out, background-color 100ms ease-out',
        '&:hover': {
          color: '#ffffff',
          backgroundColor: 'rgba(255, 255, 255, 0.12)'
        }
      }
      return (
        <Box key={field.id}>
          {field.label && <FieldLabel label={field.label} required={field.required} />}
          <Box sx={{ ...fieldBoxSx, border: `var(--hairline) solid ${borderColor}`, display: 'flex', alignItems: 'center' } as SxProps}>
            <Typography onClick={() => shift(-1)} sx={arrowSx}>
              &#8249;
            </Typography>
            <Typography sx={{ flex: 1, textAlign: 'center', fontFamily: fonts.body, fontSize: '0.8rem', color: colors.text }}>
              {current}
            </Typography>
            <Typography onClick={() => shift(1)} sx={arrowSx}>
              &#8250;
            </Typography>
          </Box>
        </Box>
      )
    }

    const isTextarea = field.type === 'textarea'
    return (
      <Box key={field.id}>
        {field.label && <FieldLabel label={field.label} required={field.required} />}
        <Box sx={{ ...fieldBoxSx, border: `var(--hairline) solid ${borderColor}` } as SxProps}>
          <Box
            component={isTextarea ? 'textarea' : 'input'}
            ref={index === 0 ? firstInputRef : undefined}
            type={field.type === 'password' ? 'password' : field.type === 'number' ? 'number' : 'text'}
            rows={isTextarea ? 3 : undefined}
            placeholder={field.placeholder ?? ''}
            value={String(values[field.id] ?? '')}
            spellCheck={false}
            onChange={(event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
              setValue(field.id, event.target.value)
            }
            sx={{
              ...inputSx,
              '&::placeholder': { color: colors.textDim, opacity: 1 },
              '&::-webkit-inner-spin-button, &::-webkit-outer-spin-button': {
                WebkitAppearance: 'none',
                margin: 0
              }
            }}
          />
        </Box>
      </Box>
    )
  }

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
          width: '19rem',
          maxHeight: '22rem',
          display: 'flex',
          flexDirection: 'column',
          px: '1.1rem',
          py: '0.8rem',
          isolation: 'isolate'
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            zIndex: -1,
            background: colors.panel,
          filter: 'url(#paint-edge-1)',
          clipPath: 'inset(-0.35rem)',
            pointerEvents: 'none'
          }}
        />
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
        <Ornament />
        <Box sx={{ flex: 1, minHeight: 0, overflowY: 'auto', pr: '0.3rem', mr: '-0.5rem', ...scrollbarSx }}>
        {data.message && (
          <Typography
            sx={{
              fontFamily: fonts.body,
              fontSize: '0.82rem',
              color: colors.text,
              textAlign: 'center',
              lineHeight: 1.4,
              mb: '0.3rem'
            }}
          >
            {data.message}
          </Typography>
        )}
        {fields.length > 0 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', mb: '0.3rem' }}>
            {fields.map((field, index) => renderField(field, index))}
          </Box>
        )}
        </Box>
        <Box sx={{ display: 'flex', gap: '0.5rem', mt: '0.6rem', flexShrink: 0 }}>
          <ButtonBase onClick={cancel} sx={buttonSx(colors.danger, colors.dangerGlow)}>
            {data.cancelLabel ?? 'Cancel'}
          </ButtonBase>
          <ButtonBase onClick={submit} sx={buttonSx(colors.success, colors.successGlow)}>
            {data.submitLabel ?? 'Confirm'}
          </ButtonBase>
        </Box>
      </Box>
    </Box>
  )
}

function FieldLabel({ label, required }: { label: string; required?: boolean }) {
  return (
    <Typography
      sx={{
        fontFamily: fonts.display,
        fontSize: '0.6rem',
        textTransform: 'uppercase',
        color: colors.textDim,
        mb: '0.15rem'
      }}
    >
      {label}
      {required ? ' *' : ''}
    </Typography>
  )
}
