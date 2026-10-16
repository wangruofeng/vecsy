import { describe, expect, it } from 'vitest'
import { COPY, LANGUAGES } from '../../src/app/copy.js'
import { updatePageMetadata } from '../../src/app/seo.js'

const parser = new DOMParser()
const pages = [
  { page: 'landing', path: '/', file: '/index.html', titleKey: 'landingDocumentTitle', descriptionKey: 'landingMetaDescription' },
  { page: 'editor', path: '/editor/', file: '/editor/index.html', titleKey: 'documentTitle', descriptionKey: 'metaDescription' },
]

async function readPage(file) {
  const response = await fetch(file)
  expect(response.ok).toBe(true)
  return parser.parseFromString(await response.text(), 'text/html')
}

describe('page metadata', () => {
  it('serves distinct homepage and editor metadata before JavaScript runs', async () => {
    const titles = []
    const descriptions = []
    for (const route of pages) {
      const page = await readPage(route.file)
      const canonical = `https://vecsy.top${route.path}`
      const graph = JSON.parse(page.getElementById('vecsy-structured-data').textContent)['@graph']
      const webpage = graph.find((entity) => entity['@type'] === 'WebPage')
      const app = graph.find((entity) => entity['@type'] === 'WebApplication')
      expect(page.title).toBe(COPY.en[route.titleKey])
      expect(page.querySelector('meta[name="description"]').content).toBe(COPY.en[route.descriptionKey])
      expect(page.querySelectorAll('link[rel="canonical"]')).toHaveLength(1)
      expect(page.querySelector('link[rel="canonical"]').getAttribute('href')).toBe(canonical)
      expect(page.querySelector('meta[property="og:url"]').content).toBe(canonical)
      expect(page.querySelector('meta[name="twitter:title"]').content).toBe(page.title)
      expect(page.querySelector('meta[name="robots"]').content).toContain('index, follow')
      expect(page.querySelector('#root main h1').textContent).toBe(page.title)
      expect(page.querySelector('link[hreflang]')).toBeNull()
      expect(webpage['@id']).toBe(`${canonical}#webpage`)
      expect(webpage.url).toBe(canonical)
      expect(webpage.description).toBe(COPY.en[route.descriptionKey])
      expect(webpage.mainEntity['@id']).toBe(app['@id'])
      expect(app['@id']).toBe('https://vecsy.top/#app')
      expect(app.url).toBe('https://vecsy.top/editor/')
      expect(app.offers.price).toBe('0')
      titles.push(page.title)
      descriptions.push(webpage.description)
    }
    expect(new Set(titles).size).toBe(2)
    expect(new Set(descriptions).size).toBe(2)
  })

  it('keeps each page canonical and the entity graph consistent through repeated language switches', async () => {
    for (const route of pages) {
      const page = await readPage(route.file)
      const canonical = `https://vecsy.top${route.path}`
      const initialGraph = JSON.parse(page.getElementById('vecsy-structured-data').textContent)['@graph']
      for (const language of ['en', 'zh-CN', 'zh-TW', 'ja', 'en']) {
        const copy = COPY[language]
        updatePageMetadata(page, language, copy, route.page)
        const graph = JSON.parse(page.getElementById('vecsy-structured-data').textContent)['@graph']
        const webpage = graph.find((entity) => entity['@type'] === 'WebPage')
        const app = graph.find((entity) => entity['@type'] === 'WebApplication')
        expect(graph.map((entity) => entity['@id'])).toEqual(initialGraph.map((entity) => entity['@id']))
        expect(webpage.description).toBe(copy[route.descriptionKey])
        expect(webpage.inLanguage).toBe(language)
        expect(app.description).toBe(copy.metaDescription)
        expect(app.inLanguage).toEqual(['en', 'zh-Hans', 'zh-Hant', 'ja'])
        expect(app.featureList).toEqual(copy.landingFeatureBodies)
        expect(graph.find((entity) => entity['@type'] === 'WebSite').url).toBe('https://vecsy.top/')
        expect(page.title).toBe(copy[route.titleKey])
        expect(page.documentElement.lang).toBe(language)
        expect(page.querySelector('meta[name="description"]').content).toBe(copy[route.descriptionKey])
        expect(page.querySelector('meta[property="og:title"]').content).toBe(copy[route.titleKey])
        expect(page.querySelector('meta[name="twitter:description"]').content).toBe(copy[route.descriptionKey])
        expect(page.querySelector('meta[name="twitter:image:alt"]').content).toBe(copy.socialImageAlt)
        expect(page.querySelector('meta[property="og:url"]').content).toBe(canonical)
        expect(page.querySelector('link[rel="canonical"]').getAttribute('href')).toBe(canonical)
        const alternates = [...page.querySelectorAll('meta[property="og:locale:alternate"]')].map((meta) => meta.content)
        expect(new Set(alternates).size).toBe(3)
        expect(alternates).not.toContain(page.querySelector('meta[property="og:locale"]').content)
      }
    }
  })

  it('lists only canonical pages in the sitemap and keeps the crawler policy intact', async () => {
    const sitemap = parser.parseFromString(await (await fetch('/sitemap.xml')).text(), 'application/xml')
    const locations = [...sitemap.querySelectorAll('loc')].map((node) => node.textContent)
    expect(locations.sort()).toEqual(['https://vecsy.top/', 'https://vecsy.top/editor/', ...LANGUAGES.map(({ code }) => `https://vecsy.top/guide/${code}/`)].sort())
    expect(locations.every((location) => !location.includes('?'))).toBe(true)
    const robots = await (await fetch('/robots.txt')).text()
    expect(robots).toContain('User-agent: *\nAllow: /')
    expect(robots).toContain('Sitemap: https://vecsy.top/sitemap.xml')
    expect(robots).toContain('User-agent: GPTBot\nDisallow: /')
  })
})
