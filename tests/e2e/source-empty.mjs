// Run against a local dev server: node tests/e2e/source-empty.mjs http://127.0.0.1:5199
import assert from 'node:assert/strict'
import { chromium } from 'playwright'

const browser = await chromium.launch({ headless: true })
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } })
  page.setDefaultTimeout(10000)
  const errors = []
  page.on('pageerror', error => errors.push(error.message))
  await page.route('https://**/*', route => route.abort())
  await page.goto(process.argv[2] || 'http://127.0.0.1:5199')
  await page.locator('.canvas-stage').waitFor()
  await page.waitForTimeout(1000)

  const tabButton = (index) => page.locator('.canvas-toolbar .view-tabs button').nth(index)

  const rows = await page.locator('.layer-row').count()
  assert.ok(rows > 0, 'sample document has layers')

  // 用户操作路径：预览界面全选 → 删除
  await page.keyboard.press('ControlOrMeta+a')
  assert.equal(await page.locator('.layer-row.selected').count(), rows, 'select-all highlights every layer')
  await page.keyboard.press('Delete')
  await page.waitForTimeout(300)
  assert.equal(await page.locator('.layer-row').count(), 0, 'all layers deleted')

  // 切换到源码页：不展示 <svg> 骨架，显示空状态
  await tabButton(1).click()
  await page.locator('.source-editor-wrap').waitFor()
  assert.equal(await page.locator('.source-editor').inputValue(), '', 'source draft is empty after deleting every layer')
  assert.equal(await page.locator('.source-highlight').textContent(), '', 'highlight pane is empty')
  await page.locator('.source-empty-state').waitFor()

  // 撤销恢复正常；重做回到空源码
  await tabButton(0).click()
  await page.keyboard.press('ControlOrMeta+z')
  await page.waitForTimeout(300)
  assert.ok((await page.locator('.layer-row').count()) > 0, 'undo restores layers')
  await tabButton(1).click()
  assert.ok((await page.locator('.source-editor').inputValue()).includes('<svg'), 'undo restores source code')
  await tabButton(0).click()
  await page.keyboard.press('ControlOrMeta+Shift+z')
  await page.waitForTimeout(300)
  await tabButton(1).click()
  assert.equal(await page.locator('.source-editor').inputValue(), '', 'redo empties the source view again')

  assert.equal(errors.length, 0, `page errors: ${errors.join('; ')}`)
  await page.screenshot({ path: '/tmp/vecsy-source-empty.png' })
  console.log('source-empty e2e passed')
} finally {
  await browser.close()
}
