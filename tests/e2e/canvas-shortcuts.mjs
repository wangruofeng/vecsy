// Run against a local dev server: node tests/e2e/canvas-shortcuts.mjs http://127.0.0.1:5178
import assert from 'node:assert/strict'
import { chromium } from 'playwright'

const browser = await chromium.launch({ headless: true })

try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } })
  const errors = []
  page.on('pageerror', (error) => errors.push(error.message))
  await page.route('https://**/*', (route) => route.abort())
  await page.goto(process.argv[2] || 'http://127.0.0.1:5178')

  const tools = page.locator('.canvas-mode-tools button')
  const isSelected = async (index) => tools.nth(index).getAttribute('aria-pressed')

  await page.locator('.canvas-stage').click()
  await page.keyboard.press('h')
  assert.equal(await isSelected(1), 'true', 'H switches to the pan tool')

  await page.keyboard.press('v')
  assert.equal(await isSelected(0), 'true', 'V switches to the select tool')

  await page.keyboard.down('Space')
  assert.equal(await isSelected(1), 'true', 'holding Space temporarily switches to the pan tool')
  await page.keyboard.up('Space')
  assert.equal(await isSelected(0), 'true', 'releasing Space restores the previous tool')

  await page.getByRole('button', { name: /Source|源码/ }).click()
  const source = page.locator('textarea').first()
  await source.click()
  await page.keyboard.press('h')
  await page.keyboard.press('v')
  await page.keyboard.press('Space')
  assert.match(await source.inputValue(), /hv /, 'text input preserves native H, V, and Space entry')
  assert.deepEqual(errors, [])
  console.log('Canvas shortcuts E2E passed: V/H mode switching and temporary Space pan')
} finally {
  await browser.close()
}
