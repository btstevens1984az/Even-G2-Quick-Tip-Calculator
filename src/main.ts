import { waitForEvenAppBridge } from '@evenrealities/even_hub_sdk'
import { createApp } from './app'

try {
  const bridge = await waitForEvenAppBridge()
  const app = createApp(bridge)
  await app.start()
} catch (err) {
  console.error('[quick-tip] fatal', err)
}
