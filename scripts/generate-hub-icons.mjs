#!/usr/bin/env node
/** Generate monochrome Hub icon assets (foreground + background). */
import { mkdir, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const media = join(root, 'media')
const label = process.env.ICON_LABEL || 'APP'

async function renderIcon(file, draw) {
  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage()
  await page.setViewportSize({ width: 512, height: 512 })
  await page.setContent(`<!doctype html><html><body style="margin:0;background:#000"><canvas id=c width=512 height=512></canvas><script>
    const ctx = document.getElementById('c').getContext('2d');
    (${draw.toString()})(ctx, ${JSON.stringify(label)});
    document.body.dataset.ready='1';
  </script></body></html>`)
  await page.waitForSelector('body[data-ready="1"]')
  await page.locator('#c').screenshot({ path: file, type: 'png' })
  await browser.close()
}

const fgDraw = (ctx, text) => {
  ctx.fillStyle = '#000'
  ctx.fillRect(0, 0, 512, 512)
  ctx.strokeStyle = '#fff'
  ctx.lineWidth = 8
  ctx.strokeRect(64, 64, 384, 384)
  ctx.fillStyle = '#fff'
  ctx.font = 'bold 48px monospace'
  ctx.textAlign = 'center'
  ctx.fillText(text.slice(0, 12), 256, 280)
}

const bgDraw = (ctx) => {
  ctx.fillStyle = '#000'
  ctx.fillRect(0, 0, 512, 512)
  for (let i = 0; i < 8; i++) {
    ctx.strokeStyle = `rgb(${20 + i * 8},${20 + i * 8},${20 + i * 8})`
    ctx.lineWidth = 2
    ctx.strokeRect(32 + i * 6, 32 + i * 6, 448 - i * 12, 448 - i * 12)
  }
}

await mkdir(media, { recursive: true })
await renderIcon(join(media, 'icon-foreground.png'), fgDraw)
await renderIcon(join(media, 'icon-background.png'), bgDraw)
console.log('  ✓ icon-foreground.png')
console.log('  ✓ icon-background.png')
