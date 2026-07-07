import { useRef, useState } from 'react'
import Box from '@mui/material/Box'
import { useNuiEvent } from './lib/nui'
import type {
  AnnounceData,
  ConversationData,
  CountdownData,
  DialogData,
  KeyConfirmData,
  KeyLegendData,
  MinigameData,
  HoldTextUIData,
  MenuData,
  NotifyData,
  ObjectivesData,
  PinPadData,
  ProgressData,
  RadialData,
  TextUIData,
  ToastItem,
  WarnData
} from './types'
import Menu from './components/Menu'
import TextUI from './components/TextUI'
import HoldTextUI from './components/HoldTextUI'
import Notify from './components/Notify'
import Announce from './components/Announce'
import Warn from './components/Warn'
import Progress from './components/Progress'
import Chat from './components/Chat'
import Dialog from './components/Dialog'
import KeyConfirm from './components/KeyConfirm'
import KeyLegend from './components/KeyLegend'
import Minigame from './components/Minigame'
import Conversation from './components/Conversation'
import PinPad from './components/PinPad'
import Radial from './components/Radial'
import Countdown from './components/Countdown'
import Objectives from './components/Objectives'

interface MenuState {
  menu: MenuData
  nonce: number
}

interface AnnounceState {
  data: AnnounceData
  nonce: number
}

interface ProgressState {
  data: ProgressData
  nonce: number
}

