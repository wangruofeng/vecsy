// Run against a local dev server: node tests/e2e/canvas-multi-drag.mjs http://127.0.0.1:5186
import assert from 'node:assert/strict'
import { chromium } from 'playwright'

const browser = await chromium.launch({ headless: true })
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } })
  page.setDefaultTimeout(10000)
  const errors = []
  page.on('pageerror', error => errors.push(error.message))
  await page.route('https://**/*', route => route.abort())
  await page.goto(process.argv[2] || 'http://127.0.0.1:5186')
  await page.locator('.canvas-stage').waitFor()
  await page.waitForTimeout(1000)
  await page.locator('input[type=file][accept="image/svg+xml,.svg"]').setInputFiles({ name: 'multi-drag.svg', mimeType: 'image/svg+xml', buffer: Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"><rect id="background" y="100" width="400" height="180" fill="#aaa"/><rect id="first" x="50" y="80" width="50" height="80" fill="red"/><rect id="second" x="220" y="80" width="50" height="80" fill="blue"/></svg>') })
  const first = page.locator('.svg-wrap #first')
  const second = page.locator('.svg-wrap #second')
  const background = page.locator('.svg-wrap #background')
  const settle = () => page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))))
  const drag = async (x, y, dx, dy) => {
    await page.mouse.move(x, y)
    await page.mouse.down()
    await page.mouse.move(x + dx, y + dy, { steps: 10 })
    await page.mouse.up()
    await settle()
  }
  const a = await first.boundingBox(), b = await second.boundingBox()
  await drag(a.x - 10, a.y - 10, b.x + b.width - a.x + 20, a.height + 20)
  assert.equal(await page.locator('.layer-row.selected').count(), 2, 'marquee selects foreground layers only')
  const selected = await page.locator('.layer-row.selected').allTextContents()
  const bgBefore = await background.evaluate(node => node.outerHTML)
  const assertMove = async (dx, dy) => {
    const before = [await first.boundingBox(), await second.boundingBox()]
    const gapX = (before[0].x + before[0].width + before[1].x) / 2
    const gapY = before[0].y + before[0].height * .75
    await drag(gapX, gapY, dx, dy)
    assert.equal(await background.evaluate(node => node.outerHTML), bgBefore, 'dragging selection gap must not move background')
    assert.deepEqual(await page.locator('.layer-row.selected').allTextContents(), selected, 'preserves multi-selection')
    const after = [await first.boundingBox(), await second.boundingBox()]
    for (let i = 0; i < 2; i++) {
      assert.ok(Math.abs(after[i].x - before[i].x - dx) < 1, 'both layers move horizontally')
      assert.ok(Math.abs(after[i].y - before[i].y - dy) < 1, 'both layers move vertically')
    }
  }
  const originalMarkup = await page.locator('.svg-wrap').innerHTML()
  await assertMove(25, 15)
  await page.screenshot({ path: '/tmp/vecsy-multi-drag.png' })
  await page.keyboard.press('Control+z')
  await settle()
  assert.equal(await page.locator('.svg-wrap').innerHTML(), originalMarkup, 'one undo restores both layers')
  assert.deepEqual(await page.locator('.layer-row.selected').allTextContents(), selected)
  await page.getByRole('button', { name: /Zoom in|放大/ }).first().click()
  await settle()
  await assertMove(20, 10)
  // Outside the selection union, the background remains directly selectable.
  const bg = await background.boundingBox()
  await page.mouse.click(bg.x + bg.width - 15, bg.y + bg.height - 15)
  await settle()
  assert.equal(await page.locator('.layer-row.selected').count(), 1)
  assert.match(await page.locator('.layer-row.selected').innerText(), /background/)
  assert.deepEqual(errors, [])
  console.log('Multi-drag E2E passed: marquee, background gap, batch movement, selection preservation, undo, zoom, outside selection; no page errors')
} finally { await browser.close() }
