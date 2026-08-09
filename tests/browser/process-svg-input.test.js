import { describe, expect, it } from 'vitest'
import { processSvgInput } from '../../src/editor/process-svg-input.js'

describe('SVG input processing', () => {
  it('removes executable and network-capable untrusted content', () => {
    const result = processSvgInput('<svg xmlns="http://www.w3.org/2000/svg" onload="alert(1)"><script>alert(1)</script><foreignObject><iframe src="https://example.com"/></foreignObject><image href="https://example.com/a.png"/><rect fill="url(https://example.com/pattern)"/><path style="fill:url(javascript:alert(1))"/></svg>')

    expect(result.status).toBe('sanitized')
    expect(result.markup).not.toMatch(/script|foreignObject|iframe|onload|https:\/\/example\.com|javascript:/i)
    expect(result.removedFeatures['blocked-element']).toBeGreaterThan(0)
    expect(result.removedFeatures['event-handler']).toBe(1)
    expect(result.removedFeatures['external-url']).toBeGreaterThan(0)
  })

  it('preserves safe local references and raster data URLs', () => {
    const result = processSvgInput('<svg xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="paint"/></defs><rect fill="url(#paint)"/><image href="data:image/png;base64,aGVsbG8="/></svg>')

    expect(result.status).toBe('accepted')
    expect(result.markup).toContain('url(#paint)')
    expect(result.markup).toContain('data:image/png;base64,aGVsbG8=')
  })

  it('keeps vetted app-owned styles but strips them from untrusted SVG', () => {
    const markup = '<svg xmlns="http://www.w3.org/2000/svg"><style>.pulse { opacity: .5 }</style><rect class="pulse"/></svg>'

    expect(processSvgInput(markup).markup).not.toContain('<style')
    expect(processSvgInput(markup, { source: 'app-owned' }).markup).toContain('<style')
  })

  it('removes app-owned styles that request external resources', () => {
    const result = processSvgInput('<svg xmlns="http://www.w3.org/2000/svg"><style>@import url(https://example.com/theme.css); .mark { fill: red }</style><rect class="mark"/></svg>', { source: 'app-owned' })

    expect(result.status).toBe('sanitized')
    expect(result.markup).not.toContain('<style')
    expect(result.removedFeatures['unsafe-style']).toBe(1)
  })

  it('rejects malformed input without producing preview markup', () => {
    const result = processSvgInput('<svg><rect></svg>')

    expect(result).toMatchObject({ status: 'rejected', markup: '' })
  })

  it('is idempotent after sanitization', () => {
    const first = processSvgInput('<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script><rect onload="alert(2)" width="10"/></svg>')
    const second = processSvgInput(first.markup)

    expect(second.status).toBe('accepted')
    expect(second.markup).toBe(first.markup)
  })

  it('blocks encoded script URLs without breaking local SVG paint references', () => {
    const result = processSvgInput('<svg xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="paint"><stop offset="0"/></linearGradient><clipPath id="clip"><rect width="1" height="1"/></clipPath></defs><a href="java&#x73;cript:alert(1)"><rect fill="url(#paint)" clip-path="url(#clip)"/></a></svg>')

    expect(result.status).toBe('sanitized')
    expect(result.markup).not.toMatch(/javascript:/i)
    expect(result.markup).toContain('url(#paint)')
    expect(result.markup).toContain('url(#clip)')
  })

  it('removes SVG links even when they point to a local fragment', () => {
    const result = processSvgInput('<svg xmlns="http://www.w3.org/2000/svg"><a href="#target"><rect width="10" height="10"/></a></svg>')

    expect(result.status).toBe('sanitized')
    expect(result.markup).not.toContain('href=')
  })
})
