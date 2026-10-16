import { afterAll, afterEach, describe, expect, it, vi } from 'vitest'
import { act, createElement } from 'react'
import { createRoot } from 'react-dom/client'
import LandingPage from '../../src/components/landing/LandingPage.jsx'
import ProductDemo from '../../src/components/landing/ProductDemo.jsx'
import { COPY, LANGUAGES } from '../../src/app/copy.js'
import { getLanguagePreference } from '../../src/app/language.js'

let root
let host
const actEnvironment = globalThis.IS_REACT_ACT_ENVIRONMENT
globalThis.IS_REACT_ACT_ENVIRONMENT = true
afterAll(() => { globalThis.IS_REACT_ACT_ENVIRONMENT = actEnvironment })
const initialUrl = window.location.href
const initialLanguage = document.documentElement.lang
const initialTitle = document.title
const savedPreference = window.localStorage.getItem('vecsy:language')

async function mount(Component, props) {
  host = document.createElement('div')
  document.body.append(host)
  root = createRoot(host)
  await act(async () => root.render(createElement(Component, props)))
}

afterEach(async () => {
  if (root) await act(async () => root.unmount())
  root = null
  host?.remove()
  window.history.replaceState(null, '', initialUrl)
  document.documentElement.lang = initialLanguage
  document.title = initialTitle
  if (savedPreference === null) window.localStorage.removeItem('vecsy:language')
  else window.localStorage.setItem('vecsy:language', savedPreference)
  vi.restoreAllMocks()
})

describe('product introduction', () => {
  it('previews palettes and layers, supports keyboard tabs, and links to real export', async () => {
    const copy = COPY['zh-CN']
    await mount(ProductDemo, { copy, editorHref: '/editor/?lang=zh-CN' })
    const stage = host.querySelector('.lp-demo-stage')
    await act(async () => host.querySelector(`[aria-label="${copy.landingDemoPalettes[1]}"]`).click())
    expect(stage.style.getPropertyValue('--demo-accent')).toBe('#b5bc73')
    await act(async () => host.querySelectorAll('.lp-demo-layers button')[2].click())
    expect(host.querySelector('#lp-tab-1').getAttribute('aria-selected')).toBe('true')
    expect(host.querySelector('.lp-demo-selection rect').getAttribute('width')).toBe('60')
    await act(async () => host.querySelector('#lp-tab-1').dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true })))
    expect(host.querySelector('pre code').textContent).toContain('#b5bc73')
    expect(document.activeElement.id).toBe('lp-tab-2')
    expect(host.querySelector('[role="tabpanel"]').getAttribute('aria-labelledby')).toBe('lp-tab-2')
    await act(async () => host.querySelector('#lp-tab-3').click())
    expect(host.querySelectorAll('.lp-demo-export-format')).toHaveLength(3)
    expect(host.querySelector('.lp-demo-open').getAttribute('href')).toBe('/editor/?lang=zh-CN')
  })

  it('changes all four languages without opening or overwriting an editor document', async () => {
    const openDatabase = vi.spyOn(window.indexedDB, 'open')
    const previousDocument = window.localStorage.getItem('vecsy:document')
    await mount(LandingPage)
    for (const { code } of LANGUAGES) {
      await act(async () => host.querySelector('.lp-language-trigger').click())
      await act(async () => host.querySelector(`[data-language="${code}"]`).click())
      expect(host.querySelector('h1').textContent).toContain(COPY[code].landingHeroWord)
      expect(document.documentElement.lang).toBe(code)
      expect(getLanguagePreference()).toBe(code)
      expect(host.querySelector('.lp-hero-actions a').getAttribute('href')).toBe(`/editor/?lang=${code}`)
      expect(host.querySelector('.lp-faq summary h3').textContent).toBe(COPY[code].guideFaq[0][0])
    }
    expect(openDatabase).not.toHaveBeenCalled()
    expect(window.localStorage.getItem('vecsy:document')).toBe(previousDocument)
  })

  it('supports keyboard language selection, dismisses on Escape and outside clicks, and spaces options apart', async () => {
    await mount(LandingPage)
    expect(host.querySelector('select')).toBeNull()
    const trigger = host.querySelector('.lp-language-trigger')
    await act(async () => trigger.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true })))
    const options = [...host.querySelectorAll('[role="menuitemradio"]')]
    const menu = host.querySelector('.lp-language-menu')
    expect(trigger.getAttribute('aria-expanded')).toBe('true')
    expect(document.activeElement).toBe(options[0])
    expect(getComputedStyle(menu).rowGap).toBe('4px')
    await act(async () => options[0].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true })))
    expect(document.activeElement).toBe(options.at(-1))
    await act(async () => options.at(-1).dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })))
    expect(trigger.getAttribute('aria-expanded')).toBe('false')
    expect(document.activeElement).toBe(trigger)
    await act(async () => trigger.click())
    expect(host.querySelector('[aria-checked="true"][role="menuitemradio"]')).not.toBeNull()
    await act(async () => host.querySelector('h1').dispatchEvent(new PointerEvent('pointerdown', { bubbles: true })))
    expect(trigger.getAttribute('aria-expanded')).toBe('false')
    await act(async () => trigger.click())
    await act(async () => host.querySelector('.lp-hero-actions a').focus())
    expect(trigger.getAttribute('aria-expanded')).toBe('false')
  })

  it('closes mobile navigation with Escape and returns keyboard focus', async () => {
    await mount(LandingPage)
    const toggle = host.querySelector('#lp-menu-toggle')
    await act(async () => toggle.click())
    expect(toggle.getAttribute('aria-expanded')).toBe('true')
    await act(async () => document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })))
    expect(toggle.getAttribute('aria-expanded')).toBe('false')
    expect(document.activeElement).toBe(toggle)
  })
})
