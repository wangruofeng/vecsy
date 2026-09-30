const SOCIAL_LOCALES = { en: 'en_US', 'zh-CN': 'zh_CN', 'zh-TW': 'zh_TW', ja: 'ja_JP' }

// 同一 URL 的语言切换同步元信息；没有独立语言页面时不生成 hreflang。
export function updatePageMetadata(document, language, copy) {
  document.documentElement.lang = language
  document.title = copy.documentTitle
  const values = {
    'meta[name="description"]': copy.metaDescription,
    'meta[property="og:title"]': copy.documentTitle,
    'meta[property="og:description"]': copy.metaDescription,
    'meta[property="og:locale"]': SOCIAL_LOCALES[language],
    'meta[property="og:image:alt"]': copy.socialImageAlt,
    'meta[name="twitter:title"]': copy.documentTitle,
    'meta[name="twitter:description"]': copy.metaDescription,
    'meta[name="twitter:image:alt"]': copy.socialImageAlt,
  }
  for (const [selector, value] of Object.entries(values)) {
    document.querySelector(selector)?.setAttribute('content', value)
  }
  document.querySelectorAll('meta[property="og:locale:alternate"]').forEach((node) => node.remove())
  for (const locale of Object.values(SOCIAL_LOCALES)) {
    if (locale === SOCIAL_LOCALES[language]) continue
    const meta = document.createElement('meta')
    meta.setAttribute('property', 'og:locale:alternate')
    meta.setAttribute('content', locale)
    document.head.append(meta)
  }
}
