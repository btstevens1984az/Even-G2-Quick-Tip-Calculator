import { OsEventTypeList, type EvenAppBridge, type EvenHubEvent } from '@evenrealities/even_hub_sdk'

export interface InputHandlers {
  onSelect: (index: number) => void
  onHudTap: () => void
  onScroll: (up: boolean) => void
  onDoubleTap: () => void
  onExit: () => void
}

function eventType(t: OsEventTypeList | null | undefined): number {
  return t ?? OsEventTypeList.CLICK_EVENT
}

function isDoubleTap(t: OsEventTypeList | null | undefined): boolean {
  return eventType(t) === OsEventTypeList.DOUBLE_CLICK_EVENT
}

function isScrollUp(t: OsEventTypeList | null | undefined): boolean {
  return eventType(t) === OsEventTypeList.SCROLL_TOP_EVENT
}

function isScrollDown(t: OsEventTypeList | null | undefined): boolean {
  return eventType(t) === OsEventTypeList.SCROLL_BOTTOM_EVENT
}

function isTap(t: OsEventTypeList | null | undefined): boolean {
  const e = eventType(t)
  return e === OsEventTypeList.CLICK_EVENT
}

function dispatchBridgeEvent(event: EvenHubEvent, handlers: InputHandlers): void {
  const listType = event.listEvent?.eventType ?? null
  const textType = event.textEvent?.eventType ?? null
  const sysType = event.sysEvent?.eventType ?? null

  if (isDoubleTap(sysType) || isDoubleTap(textType) || isDoubleTap(listType)) {
    handlers.onDoubleTap()
    return
  }

  if (sysType === OsEventTypeList.SYSTEM_EXIT_EVENT) {
    handlers.onExit()
    return
  }

  if (isScrollUp(sysType) || isScrollUp(textType) || isScrollUp(listType)) {
    handlers.onScroll(true)
    return
  }
  if (isScrollDown(sysType) || isScrollDown(textType) || isScrollDown(listType)) {
    handlers.onScroll(false)
    return
  }

  if (event.textEvent && isTap(textType)) {
    handlers.onHudTap()
    return
  }

  if (event.listEvent && isTap(listType)) {
    handlers.onSelect(event.listEvent.currentSelectItemIndex ?? 0)
  }
}

export function bindBridgeInput(bridge: EvenAppBridge, handlers: InputHandlers): () => void {
  return bridge.onEvenHubEvent(event => dispatchBridgeEvent(event, handlers))
}

export function bindKeyboardInput(
  handlers: InputHandlers,
  getSelectedIndex: () => number,
  setSelectedIndex: (index: number) => void,
  getMenuLength: () => number,
): () => void {
  const onKey = (e: KeyboardEvent): void => {
    const len = getMenuLength()
    if (len === 0) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        handlers.onHudTap()
      }
      if (e.key === 'Escape') handlers.onDoubleTap()
      return
    }

    let selected = getSelectedIndex()
    switch (e.key) {
      case 'ArrowUp':
        e.preventDefault()
        selected = (selected - 1 + len) % len
        setSelectedIndex(selected)
        handlers.onScroll(true)
        break
      case 'ArrowDown':
        e.preventDefault()
        selected = (selected + 1) % len
        setSelectedIndex(selected)
        handlers.onScroll(false)
        break
      case 'Enter':
      case ' ':
        e.preventDefault()
        handlers.onSelect(selected)
        break
      case 'b':
      case 'B':
        handlers.onHudTap()
        break
      case 'Escape':
        handlers.onDoubleTap()
        break
    }
  }

  window.addEventListener('keydown', onKey)
  return () => window.removeEventListener('keydown', onKey)
}
