import { describe, expect, it } from 'vitest'
import { COPY, LANGUAGES } from '../../src/app/copy.js'
import { processSvgInput } from '../../src/editor/process-svg-input.js'

const parser = new DOMParser()

describe('public GEO guides', () => {
  it('exposes a semantic homepage fallback with consistent initial schema and guide links', async () => {
    const response = await fetch('/index.html')
    expect(response.ok).toBe(true)
    const page = parser.parseFromString(await response.text(), 'text/html')
    expect(page.querySelector('#root main h1')).not.toBeNull()
    const schema = JSON.parse(page.querySelector('#vecsy-structured-data').textContent)
    const app = schema['@graph'].find((entity) => entity['@id'] === 'https://vecsy.top/#app')
    expect(app.description).toBe(page.querySelector('meta[name="description"]').content)
    for (const { code } of LANGUAGES) {
      expect(page.querySelector(`#root main a[href="/guide/${code}/"]`)).not.toBeNull()
    }
  })

  it('serves all advertised languages with readable content, reciprocal alternates and matching schema', async () => {
    const response = await fetch('/sitemap.xml')
    expect(response.ok).toBe(true)
    const sitemap = parser.parseFromString(await response.text(), 'application/xml')
    expect(sitemap.querySelector('parsererror')).toBeNull()
    const locations = [...sitemap.querySelectorAll('loc')].map((node) => node.textContent)
    for (const { code } of LANGUAGES) {
      const response = await fetch(`/guide/${code}/index.html`)
      expect(response.ok).toBe(true)
      const page = parser.parseFromString(await response.text(), 'text/html')
      const copy = COPY[code]
      const canonical = `https://vecsy.top/guide/${code}/`
      expect(page.documentElement.lang).toBe(code)
      expect(page.querySelectorAll('h1')).toHaveLength(1)
      expect(page.querySelector('main h1').textContent).toBe(copy.guideTitle)
      expect(page.querySelector('main > p').textContent).toBe(copy.guideSummary)
      expect([...page.querySelectorAll('#steps li')].map((node) => node.textContent)).toEqual(copy.guideSteps)
      expect([...page.querySelectorAll('#faq h3')].map((node) => node.textContent)).toEqual(copy.guideFaq.map(([question]) => question))
      expect([...page.querySelectorAll('#faq p')].map((node) => node.textContent)).toEqual(copy.guideFaq.map(([, answer]) => answer))
      expect(page.querySelector('link[rel="canonical"]').getAttribute('href')).toBe(canonical)
      expect(locations).toContain(canonical)
      expect([...page.querySelectorAll('link[hreflang]')].map((node) => node.hreflang).sort()).toEqual([...LANGUAGES.map(({ code }) => code), 'x-default'].sort())
      for (const { code: alternate } of LANGUAGES) {
        expect(page.querySelector(`link[hreflang="${alternate}"]`).getAttribute('href')).toBe(`https://vecsy.top/guide/${alternate}/`)
        expect(page.querySelector(`nav a[lang="${alternate}"]`).getAttribute('href')).toBe(`/guide/${alternate}/`)
      }
      expect(page.querySelector('main a').getAttribute('href')).toBe('/')
      const schema = JSON.parse(page.querySelector('script[type="application/ld+json"]').textContent)
      expect(schema.name).toBe(copy.guideTitle)
      expect(schema.description).toBe(copy.guideSummary)
      expect(schema.url).toBe(canonical)
      expect(schema.inLanguage).toBe(code)
      expect(page.querySelector('script[src]')).toBeNull()
    }
  })

  it('filters remote image references as stated in the privacy answer', () => {
    const result = processSvgInput('<svg xmlns="http://www.w3.org/2000/svg"><image href="https://example.com/image.png" width="10" height="10"/></svg>')
    expect(result.status).toBe('sanitized')
    const svg = parser.parseFromString(result.markup, 'image/svg+xml')
    expect(svg.querySelector('image').hasAttribute('href')).toBe(false)
    expect(result.removedFeatures['external-url']).toBe(1)
  })
})
