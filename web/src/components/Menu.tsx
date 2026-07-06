import { useEffect, useMemo, useState } from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Slider from '@mui/material/Slider'
import type { SxProps } from '@mui/material/styles'
import { colors, fonts } from '../theme'
import { fetchNui, isEnvBrowser, useNuiEvent } from '../lib/nui'
import { faClass } from '../lib/fa'
import type { MenuData, MenuItem } from '../types'
import Ornament from './Ornament'
import CornerOrnaments from './CornerOrnaments'

interface MenuProps {
  menu: MenuData
  onDismiss: () => void
}

const ROW_HEIGHT = 1.65

const panelSx: SxProps = {
  position: 'relative',
  background: `linear-gradient(180deg, rgba(16, 16, 16, 0.55), rgba(0, 0, 0, 0.25)), ${colors.panel}`,
  border: `var(--hairline) solid ${colors.panelEdge}`,
  borderRadius: '0.15rem',
  boxShadow: `${colors.innerGlow}, 0 0.4rem 2.2rem rgba(0, 0, 0, 0.55)`
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

export default function Menu({ menu, onDismiss }: MenuProps) {
  const [items, setItems] = useState<MenuItem[]>(() => menu.items.map((item) => ({ ...item })))
  const firstEnabled = useMemo(() => Math.max(items.findIndex((item) => !item.disabled), 0), [items])
  const maxVisible = menu.maxVisible && menu.maxVisible > 0 ? menu.maxVisible : 8
  const [selected, setSelected] = useState(firstEnabled)
  const [scrollTop, setScrollTop] = useState(() =>
    clamp(0, firstEnabled - maxVisible + 1, firstEnabled)
  )

  const overflow = items.length > maxVisible
  const selectedItem = items[selected]
  const side = menu.position === 'left' ? 'left' : 'right'
  const viewRows = Math.min(items.length, maxVisible)

  const move = (dir: 1 | -1) => {
    if (items.length === 0) return
    let next = selected
    for (let step = 0; step < items.length; step++) {
      next = (next + dir + items.length) % items.length
      if (!items[next].disabled) break
    }
    if (next === selected) return
    setSelected(next)
    setScrollTop((top) => clamp(top, next - maxVisible + 1, next))
    fetchNui('menu:nav')
  }

  const applyChange = (index: number, patch: Partial<MenuItem>, payload: Record<string, unknown>) => {
    setItems((prev) => prev.map((item, i) => (i === index ? { ...item, ...patch } : item)))
    fetchNui('menu:change', { id: items[index].id, ...payload })
  }

  const change = (dir: 1 | -1) => {
    const item = items[selected]
    if (!item || item.disabled) return
    if (item.type === 'options' && item.options && item.options.length > 0) {
      const count = item.options.length
      const next = ((((item.index ?? 1) - 1 + dir) % count) + count) % count + 1
      applyChange(selected, { index: next }, { index: next })
    } else if (item.type === 'slider') {
      const min = item.min ?? 0
      const max = item.max ?? 100
      const step = item.step ?? 1
      const next = clamp((item.value ?? min) + dir * step, min, max)
      if (next !== (item.value ?? min)) applyChange(selected, { value: next }, { value: next })
    } else if (item.type === 'checkbox') {
      const next = !item.checked
      applyChange(selected, { checked: next }, { checked: next })
    }
  }

  const activate = () => {
    const item = items[selected]
    if (!item || item.disabled) return
    if (item.type === 'checkbox') {
      change(1)
    } else if (!item.type || item.type === 'button') {
      fetchNui('menu:select', { id: item.id })
    }
  }

  useNuiEvent<{ key: string }>('menu:key', (data) => {
    switch (data.key) {
      case 'up':
        move(-1)
        break
      case 'down':
        move(1)
        break
      case 'left':
        change(-1)
        break
      case 'right':
        change(1)
        break
      case 'select':
        activate()
        break
    }
  })

  useEffect(() => {
    if (!isEnvBrowser()) return
    const onKeyDown = (event: KeyboardEvent) => {
      switch (event.key) {
        case 'ArrowUp':
          event.preventDefault()
          move(-1)
          break
        case 'ArrowDown':
          event.preventDefault()
          move(1)
          break
        case 'ArrowLeft':
          event.preventDefault()
          change(-1)
          break
        case 'ArrowRight':
          event.preventDefault()
          change(1)
          break
        case 'Enter':
          if (!event.repeat) activate()
          break
        case 'Backspace':
        case 'Escape':
          if (!event.repeat) onDismiss()
          break
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  })

  const renderRight = (item: MenuItem, isSelected: boolean) => {
    if (item.type === 'options' && item.options && item.options.length > 0) {
      return (
        <>
          <Typography sx={arrowSx(isSelected)}>&#8249;</Typography>
          <Typography sx={{ fontSize: '0.82rem', color: colors.text, minWidth: '2.6rem', textAlign: 'center' }}>
            {item.options[(item.index ?? 1) - 1]}
          </Typography>
          <Typography sx={arrowSx(isSelected)}>&#8250;</Typography>
        </>
      )
    }
    if (item.type === 'slider') {
      const min = item.min ?? 0
      const max = item.max ?? 100
      return (
        <>
          <Slider
            value={item.value ?? min}
            min={min}
            max={max}
            step={item.step ?? 1}
            size="small"
            slotProps={{ input: { tabIndex: -1 } }}
            sx={{
              width: '5rem',
              color: colors.text,
              height: '0.15rem',
              padding: '0.5rem 0',
              pointerEvents: 'none',
              '& .MuiSlider-thumb': {
                width: '0.45rem',
                height: '0.45rem',
                borderRadius: 0,
                transform: 'translate(-50%, -50%) rotate(45deg)',
                backgroundColor: colors.accent,
                '&:hover, &.Mui-focusVisible, &.Mui-active': { boxShadow: 'none' },
                '&::before': { boxShadow: 'none' }
              },
              '& .MuiSlider-rail': { backgroundColor: 'rgba(255, 255, 255, 0.25)' }
            }}
          />
          <Typography sx={{ fontSize: '0.75rem', color: colors.textDim, minWidth: '1.5rem', textAlign: 'right' }}>
            {item.value ?? min}
          </Typography>
        </>
      )
    }
    if (item.type === 'checkbox') {
      return (
        <Box
          sx={{
            position: 'relative',
            width: '0.7rem',
            height: '0.7rem',
            border: `var(--hairline) solid ${isSelected ? 'rgba(255, 255, 255, 0.85)' : 'rgba(255, 255, 255, 0.4)'}`,
            borderRadius: '0.1rem'
          }}
        >
          {item.checked && (
            <Box
              sx={{
                position: 'absolute',
                left: '50%',
                top: '50%',
                width: '0.36rem',
                height: '0.36rem',
                transform: 'translate(-50%, -50%) rotate(45deg)',
                backgroundColor: colors.accent
              }}
            />
          )}
        </Box>
      )
    }
    return (
      <>
        {item.rightLabel && (
          <Typography sx={{ fontSize: '0.78rem', color: colors.textDim }}>{item.rightLabel}</Typography>
        )}
        {item.arrow && (
          <Typography sx={{ fontFamily: fonts.body, fontSize: '1.3rem', color: colors.textDim, lineHeight: 1, mt: '-0.1rem' }}>
            &#8250;
          </Typography>
        )}
      </>
    )
  }

  return (
    <Box
      sx={{
        position: 'absolute',
        width: '16.5rem',
        top: '50%',
        transform: 'translateY(-50%)',
        [side]: '3rem',
        pointerEvents: 'none'
      }}
    >
      <Box sx={panelSx}>
        <CornerOrnaments />
        <Box sx={{ pt: '0.65rem' }}>
          <Typography
            sx={{
              fontFamily: fonts.display,
              fontWeight: 400,
              fontSize: '1rem',
              textTransform: 'uppercase',
              textAlign: 'center',
              color: colors.text,
              lineHeight: 1.2
            }}
          >
            {menu.title}
          </Typography>
          {menu.subtitle && (
            <Typography
              sx={{
                fontStyle: 'italic',
                fontSize: '0.78rem',
                textAlign: 'center',
                color: colors.textDim,
                mt: '0.15rem'
              }}
            >
              {menu.subtitle}
            </Typography>
          )}
          <Ornament />
        </Box>
        <Box sx={{ px: '0.85rem', pb: overflow ? '0.25rem' : '0.6rem' }}>
          <Box sx={{ position: 'relative', pr: overflow ? '0.45rem' : 0 }}>
            {overflow && (
              <Box
                sx={{
                  position: 'absolute',
                  right: 0,
                  top: 0,
                  width: '0.15rem',
                  height: `${maxVisible * ROW_HEIGHT}rem`,
                  background: 'rgba(255, 255, 255, 0.08)',
                  borderRadius: '0.1rem'
                }}
              >
                <Box
                  sx={{
                    position: 'absolute',
                    left: 0,
                    right: 0,
                    top: `${(scrollTop / items.length) * 100}%`,
                    height: `${(maxVisible / items.length) * 100}%`,
                    background: 'rgba(255, 255, 255, 0.35)',
                    borderRadius: '0.1rem',
                    transition: 'top 130ms ease-out'
                  }}
                />
              </Box>
            )}
            <Box sx={{ position: 'relative', height: `${viewRows * ROW_HEIGHT}rem`, overflow: 'hidden' }}>
              <Box
                sx={{
                  position: 'absolute',
                  top: `${(selected - scrollTop) * ROW_HEIGHT}rem`,
                  left: 0,
                  right: 0,
                  height: `${ROW_HEIGHT}rem`,
                  border: 'var(--hairline) solid rgba(255, 255, 255, 0.75)',
                  borderRadius: '0.1rem',
                  boxShadow: colors.innerGlow,
                  backgroundColor: 'rgba(255, 255, 255, 0.04)',
                  transition: 'top 130ms ease-out',
                  pointerEvents: 'none',
                  zIndex: 1
                }}
              />
              <Box sx={{ transform: `translateY(-${scrollTop * ROW_HEIGHT}rem)`, transition: 'transform 130ms ease-out' }}>
              {items.map((item, index) => {
                const isSelected = index === selected
                return (
                  <Box
                    key={item.id}
                    sx={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      px: '0.55rem',
                      height: `${ROW_HEIGHT}rem`,
                      flexShrink: 0,
                      opacity: item.disabled ? 0.35 : 1
                    }}
                  >
                    {item.icon && (
                      <Box
                        component="i"
                        className={faClass(item.icon)}
                        sx={{
                          fontSize: '0.7rem',
                          color: isSelected ? colors.text : colors.textDim,
                          width: '0.95rem',
                          textAlign: 'center',
                          flexShrink: 0,
                          transition: 'color 130ms ease-out'
                        }}
                      />
                    )}
                    <Typography
                      sx={{
                        fontSize: '0.85rem',
                        color: isSelected ? '#ffffff' : colors.text,
                        transition: 'color 130ms ease-out',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {item.label}
                    </Typography>
                    <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      {renderRight(item, isSelected)}
                    </Box>
                  </Box>
                )
              })}
              </Box>
            </Box>
          </Box>
          {overflow && (
            <>
              <Ornament />
              <Typography
                sx={{
                  fontFamily: fonts.display,
                  fontSize: '0.6rem',
                  textAlign: 'center',
                  color: colors.textDim,
                  pb: '0.25rem'
                }}
              >
                {selected + 1} / {items.length}
              </Typography>
            </>
          )}
        </Box>
      </Box>
      {selectedItem?.description && (
        <Box
          sx={{
            ...panelSx,
            position: 'absolute',
            top: 'calc(100% + 0.4rem)',
            left: 0,
            right: 0,
            borderTop: 'calc(var(--hairline) * 2) solid rgba(255, 255, 255, 0.35)',
            px: '0.65rem',
            py: '0.45rem'
          } as SxProps}
        >
          <Typography sx={{ fontSize: '0.8rem', color: colors.text, lineHeight: 1.35 }}>
            {selectedItem.description}
          </Typography>
        </Box>
      )}
    </Box>
  )
}

const arrowSx = (isSelected: boolean): SxProps => ({
  fontFamily: fonts.body,
  fontSize: '1.05rem',
  lineHeight: 1,
  color: isSelected ? colors.accent : colors.textDim,
  px: '0.15rem'
})