export default function App() {
  const [menuState, setMenuState] = useState<MenuState | null>(null)
  const [textUI, setTextUI] = useState<TextUIData | null>(null)
  const [textUIHiding, setTextUIHiding] = useState(false)
  const [holdTextUI, setHoldTextUI] = useState<{ data: HoldTextUIData; nonce: number } | null>(null)
  const [holdTextUIHiding, setHoldTextUIHiding] = useState(false)
  const [toasts, setToasts] = useState<ToastItem[]>([])
  const [announce, setAnnounce] = useState<AnnounceState | null>(null)
  const [warn, setWarn] = useState<WarnData | null>(null)
  const [warnHiding, setWarnHiding] = useState(false)
  const [progress, setProgress] = useState<ProgressState | null>(null)
  const [dialog, setDialog] = useState<{ data: DialogData; nonce: number } | null>(null)
  const [keyConfirm, setKeyConfirm] = useState<{ data: KeyConfirmData; nonce: number } | null>(null)
  const [keyConfirmHiding, setKeyConfirmHiding] = useState(false)
  const [minigame, setMinigame] = useState<{ data: MinigameData; nonce: number } | null>(null)
  const [keyLegend, setKeyLegend] = useState<KeyLegendData | null>(null)
  const [keyLegendHiding, setKeyLegendHiding] = useState(false)
  const [conversation, setConversation] = useState<{ data: ConversationData; nonce: number } | null>(null)
  const [pinPad, setPinPad] = useState<{ data: PinPadData; nonce: number } | null>(null)
  const [radial, setRadial] = useState<{ data: RadialData; nonce: number } | null>(null)
  const [countdown, setCountdown] = useState<{ data: CountdownData; nonce: number } | null>(null)
  const [countdownHiding, setCountdownHiding] = useState(false)
  const [objectives, setObjectives] = useState<ObjectivesData | null>(null)
  const [objectivesHiding, setObjectivesHiding] = useState(false)
  const toastId = useRef(0)
  const warnHideTimer = useRef<number | null>(null)
  const keyConfirmHideTimer = useRef<number | null>(null)
  const textUIHideTimer = useRef<number | null>(null)
  const holdTextUIHideTimer = useRef<number | null>(null)
  const keyLegendHideTimer = useRef<number | null>(null)
  const objectivesHideTimer = useRef<number | null>(null)
  const countdownHideTimer = useRef<number | null>(null)

  const hideWarn = () => {
    if (warnHideTimer.current !== null) return
    setWarnHiding(true)
    warnHideTimer.current = window.setTimeout(() => {
      warnHideTimer.current = null
      setWarn(null)
      setWarnHiding(false)
    }, 350)
  }

  const openMenu = (menu: MenuData) => setMenuState((prev) => ({ menu, nonce: (prev?.nonce ?? 0) + 1 }))

  const addToast = (data: NotifyData) => {
    const id = ++toastId.current
    setToasts((prev) => [...prev, { ...data, id }])
  }

  const removeToast = (id: number) => setToasts((prev) => prev.filter((toast) => toast.id !== id))

  const showAnnounce = (data: AnnounceData) => setAnnounce((prev) => ({ data, nonce: (prev?.nonce ?? 0) + 1 }))

  useNuiEvent<{ menu: MenuData }>('menu:open', (data) => openMenu(data.menu))
  useNuiEvent('menu:close', () => setMenuState(null))
  useNuiEvent<TextUIData>('textui:show', (data) => {
    if (textUIHideTimer.current !== null) {
      window.clearTimeout(textUIHideTimer.current)
      textUIHideTimer.current = null
    }
    setTextUIHiding(false)
    setTextUI({ text: data.text, key: data.key, position: data.position })
  })
  useNuiEvent('textui:hide', () => {
    if (textUIHideTimer.current !== null) return
    setTextUIHiding(true)
    textUIHideTimer.current = window.setTimeout(() => {
      textUIHideTimer.current = null
      setTextUI(null)
      setTextUIHiding(false)
    }, 300)
  })
  useNuiEvent<HoldTextUIData>('textui-hold:show', (data) => {
    if (holdTextUIHideTimer.current !== null) {
      window.clearTimeout(holdTextUIHideTimer.current)
      holdTextUIHideTimer.current = null
    }
    setHoldTextUIHiding(false)
    setHoldTextUI((prev) => ({
      data: { text: data.text, key: data.key, position: data.position },
      nonce: (prev?.nonce ?? 0) + 1
    }))
  })
  useNuiEvent('textui-hold:hide', () => {
    if (holdTextUIHideTimer.current !== null) return
    setHoldTextUIHiding(true)
    holdTextUIHideTimer.current = window.setTimeout(() => {
      holdTextUIHideTimer.current = null
      setHoldTextUI(null)
      setHoldTextUIHiding(false)
    }, 300)
  })
  useNuiEvent<NotifyData>('notify', addToast)
  useNuiEvent<AnnounceData>('announce', showAnnounce)
  useNuiEvent<WarnData>('warn:show', (data) => {
    if (warnHideTimer.current !== null) {
      window.clearTimeout(warnHideTimer.current)
      warnHideTimer.current = null
    }
    setWarnHiding(false)
    setWarn({ message: data.message, title: data.title, author: data.author, holdLabel: data.holdLabel })
  })
  useNuiEvent('warn:hide', hideWarn)
  useNuiEvent<ProgressData>('progress:start', (data) =>
    setProgress((prev) => ({
      data: {
        label: data.label,
        duration: data.duration,
        segments: data.segments,
        position: data.position,
        progressType: data.progressType,
        cancelLabel: data.cancelLabel
      },
      nonce: (prev?.nonce ?? 0) + 1
    }))
  )
  useNuiEvent('progress:stop', () => setProgress(null))
  useNuiEvent<DialogData>('dialog:open', (data) =>
    setDialog((prev) => ({
      data: {
        kind: data.kind,
        title: data.title,
        message: data.message,
        submitLabel: data.submitLabel,
        cancelLabel: data.cancelLabel,
        fields: data.fields
      },
      nonce: (prev?.nonce ?? 0) + 1
    }))
  )
  useNuiEvent('dialog:close', () => setDialog(null))
  useNuiEvent<KeyConfirmData>('keyconfirm:show', (data) => {
    if (keyConfirmHideTimer.current !== null) {
      window.clearTimeout(keyConfirmHideTimer.current)
      keyConfirmHideTimer.current = null
    }
    setKeyConfirmHiding(false)
    setKeyConfirm((prev) => ({
      data: {
        text: data.text,
        position: data.position,
        duration: data.duration,
        acceptLabel: data.acceptLabel,
        acceptText: data.acceptText,
        declineLabel: data.declineLabel,
        declineText: data.declineText,
        hasDecline: data.hasDecline
      },
      nonce: (prev?.nonce ?? 0) + 1
    }))
  })
  useNuiEvent<MinigameData>('minigame:start', (data) =>
    setMinigame((prev) => ({
      data: {
        kind: data.kind,
        label: data.label,
        rounds: data.rounds,
        speed: data.speed,
        zoneSize: data.zoneSize,
        length: data.length,
        time: data.time,
        key: data.key,
        gain: data.gain,
        decay: data.decay,
        hint: data.hint
      },
      nonce: (prev?.nonce ?? 0) + 1
    }))
  )
  useNuiEvent('minigame:stop', () => setMinigame(null))
  useNuiEvent<ConversationData>('conversation:open', (data) =>
    setConversation((prev) => ({
      data: { name: data.name, text: data.text, choices: data.choices },
      nonce: (prev?.nonce ?? 0) + 1
    }))
  )
  useNuiEvent('conversation:close', () => setConversation(null))
  useNuiEvent<PinPadData>('pinpad:open', (data) =>
    setPinPad((prev) => ({
      data: { title: data.title, length: data.length, submitLabel: data.submitLabel, cancelLabel: data.cancelLabel },
      nonce: (prev?.nonce ?? 0) + 1
    }))
  )
  useNuiEvent('pinpad:close', () => setPinPad(null))
  useNuiEvent<RadialData>('radial:open', (data) =>
    setRadial((prev) => ({
      data: { items: data.items, depth: data.depth },
      nonce: (prev?.nonce ?? 0) + 1
    }))
  )
  useNuiEvent('radial:close', () => setRadial(null))
  useNuiEvent<CountdownData>('countdown:tick', (data) => {
    if (countdownHideTimer.current !== null) {
      window.clearTimeout(countdownHideTimer.current)
      countdownHideTimer.current = null
    }
    setCountdownHiding(false)
    setCountdown((prev) => ({
      data: { value: data.value, text: data.text },
      nonce: prev?.nonce ?? 1
    }))
  })
  useNuiEvent('countdown:hide', () => {
    if (countdownHideTimer.current !== null) return
    setCountdownHiding(true)
    countdownHideTimer.current = window.setTimeout(() => {
      countdownHideTimer.current = null
      setCountdown(null)
      setCountdownHiding(false)
    }, 300)
  })
  useNuiEvent<ObjectivesData>('objectives:show', (data) => {
    if (objectivesHideTimer.current !== null) {
      window.clearTimeout(objectivesHideTimer.current)
      objectivesHideTimer.current = null
    }
    setObjectivesHiding(false)
    setObjectives({ title: data.title, entries: data.entries, position: data.position })
  })
  useNuiEvent<{ entries: ObjectivesData['entries'] }>('objectives:update', (data) =>
    setObjectives((prev) => (prev ? { ...prev, entries: data.entries } : prev))
  )
  useNuiEvent('objectives:hide', () => {
    if (objectivesHideTimer.current !== null) return
    setObjectivesHiding(true)
    objectivesHideTimer.current = window.setTimeout(() => {
      objectivesHideTimer.current = null
      setObjectives(null)
      setObjectivesHiding(false)
    }, 300)
  })
  useNuiEvent<KeyLegendData>('keylegend:show', (data) => {
    if (keyLegendHideTimer.current !== null) {
      window.clearTimeout(keyLegendHideTimer.current)
      keyLegendHideTimer.current = null
    }
    setKeyLegendHiding(false)
    setKeyLegend({ entries: data.entries, position: data.position })
  })
  useNuiEvent('keylegend:hide', () => {
    if (keyLegendHideTimer.current !== null) return
    setKeyLegendHiding(true)
    keyLegendHideTimer.current = window.setTimeout(() => {
      keyLegendHideTimer.current = null
      setKeyLegend(null)
      setKeyLegendHiding(false)
    }, 300)
  })
  useNuiEvent('keyconfirm:hide', () => {
    if (keyConfirmHideTimer.current !== null) return
    setKeyConfirmHiding(true)
    keyConfirmHideTimer.current = window.setTimeout(() => {
      keyConfirmHideTimer.current = null
      setKeyConfirm(null)
      setKeyConfirmHiding(false)
    }, 300)
  })

  return (
    <Box
      sx={{
        position: 'fixed',
        inset: 0,
        overflow: 'hidden',
        pointerEvents: 'none'
      }}
    >
      <Chat />
      {menuState && (
        <Menu key={menuState.nonce} menu={menuState.menu} />
      )}
      {textUI && <TextUI data={textUI} hiding={textUIHiding} />}
      {holdTextUI && <HoldTextUI key={holdTextUI.nonce} data={holdTextUI.data} hiding={holdTextUIHiding} />}
      <Notify toasts={toasts} onDone={removeToast} />
      {announce && <Announce key={announce.nonce} data={announce.data} onDone={() => setAnnounce(null)} />}
      {warn && <Warn data={warn} hiding={warnHiding} />}
      {progress && <Progress key={progress.nonce} data={progress.data} />}
      {dialog && <Dialog key={dialog.nonce} data={dialog.data} onDone={() => setDialog(null)} />}
      {keyConfirm && <KeyConfirm key={keyConfirm.nonce} data={keyConfirm.data} hiding={keyConfirmHiding} />}
      {minigame && <Minigame key={minigame.nonce} data={minigame.data} onDone={() => setMinigame(null)} />}
      {keyLegend && <KeyLegend data={keyLegend} hiding={keyLegendHiding} />}
      {conversation && <Conversation key={conversation.nonce} data={conversation.data} />}
      {pinPad && <PinPad key={pinPad.nonce} data={pinPad.data} onDone={() => setPinPad(null)} />}
      {radial && <Radial key={radial.nonce} data={radial.data} />}
      {countdown && <Countdown key={countdown.nonce} data={countdown.data} hiding={countdownHiding} />}
      {objectives && <Objectives data={objectives} hiding={objectivesHiding} />}
    </Box>
  )
}
