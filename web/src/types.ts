export type MenuItemType = 'button' | 'options' | 'slider' | 'checkbox'

export interface MenuItem {
  id: string
  label: string
  icon?: string
  type?: MenuItemType
  description?: string
  rightLabel?: string
  disabled?: boolean
  arrow?: boolean
  options?: string[]
  index?: number
  min?: number
  max?: number
  step?: number
  value?: number
  checked?: boolean
}

export type MenuPosition = 'left' | 'right'

export interface MenuData {
  title: string
  subtitle?: string
  position?: MenuPosition
  maxVisible?: number
  items: MenuItem[]
}

export type NotifyType = 'info' | 'success' | 'error' | 'support'

export type NotifyPosition =
  | 'top-left'
  | 'top-center'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-center'
  | 'bottom-right'

export interface NotifyData {
  message: string
  title?: string
  type?: NotifyType
  duration?: number
  position?: NotifyPosition
}

export interface ToastItem extends NotifyData {
  id: number
}

export interface AnnounceData {
  title: string
  subtitle?: string
  duration?: number
}

export interface WarnData {
  message: string
  title?: string
  author?: string
  holdLabel?: string
}

export type FormFieldType = 'text' | 'number' | 'password' | 'textarea' | 'checkbox' | 'select' | 'slider'

export interface FormField {
  id: string
  label?: string
  type?: FormFieldType
  placeholder?: string
  value?: string | number
  checked?: boolean
  options?: string[]
  index?: number
  min?: number
  max?: number
  step?: number
  required?: boolean
}

export interface DialogData {
  kind: 'alert' | 'form'
  title: string
  message?: string
  submitLabel?: string
  cancelLabel?: string
  fields?: FormField[]
}

export interface KeyConfirmData {
  text: string
  position?: 'left' | 'right'
  duration: number
  acceptLabel?: string
  acceptText?: string
  declineLabel?: string
  declineText?: string
  hasDecline?: boolean
}

export type MinigameKind = 'skillbar' | 'sequence' | 'mash' | 'circle' | 'tension'

export interface MinigameData {
  kind: MinigameKind
  label?: string
  rounds?: number
  speed?: number
  zoneSize?: number
  length?: number
  time?: number
  key?: string
  gain?: number
  decay?: number
  hint?: string
}

export interface ConversationChoice {
  id: string
  label: string
}

export interface ConversationData {
  name?: string
  text: string
  choices: ConversationChoice[]
}

export interface PinPadData {
  title?: string
  length?: number
}

export interface RadialItem {
  id: string
  label: string
  icon?: string
}

export interface RadialData {
  items: RadialItem[]
}

export interface KeyLegendEntry {
  key: string
  label: string
}

export interface KeyLegendData {
  entries: KeyLegendEntry[]
  position?: TextUIPosition
}

export interface ProgressData {
  label?: string
  duration: number
  segments?: number
  position?: TextUIPosition
  progressType?: 'bar' | 'circle'
  cancelLabel?: string
}

export type TextUIPosition =
  | 'top-left'
  | 'top-center'
  | 'top-right'
  | 'left-center'
  | 'right-center'
  | 'bottom-left'
  | 'bottom-center'
  | 'bottom-right'

export interface TextUIData {
  text: string
  key?: string
  position?: TextUIPosition
}

export interface HoldTextUIData {
  text: string
  key?: string
  position?: TextUIPosition
}
