export const DISPLAY_W = 576
export const DISPLAY_H = 288
export const PANEL_H = 144

export const HUD_X = 0
export const HUD_Y = 0
export const HUD_W = DISPLAY_W
export const HUD_H = PANEL_H

export const MENU_X = 0
export const MENU_Y = PANEL_H
export const MENU_W = DISPLAY_W
export const MENU_H = PANEL_H

export const SCENE_X = 0
export const SCENE_Y = 0
export const SCENE_W = 288
export const SCENE_H = PANEL_H

export const INFO_X = 288
export const INFO_Y = 0
export const INFO_W = 288
export const INFO_H = PANEL_H

export const CONTAINER_IDS = {
  scene: 3,
  hud: 4,
  menu: 10,
} as const
