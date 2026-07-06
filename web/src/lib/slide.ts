import type { SxProps } from '@mui/material/styles'

export interface SlideVariant {
  anchor: SxProps
  rest: string
  hidden: string
}

const LEFT = 'translateX(calc(-100% - 1.5rem))'
const RIGHT = 'translateX(calc(100% + 1.5rem))'
const UP = 'translateY(calc(-100% - 3rem))'
const DOWN = 'translateY(calc(100% + 3rem))'

export const slideVariants: Record<string, SlideVariant> = {
  'top-left': { anchor: { left: '1rem', top: '2.6rem' }, rest: 'none', hidden: LEFT },
  'top-center': { anchor: { left: '50%', top: '2.6rem' }, rest: 'translateX(-50%)', hidden: `translateX(-50%) ${UP}` },
  'top-right': { anchor: { right: '1rem', top: '2.6rem' }, rest: 'none', hidden: RIGHT },
  'left-center': { anchor: { left: '1rem', top: '50%' }, rest: 'translateY(-50%)', hidden: `translateY(-50%) ${LEFT}` },
  'right-center': { anchor: { right: '1rem', top: '50%' }, rest: 'translateY(-50%)', hidden: `translateY(-50%) ${RIGHT}` },
  'bottom-left': { anchor: { left: '1rem', bottom: '2.6rem' }, rest: 'none', hidden: LEFT },
  'bottom-center': { anchor: { left: '50%', bottom: '2.6rem' }, rest: 'translateX(-50%)', hidden: `translateX(-50%) ${DOWN}` },
  'bottom-right': { anchor: { right: '1rem', bottom: '2.6rem' }, rest: 'none', hidden: RIGHT }
}

export function slideVariant(position: string | undefined, fallback: string): SlideVariant {
  return slideVariants[position ?? fallback] ?? slideVariants[fallback]
}
