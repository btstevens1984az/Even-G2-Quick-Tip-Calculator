#!/usr/bin/env node
/**
 * Pack an Even Hub plugin the same way as working projects (craps-g2).
 * - Validates app.json + dist/index.html before packing
 * - Removes stale .ehpk from dist/ (prevents nested pack bugs)
 * - Writes .ehpk to project root and copies to dist/
 */
import { execSync } from 'node:child_process'
import { copyFileSync, existsSync, readFileSync, readdirSync, rmSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const dist = join(root, 'dist')
const appJsonPath = join(root, 'app.json')
const outName = process.env.EHPK_OUT || process.argv[2] || 'app.ehpk'
const outPath = join(root, outName)

function fail(msg) {
  console.error(`[pack] ${msg}`)
  process.exit(1)
}

console.log('[pack] building…')
execSync('npm run build', { cwd: root, stdio: 'inherit' })

if (!existsSync(appJsonPath)) fail('app.json missing')
if (!existsSync(join(dist, 'index.html'))) fail('dist/index.html missing — run build first')

let manifest
try {
  manifest = JSON.parse(readFileSync(appJsonPath, 'utf8'))
} catch {
  fail('app.json is not valid JSON')
}

for (const key of ['package_id', 'edition', 'name', 'version', 'min_app_version', 'min_sdk_version', 'entrypoint']) {
  if (!manifest[key]) fail(`app.json missing required field: ${key}`)
}

const entry = join(dist, manifest.entrypoint)
if (!existsSync(entry)) fail(`entrypoint not found in dist/: ${manifest.entrypoint}`)

for (const f of readdirSync(dist)) {
  if (f.endsWith('.ehpk')) rmSync(join(dist, f), { force: true })
}
if (existsSync(outPath)) rmSync(outPath, { force: true })

console.log('[pack] validating manifest with evenhub…')
execSync(`npx evenhub pack "${appJsonPath}" "${dist}" -o "${outPath}"`, {
  cwd: root,
  stdio: 'inherit',
})

if (!existsSync(outPath)) fail(`pack failed — ${outName} not created`)

const distCopy = join(dist, outName)
copyFileSync(outPath, distCopy)

const bytes = readFileSync(outPath).length
console.log(`[pack] ✓ ${outPath} (${bytes} bytes)`)
console.log(`[pack] ✓ ${distCopy} (copy)`)
console.log(`[pack] package_id: ${manifest.package_id}`)
console.log(`[pack] version: ${manifest.version}`)
