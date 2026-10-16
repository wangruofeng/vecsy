export const SITE_ORIGIN = 'https://vecsy.top'
export const PAGE_PATHS = { landing: '/', editor: '/editor/' }
export const SOCIAL_LOCALES = { en: 'en_US', 'zh-CN': 'zh_CN', 'zh-TW': 'zh_TW', ja: 'ja_JP' }

// 静态 HTML 与浏览器切换语言共用同一份页面定义；语言参数不产生新的规范 URL。
export function getPageMetadata(language, copy, page = 'landing') {
  return {
    url: `${SITE_ORIGIN}${PAGE_PATHS[page]}`,
    title: page === 'landing' ? copy.landingDocumentTitle : copy.documentTitle,
    description: page === 'landing' ? copy.landingMetaDescription : copy.metaDescription,
    locale: SOCIAL_LOCALES[language],
    image: `${SITE_ORIGIN}/og-image.png`,
    imageAlt: copy.socialImageAlt,
    themeColor: page === 'landing' ? '#f7f6f2' : '#0a0a0c',
  }
}

export function createStructuredData(language, copy, page = 'landing') {
  const metadata = getPageMetadata(language, copy, page)
  const reference = (name) => ({ '@id': `${SITE_ORIGIN}/#${name}` })
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage', '@id': `${metadata.url}#webpage`, url: metadata.url,
        name: metadata.title, description: metadata.description, inLanguage: language,
        isPartOf: reference('website'), about: reference('app'), mainEntity: reference('app'),
        primaryImageOfPage: { '@type': 'ImageObject', url: metadata.image, width: 1200, height: 630 },
      },
      {
        '@type': 'WebApplication', ...reference('app'), name: 'Vecsy', url: `${SITE_ORIGIN}/editor/`,
        description: copy.metaDescription, applicationCategory: 'DesignApplication', operatingSystem: 'Web',
        inLanguage: ['en', 'zh-Hans', 'zh-Hant', 'ja'], isAccessibleForFree: true,
        featureList: copy.landingFeatureBodies,
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
        publisher: reference('org'), isPartOf: reference('website'),
      },
      {
        '@type': 'WebSite', ...reference('website'), url: `${SITE_ORIGIN}/`, name: 'Vecsy',
        inLanguage: ['en', 'zh-Hans', 'zh-Hant', 'ja'], publisher: reference('org'),
      },
      { '@type': 'Organization', ...reference('org'), name: 'Vecsy', url: `${SITE_ORIGIN}/`, logo: `${SITE_ORIGIN}/icon-512.png` },
    ],
  }
}

export function updatePageMetadata(document, language, copy, page = 'landing') {
  const metadata = getPageMetadata(language, copy, page)
  document.documentElement.lang = language
  document.title = metadata.title
  const values = {
    'meta[name="description"]': metadata.description,
    'meta[name="theme-color"]': metadata.themeColor,
    'meta[property="og:url"]': metadata.url,
    'meta[property="og:title"]': metadata.title,
    'meta[property="og:description"]': metadata.description,
    'meta[property="og:locale"]': metadata.locale,
    'meta[property="og:image:alt"]': metadata.imageAlt,
    'meta[name="twitter:title"]': metadata.title,
    'meta[name="twitter:description"]': metadata.description,
    'meta[name="twitter:image:alt"]': metadata.imageAlt,
  }
  for (const [selector, value] of Object.entries(values)) document.querySelector(selector)?.setAttribute('content', value)
  document.querySelector('link[rel="canonical"]')?.setAttribute('href', metadata.url)
  const structuredData = document.getElementById('vecsy-structured-data')
  if (structuredData) structuredData.textContent = JSON.stringify(createStructuredData(language, copy, page)).replace(/</g, '\\u003c')
  document.querySelectorAll('meta[property="og:locale:alternate"]').forEach((node) => node.remove())
  for (const locale of Object.values(SOCIAL_LOCALES)) {
    if (locale === metadata.locale) continue
    const meta = document.createElement('meta')
    meta.setAttribute('property', 'og:locale:alternate')
    meta.setAttribute('content', locale)
    document.head.append(meta)
  }
}
