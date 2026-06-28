#!/usr/bin/env node
import { spawn } from 'node:child_process'
import { mkdir, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright'

const DEV_URL = process.env.DEV_URL ?? 'http://localhost:5173'
const AUTOMATION_PORT = process.env.SIM_AUTOMATION_PORT ?? '9898'
const BASE = `http://127.0.0.1:${AUTOMATION_PORT}`
const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const mediaDir = join(root, 'media')
const SCENES = [
  { file: '00-cover-glasses', media: 'cover' },
  { file: '01-title-glasses', media: 'title' },
  { file: '02-active-glasses', media: 'active' },
]
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

async function captureGlassesFrame(browser, scene) {
  const url = `${DEV_URL}/media-export.html?media=${encodeURIComponent(scene.media)}`
  const page = await browser.newPage()
  await page.setViewportSize({ width: 576, height: 288 })
  await page.goto(url, { waitUntil: 'networkidle' })
  await page.waitForSelector('body[data-ready="1"]', { timeout: 15_000 })
  await sleep(500)
  await page.locator('#frame').screenshot({ path: join(mediaDir, `${scene.file}.png`), type: 'png' })
  await page.close()
}

async function main() {
  await mkdir(mediaDir, { recursive: true })
  const probe = await fetch(DEV_URL, { method: 'HEAD' }).catch(() => null)
  if (!probe?.ok) throw new Error(`Dev server not reachable at ${DEV_URL}`)
  const browser = await chromium.launch({ headless: true })
  for (const scene of SCENES) {
    console.log('Capturing', scene.file)
    await captureGlassesFrame(browser, scene)
  }
  await browser.close()
  console.log('Done — media/ ready for Even Hub upload.')
}

main().catch((e) => { console.error(e); process.exit(1) })
