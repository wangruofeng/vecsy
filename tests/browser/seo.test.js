import { describe, expect, it } from 'vitest'
import { COPY } from '../../src/app/copy.js'
import { updatePageMetadata } from '../../src/app/seo.js'

describe('page metadata', () => {
  it('keeps metadata consistent across repeated language switches', () => {
    const page = document.implementation.createHTMLDocument('')
    page.head.innerHTML += `<meta name="description"><meta property="og:title"><meta property="og:description"><meta property="og:locale"><meta property="og:image:alt"><meta name="twitter:title"><meta name="twitter:description"><meta name="twitter:image:alt"><link rel="canonical" href="https://vecsy.top/">`
    const originalSchema = { '@context': 'https://schema.org', '@graph': [{ '@type': 'WebApplication', '@id': 'https://vecsy.top/#app', name: 'Vecsy', description: COPY.en.metaDescription, inLanguage: ['en', 'zh-Hans', 'zh-Hant', 'ja'], featureList: ['Export SVG'] }, { '@type': 'WebSite', '@id': 'https://vecsy.top/#website', name: 'Vecsy' }] }
    const script = page.createElement('script')
    script.type = 'application/ld+json'
    script.id = 'vecsy-structured-data'
    script.textContent = JSON.stringify(originalSchema)
    page.head.append(script)
    for (const language of ['en', 'zh-CN', 'zh-TW', 'ja', 'en']) {
      const copy = COPY[language]
      updatePageMetadata(page, language, copy)
      const graph = JSON.parse(script.textContent)['@graph']
      expect(graph[0].description).toBe(copy.metaDescription)
      expect(graph[0]['@id']).toBe(originalSchema['@graph'][0]['@id'])
      expect(graph[0].featureList).toEqual(['Export SVG'])
      expect(graph[0].inLanguage).toEqual(originalSchema['@graph'][0].inLanguage)
      expect(graph[1]).toEqual(originalSchema['@graph'][1])
      expect(page.title).toBe(copy.documentTitle)
      expect(page.documentElement.lang).toBe(language)
      expect(page.querySelector('meta[name="description"]').content).toBe(copy.metaDescription)
      expect(page.querySelector('meta[property="og:title"]').content).toBe(copy.documentTitle)
      expect(page.querySelector('meta[name="twitter:description"]').content).toBe(copy.metaDescription)
      expect(page.querySelector('meta[name="twitter:image:alt"]').content).toBe(copy.socialImageAlt)
      const alternates = [...page.querySelectorAll('meta[property="og:locale:alternate"]')].map((meta) => meta.content)
      expect(new Set(alternates).size).toBe(3)
      expect(alternates).not.toContain(page.querySelector('meta[property="og:locale"]').content)
      expect(page.querySelector('link[rel="canonical"]').href).toBe('https://vecsy.top/')
    }
  })
})
