// Run against a production preview: node tests/e2e/seo-pages.mjs http://127.0.0.1:4173
import assert from 'node:assert/strict'
import { chromium } from 'playwright'

const origin = process.argv[2] || 'http://127.0.0.1:4173'
const browser = await chromium.launch({ headless: true })
try {
  const staticContext = await browser.newContext({ javaScriptEnabled: false })
  const staticPage = await staticContext.newPage()
  const titles = []
  for (const path of ['/', '/editor/']) {
    const response = await staticPage.goto(`${origin}${path}`)
    assert.equal(response.status(), 200)
    assert.ok(await staticPage.locator('.seo-fallback h1').isVisible(), `${path} has readable content without JavaScript`)
    titles.push(await staticPage.title())
    assert.equal(await staticPage.locator('link[rel=canonical]').getAttribute('href'), `https://vecsy.top${path}`)
    assert.equal(await staticPage.locator('meta[property="og:url"]').getAttribute('content'), `https://vecsy.top${path}`)
    assert.equal(await staticPage.locator('nav a[lang]').count(), 4)
    if (path === '/') assert.equal(await staticPage.locator('#faq h3').count(), 6)
    else assert.ok(await staticPage.getByText('Enable JavaScript to use the editor.', { exact: false }).isVisible())
  }
  assert.notEqual(titles[0], titles[1], 'homepage and editor have distinct static titles')

  const context = await browser.newContext()
  const page = await context.newPage()
  const errors = []
  page.on('pageerror', (error) => errors.push(error.message))
  for (const path of ['/', '/editor/']) {
    for (const language of ['en', 'zh-CN']) {
      await page.goto(`${origin}${path}?lang=${language}`)
      await page.locator(path === '/' ? '.lp-hero' : '.canvas-stage').waitFor()
      await page.waitForFunction((lang) => document.documentElement.lang === lang, language)
      const metadata = await page.evaluate(() => ({
        title: document.title,
        ogTitle: document.querySelector('meta[property="og:title"]').content,
        description: document.querySelector('meta[name="description"]').content,
        twitterDescription: document.querySelector('meta[name="twitter:description"]').content,
        canonical: document.querySelector('link[rel=canonical]').href,
        graph: JSON.parse(document.getElementById('vecsy-structured-data').textContent)['@graph'],
      }))
      assert.equal(metadata.title, metadata.ogTitle)
      assert.equal(metadata.description, metadata.twitterDescription)
      assert.equal(metadata.canonical, `https://vecsy.top${path}`)
      assert.equal(metadata.graph.find((entity) => entity['@type'] === 'WebPage').description, metadata.description)
      assert.equal(metadata.graph.find((entity) => entity['@type'] === 'WebApplication').url, 'https://vecsy.top/editor/')
    }
  }
  assert.deepEqual(errors, [])
  console.log('PASS: production homepage/editor HTTP 200, readable without JavaScript, distinct static SEO, localized runtime metadata and canonical entity URLs')
} finally {
  await browser.close()
}
