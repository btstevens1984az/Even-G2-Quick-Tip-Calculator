#!/usr/bin/env node
/** Generate static media PNGs without a dev server. */
import { mkdir } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const mediaDir = join(root, 'media')

async function main() {
  await mkdir(mediaDir, { recursive: true })
  const browser = await chromium.launch({ headless: true })
  for (const scene of ['cover', 'title', 'active']) {
    const page = await browser.newPage()
    await page.setViewportSize({ width: 576, height: 288 })
    await page.goto(`file://${join(root, 'media-export.html')}?media=${scene}`, { waitUntil: 'networkidle' })
    await page.waitForSelector('body[data-ready="1"]')
    const file = scene === 'cover' ? '00-cover-glasses' : scene === 'title' ? '01-title-glasses' : '02-active-glasses'
    await page.locator('#frame').screenshot({ path: join(mediaDir, `${file}.png`), type: 'png' })
    await page.close()
    console.log('  ✓', file)
  }
  const phone = await browser.newPage()
  await phone.setViewportSize({ width: 390, height: 844 })
  await phone.goto(`file://${join(root, 'index.html')}`, { waitUntil: 'networkidle' })
  await phone.screenshot({ path: join(mediaDir, '01-title-webview.png'), type: 'png' })
  await phone.close()
  await browser.close()
  console.log('  ✓ 01-title-webview')
}

main().catch(e => { console.error(e); process.exit(1) })
