import {
  CreateStartUpPageContainer,
  ImageContainerProperty,
  ImageRawDataUpdate,
  ImageRawDataUpdateResult,
  ListContainerProperty,
  ListItemContainerProperty,
  RebuildPageContainer,
  StartUpPageCreateResult,
  TextContainerProperty,
  TextContainerUpgrade,
  type EvenAppBridge,
} from '@evenrealities/even_hub_sdk'
import {
  CONTAINER_IDS,
  HUD_H,
  HUD_W,
  HUD_X,
  HUD_Y,
  INFO_H,
  INFO_W,
  INFO_X,
  INFO_Y,
  MENU_H,
  MENU_W,
  MENU_X,
  MENU_Y,
  SCENE_H,
  SCENE_W,
  SCENE_X,
  SCENE_Y,
} from './layout'

export type CaptureTarget = 'menu' | 'hud' | 'info' | 'none'

export interface PageView {
  hudText: string
  infoText?: string
  listItems: string[]
  capture: CaptureTarget
  showScene?: boolean
}

export function createGlassesUi(bridge: EvenAppBridge) {
  let startupDone = false
  let sceneReady = false
  let renderChain: Promise<void> = Promise.resolve()
  let renderGen = 0
  let pushChain: Promise<void> = Promise.resolve()
  let statusChain: Promise<void> = Promise.resolve()
  let lastView: PageView | null = null

  function mainText(view: PageView, capture: boolean): TextContainerProperty {
    const onScene = !!view.showScene
    const body = onScene && view.infoText
      ? `${view.hudText}\n${view.infoText}`.slice(0, 1000)
      : view.hudText.slice(0, 1000)
    return new TextContainerProperty({
      xPosition: onScene ? INFO_X : HUD_X,
      yPosition: onScene ? INFO_Y : HUD_Y,
      width: onScene ? INFO_W : HUD_W,
      height: onScene ? INFO_H : HUD_H,
      borderWidth: 1,
      borderColor: 10,
      paddingLength: 4,
      containerID: CONTAINER_IDS.hud,
      containerName: 'hud',
      content: body,
      isEventCapture: capture ? 1 : 0,
    })
  }

  function scenePlaceholder(): ImageContainerProperty {
    return new ImageContainerProperty({
      xPosition: SCENE_X,
      yPosition: SCENE_Y,
      width: SCENE_W,
      height: SCENE_H,
      containerID: CONTAINER_IDS.scene,
      containerName: 'scene',
    })
  }

  function buildList(items: string[], capture: boolean): ListContainerProperty | null {
    if (items.length === 0) return null
    return new ListContainerProperty({
      xPosition: MENU_X,
      yPosition: MENU_Y,
      width: MENU_W,
      height: MENU_H,
      borderWidth: 0,
      borderColor: 5,
      paddingLength: 0,
      containerID: CONTAINER_IDS.menu,
      containerName: 'menu',
      itemContainer: new ListItemContainerProperty({
        itemCount: items.length,
        itemWidth: 0,
        isItemSelectBorderEn: 1,
        itemName: items.map(i => i.slice(0, 64)),
      }),
      isEventCapture: capture ? 1 : 0,
    })
  }

  function pagePayload(view: PageView) {
    const cap = view.capture
    const texts = [mainText(view, cap === 'hud' || cap === 'info')]
    const lists = buildList(view.listItems, cap === 'menu')
    const images = view.showScene ? [scenePlaceholder()] : []
    const total = texts.length + images.length + (lists ? 1 : 0)
    return {
      containerTotalNum: total,
      textObject: texts,
      imageObject: images,
      listObject: lists ? [lists] : [],
    }
  }

  async function rebuild(view: PageView): Promise<void> {
    lastView = view
    const gen = ++renderGen
    const payload = pagePayload(view)
    renderChain = renderChain.then(async () => {
      if (gen !== renderGen) return
      if (!startupDone) {
        const result = await bridge.createStartUpPageContainer(
          new CreateStartUpPageContainer(payload),
        )
        startupDone = true
        if (result !== StartUpPageCreateResult.success) {
          await bridge.rebuildPageContainer(new RebuildPageContainer(payload))
        }
      } else {
        await bridge.rebuildPageContainer(new RebuildPageContainer(payload))
      }
      sceneReady = !!view.showScene
    })
    await renderChain
  }

  async function updateHud(text: string): Promise<void> {
    if (!startupDone) return
    statusChain = statusChain.then(async () => {
      try {
        await bridge.textContainerUpgrade(new TextContainerUpgrade({
          containerID: CONTAINER_IDS.hud,
          containerName: 'hud',
          content: text.slice(0, 2000),
        }))
      } catch (err) {
        console.warn('[ui] hud upgrade failed', err)
      }
    })
    await statusChain
  }

  async function updateInfo(text: string): Promise<void> {
    if (!startupDone || !lastView) return
    const merged = lastView.showScene
      ? `${lastView.hudText}\n${text}`.slice(0, 2000)
      : text.slice(0, 2000)
    lastView = { ...lastView, infoText: text }
    statusChain = statusChain.then(async () => {
      try {
        await bridge.textContainerUpgrade(new TextContainerUpgrade({
          containerID: CONTAINER_IDS.hud,
          containerName: 'hud',
          content: merged,
        }))
      } catch (err) {
        console.warn('[ui] info upgrade failed', err)
      }
    })
    await statusChain
  }

  async function pushScene(scene: Uint8Array): Promise<void> {
    if (!sceneReady) return
    pushChain = pushChain.then(async () => {
      try {
        const result = await bridge.updateImageRawData(
          new ImageRawDataUpdate({
            containerID: CONTAINER_IDS.scene,
            containerName: 'scene',
            imageData: scene,
          }),
        )
        if (!ImageRawDataUpdateResult.isSuccess(result)) {
          console.warn('[ui] scene push:', result)
        }
      } catch (err) {
        console.warn('[ui] scene push failed', err)
      }
    })
    await pushChain
  }

  return {
    init: (view: PageView) => rebuild(view),
    refresh: (view: PageView) => rebuild(view),
    updateHud,
    updateInfo,
    pushScene,
    isSceneReady: () => sceneReady,
  }
}
