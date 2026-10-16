import { LANGUAGES } from './copy.js'

const supported = (language) => LANGUAGES.some(({ code }) => code === language)

export function getLanguagePreference() {
  const requested = new URLSearchParams(window.location.search).get('lang')
  if (supported(requested)) return requested
  try {
    const saved = window.localStorage.getItem('vecsy:language')
    return supported(saved) ? saved : null
  } catch {
    return null
  }
}

export function getLandingLanguage() {
  const preference = getLanguagePreference()
  if (preference) return preference
  const browser = navigator.language || 'en'
  if (/^zh/i.test(browser)) return /TW|HK|Hant/i.test(browser) ? 'zh-TW' : 'zh-CN'
  return /^ja/i.test(browser) ? 'ja' : 'en'
}

export function rememberLanguage(language) {
  try { window.localStorage.setItem('vecsy:language', language) } catch { /* 浏览器禁用存储时仍可切换语言。 */ }
}
