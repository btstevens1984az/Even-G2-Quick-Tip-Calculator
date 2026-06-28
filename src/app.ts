import type { EvenAppBridge } from '@evenrealities/even_hub_sdk'
import { createGlassesUi, type PageView } from './sdk/glasses-ui'
import { bindBridgeInput, bindKeyboardInput } from './sdk/input'
import { showCompanionReady } from './sdk/phone-companion'

const BILLS = [20, 35, 50, 75, 100, 150, 200]
const TIPS = [15, 18, 20, 22, 25]
const SPLITS = [1, 2, 3, 4, 5, 6, 8]

type Screen = 'calc' | 'adjust'

function money(n: number): string {
  return `$${n.toFixed(2)}`
}

export function createApp(bridge: EvenAppBridge) {
  const ui = createGlassesUi(bridge)
  let screen: Screen = 'calc'
  let bill = 50
  let tipPct = 20
  let split = 2

  function totals() {
    const tip = bill * (tipPct / 100)
    const total = bill + tip
    const each = total / split
    return { tip, total, each }
  }

  function buildView(): PageView {
    const { tip, total, each } = totals()
    if (screen === 'adjust') {
      return {
        hudText: [
          'ADJUST VALUES',
          '',
          `Bill: ${money(bill)}`,
          `Tip: ${tipPct}%`,
          `Split: ${split} people`,
        ].join('\n'),
        listItems: [
          'Bill −$5', 'Bill +$5',
          'Tip −1%', 'Tip +1%',
          'Split −1', 'Split +1',
          'Done',
        ],
        capture: 'menu',
      }
    }
    return {
      hudText: [
        'QUICK TIP',
        '',
        `Bill: ${money(bill)}  Tip: ${tipPct}%`,
        `Tip amt: ${money(tip)}`,
        `Total: ${money(total)}`,
        `Each (${split}): ${money(each)}`,
      ].join('\n'),
      listItems: [
        `Bill: ${money(bill)}`,
        `Tip: ${tipPct}%`,
        `Split: ${split}`,
        'Adjust Values',
        'Presets',
        'How to Play',
      ],
      capture: 'menu',
    }
  }

  async function sync(full = true): Promise<void> {
    const view = buildView()
    if (full) await ui.refresh(view)
    else await ui.updateHud(view.hudText)
  }

  async function handleSelect(index: number): Promise<void> {
    const item = buildView().listItems[index] ?? ''
    if (item === 'Back to Menu' || item === 'Back') { screen = 'calc'; return sync(true) }
    if (screen === 'adjust') {
      if (item === 'Bill −$5') bill = Math.max(5, bill - 5)
      else if (item === 'Bill +$5') bill = Math.min(500, bill + 5)
      else if (item === 'Tip −1%') tipPct = Math.max(0, tipPct - 1)
      else if (item === 'Tip +1%') tipPct = Math.min(40, tipPct + 1)
      else if (item === 'Split −1') split = Math.max(1, split - 1)
      else if (item === 'Split +1') split = Math.min(12, split + 1)
      else if (item === 'Done') screen = 'calc'
      return sync(true)
    }
    if (item.startsWith('Bill:')) {
      const idx = BILLS.indexOf(bill)
      bill = BILLS[(idx + 1) % BILLS.length]
      return sync(true)
    }
    if (item.startsWith('Tip:')) {
      const idx = TIPS.indexOf(tipPct)
      tipPct = TIPS[(idx + 1) % TIPS.length]
      return sync(true)
    }
    if (item.startsWith('Split:')) {
      const idx = SPLITS.indexOf(split)
      split = SPLITS[(idx + 1) % SPLITS.length]
      return sync(true)
    }
    if (item === 'Adjust Values') { screen = 'adjust'; return sync(true) }
    if (item === 'Presets') {
      bill = 75
      tipPct = 20
      split = 2
      return sync(true)
    }
    if (item === 'How to Play') {
      await ui.refresh({
        hudText: [
          'HOW TO PLAY',
          '',
          'Tap Bill/Tip/Split to cycle.',
          'Adjust Values for fine tune.',
          'HUD shows live totals.',
          'Double-tap to exit.',
        ].join('\n'),
        listItems: ['Back'],
        capture: 'menu',
      })
      return
    }
    if (item === 'Back') { screen = 'calc'; return sync(true) }
  }

  const handlers = {
    onSelect: (i: number) => { void handleSelect(i) },
    onHudTap: () => {},
    onScroll: () => {},
    onDoubleTap: () => { void bridge.shutDownPageContainer(1) },
    onExit: () => {},
  }

  return {
    async start(): Promise<void> {
      await ui.init(buildView())
      showCompanionReady()
      bindBridgeInput(bridge, handlers)
      bindKeyboardInput(handlers, () => 0, () => {}, () => buildView().listItems.length)
    },
  }
}
