import { useEffect, useRef } from 'react'

interface NuiWindow extends Window {
  invokeNative?: unknown
  GetParentResourceName?: () => string
}

const nuiWindow = window as NuiWindow

const isEnvBrowser = (): boolean => nuiWindow.invokeNative === undefined

export function fetchNui<T = unknown>(event: string, data?: unknown): Promise<T | null> {
  if (isEnvBrowser()) {
    return Promise.resolve(null)
  }
  const resource = nuiWindow.GetParentResourceName ? nuiWindow.GetParentResourceName() : 'l-redm-ui'
  return fetch(`https://${resource}/${event}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=UTF-8' },
    body: JSON.stringify(data ?? {})
  })
    .then((res) => res.json() as Promise<T>)
    .catch(() => null)
}

export function useNuiEvent<T = unknown>(action: string, handler: (data: T) => void): void {
  const handlerRef = useRef(handler)
  handlerRef.current = handler

  useEffect(() => {
    const listener = (event: MessageEvent) => {
      if (event.data && event.data.action === action) {
        handlerRef.current(event.data as T)
      }
    }
    window.addEventListener('message', listener)
    return () => window.removeEventListener('message', listener)
  }, [action])
}
