import { existsSync, readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { SVG_COLLECTIONS } from '../../src/app/svg-collections.js'

const headers = readFileSync(new URL('../../public/_headers', import.meta.url), 'utf8')

function cspSources(directive) {
  const match = headers.match(new RegExp(`${directive} ([^;]+)`))
  return match?.[1].split(/\s+/) || []
}

describe('content security policy', () => {
  it('keeps SVG collection previews and imports on local assets', () => {
    const assetUrls = new Set()

    for (const item of SVG_COLLECTIONS.flatMap((collection) => collection.items)) {
      if (item.url) assetUrls.add(item.url)
      if (item.editableUrl) assetUrls.add(item.editableUrl)
    }

    expect([...assetUrls].every((url) => !url.startsWith('https://'))).toBe(true)
    expect([...assetUrls].every((url) => existsSync(new URL(`../../public/${url.replace(/^\//, '')}`, import.meta.url)))).toBe(true)
    expect(cspSources('img-src')).toEqual(["'self'", 'data:', 'blob:'])
    expect(cspSources('connect-src')).toEqual(["'self'"])
  })
})
