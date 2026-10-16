// node tests/e2e/landing-page.mjs http://127.0.0.1:5173
import assert from 'node:assert/strict'
import { chromium } from 'playwright'

const origin = process.argv[2] || 'http://127.0.0.1:5173'
const browser = await chromium.launch({ headless: true })
try {
  const context = await browser.newContext({ reducedMotion: 'reduce' })
  const page = await context.newPage()
  const switchLanguage = async (language) => {
    await page.locator('.lp-language-trigger').click()
    const bounds = await page.locator('.lp-language-menu').boundingBox()
    const width = page.viewportSize().width
    assert.ok(bounds.x >= 0 && bounds.x + bounds.width <= width, 'language menu stays in the viewport')
    await page.locator(`.lp-language-menu [data-language="${language}"]`).click()
    assert.equal(await page.locator('.lp-language-trigger').getAttribute('aria-expanded'), 'false')
  }
  const errors = []
  page.on('pageerror', (error) => errors.push(error.message))
  page.on('console', (message) => { if (['error', 'warning'].includes(message.type())) errors.push(message.text()) })
  await page.goto(`${origin}/?lang=zh-CN`)
  await page.locator('.lp-hero').waitFor()
  assert.equal(await page.locator('h1').count(), 1)

  for (const width of [320, 390, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 })
    for (const language of ['en', 'zh-CN', 'zh-TW', 'ja']) {
      await switchLanguage(language)
      const layout = await page.evaluate(() => ({
        width: window.innerWidth,
        documentWidth: document.documentElement.scrollWidth,
        headingRight: document.querySelector('h1').getBoundingClientRect().right,
        wordRight: document.querySelector('.lp-hero-word').getBoundingClientRect().right,
      }))
      assert.ok(layout.documentWidth <= width, `${width}px ${language}: page must not scroll horizontally`)
      assert.ok(layout.wordRight <= width, `${width}px ${language}: hero title must fit`)
      assert.equal(await page.locator('html').getAttribute('lang'), language)
      assert.match(await page.locator('.lp-hero-actions a').first().getAttribute('href'), new RegExp(`lang=${language}$`))
    }
  }

  await switchLanguage('zh-CN')
  await page.getByRole('button', { name: '花园', exact: true }).click()
  assert.equal(await page.locator('.lp-demo-stage').evaluate((node) => node.style.getPropertyValue('--demo-accent')), '#b5bc73')
  await page.getByRole('tab', { name: '图层', exact: true }).click()
  await page.getByRole('button', { name: '星芒', exact: true }).click()
  assert.ok(await page.locator('.lp-demo-selection').isVisible())
  await page.getByRole('tab', { name: '源码', exact: true }).click()
  assert.match(await page.locator('.lp-demo-source').textContent(), /#b5bc73/)
  await page.getByRole('tab', { name: '源码', exact: true }).press('ArrowRight')
  assert.equal(await page.getByRole('tab', { name: '导出', exact: true }).getAttribute('aria-selected'), 'true')
  assert.equal(await page.locator('.lp-demo-export-format').count(), 3)

  await page.locator('#faq summary').nth(1).click()
  assert.ok(await page.locator('#faq details').nth(1).getAttribute('open') !== null)
  assert.ok(await page.locator('.lp-header.is-scrolled .lp-nav-cta').isVisible())

  await page.setViewportSize({ width: 390, height: 844 })
  await page.locator('#lp-menu-toggle').click()
  assert.equal(await page.locator('#lp-menu-toggle').getAttribute('aria-expanded'), 'true')
  await page.locator('#lp-nav-links a[href="#features"]').click()
  assert.equal(await page.locator('#lp-menu-toggle').getAttribute('aria-expanded'), 'false')
  assert.ok(page.url().endsWith('#features'))
  await page.goto(`${origin}/?lang=zh-CN`)
  await page.screenshot({ path: '/private/tmp/vecsy-landing-mobile.png', fullPage: true })

  await page.setViewportSize({ width: 1440, height: 1000 })
  await page.screenshot({ path: '/private/tmp/vecsy-landing-desktop.png' })
  await page.locator('.lp-language-trigger').click()
  await page.screenshot({ path: '/private/tmp/vecsy-language-menu.png' })
  await page.locator('[role="menuitemradio"][data-language="zh-CN"]').press('Escape')
  assert.equal(await page.locator('.lp-language-trigger').getAttribute('aria-expanded'), 'false')
  await page.getByRole('link', { name: '开始创作', exact: true }).nth(1).click()
  await page.locator('.canvas-stage').waitFor()
  assert.match(page.url(), /\/editor\/\?lang=zh-CN/)
  assert.equal(await page.locator('html').getAttribute('lang'), 'zh-CN')
  await page.locator('input[type=file][accept="image/svg+xml,.svg"]').setInputFiles({ name: 'landing-roundtrip.svg', mimeType: 'image/svg+xml', buffer: Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle id="keep-me" cx="50" cy="50" r="30" fill="red"/></svg>') })
  await page.locator('.svg-wrap #keep-me').waitFor()
  // Let the existing document autosave finish before navigating to the introduction.
  await page.waitForTimeout(1100)
  await page.getByRole('link', { name: 'Vecsy 首页', exact: true }).click()
  await page.locator('.lp-hero').waitFor()
  await page.getByRole('link', { name: '开始创作', exact: true }).nth(1).click()
  await page.locator('.svg-wrap #keep-me').waitFor()
  assert.equal(await page.locator('.svg-wrap #keep-me').getAttribute('fill'), 'red')
  await page.locator('.language-toggle').click()
  await page.getByRole('menuitemradio', { name: 'English', exact: true }).click()
  assert.match(page.url(), /lang=en/)
  await page.reload()
  await page.locator('.svg-wrap #keep-me').waitFor()
  assert.equal(await page.locator('html').getAttribute('lang'), 'en')
  assert.deepEqual(errors, [], 'all pages must have a clean console')
  console.log('PASS: 20 responsive/language combinations, demo, keyboard tabs, FAQ, mobile navigation, editor route and document round trip')
} finally {
  await browser.close()
}
