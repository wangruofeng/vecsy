import { mkdir, writeFile } from 'node:fs/promises'
import { COPY, LANGUAGES } from '../src/app/copy.js'
import { PAGE_PATHS, SITE_ORIGIN, SOCIAL_LOCALES } from '../src/app/seo.js'

const escape = (value) => String(value).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c])
const url = (language) => `${SITE_ORIGIN}/guide/${language}/`
const alternates = LANGUAGES.map(({ code }) => ({ language: code, url: url(code) })).concat({ language: 'x-default', url: url('en') })
await mkdir('public/guide', { recursive: true })
for (const { code: language } of LANGUAGES) {
  const copy = COPY[language]
  const schema = {
    '@context': 'https://schema.org', '@type': 'WebPage', '@id': `${url(language)}#webpage`, url: url(language),
    name: copy.guideTitle, description: copy.guideSummary, inLanguage: language,
    about: { '@type': 'WebApplication', '@id': `${SITE_ORIGIN}/#app`, name: 'Vecsy', url: `${SITE_ORIGIN}/editor/` },
    isPartOf: { '@id': `${SITE_ORIGIN}/#website` },
    breadcrumb: { '@type': 'BreadcrumbList', itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Vecsy', item: `${SITE_ORIGIN}/` },
      { '@type': 'ListItem', position: 2, name: copy.guideTitle, item: url(language) },
    ] },
  }
  const alternateLinks = alternates.map((item) => `<link rel="alternate" hreflang="${item.language}" href="${item.url}">`).join('\n')
  const html = `<!doctype html><html lang="${language}"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${escape(copy.guideTitle)}</title><meta name="description" content="${escape(copy.guideSummary)}">
<meta name="robots" content="index, follow, max-image-preview:large"><link rel="canonical" href="${url(language)}">
${alternateLinks}
<meta property="og:type" content="website"><meta property="og:site_name" content="Vecsy">
<meta property="og:title" content="${escape(copy.guideTitle)}"><meta property="og:description" content="${escape(copy.guideSummary)}">
<meta property="og:url" content="${url(language)}"><meta property="og:locale" content="${SOCIAL_LOCALES[language]}">
<meta property="og:image" content="${SITE_ORIGIN}/og-image.png"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630"><meta property="og:image:alt" content="${escape(copy.socialImageAlt)}">
<meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${escape(copy.guideTitle)}"><meta name="twitter:description" content="${escape(copy.guideSummary)}"><meta name="twitter:image" content="${SITE_ORIGIN}/og-image.png"><meta name="twitter:image:alt" content="${escape(copy.socialImageAlt)}">
<link rel="icon" href="/favicon.svg"><script type="application/ld+json">${JSON.stringify(schema).replace(/</g, '\\u003c')}</script>
<style>*{box-sizing:border-box}body{margin:0;background:#faf9f5;color:#252525;font:17px/1.55 system-ui,sans-serif}main,nav{max-width:800px;margin:auto;padding:24px}nav{display:flex;gap:16px;flex-wrap:wrap;border-bottom:1px solid #ddd}a{color:#1b365d;overflow-wrap:anywhere}h1{font-size:clamp(28px,5vw,42px)}h2{margin-top:40px}h3{font-size:19px}li{margin:12px 0}section{scroll-margin-top:24px}footer{margin-top:40px;border-top:1px solid #ddd;padding-top:20px}</style>
</head><body><nav aria-label="${escape(copy.languageSwitch)}"><a href="/" aria-label="${escape(copy.landingHome)}">Vecsy</a>${LANGUAGES.map(({ code, label }) => `<a href="/guide/${code}/" lang="${code}"${code === language ? ' aria-current="page"' : ''}>${label}</a>`).join('')}</nav>
<main><h1>${escape(copy.guideTitle)}</h1><p>${escape(copy.guideSummary)}</p><p><a href="/editor/?lang=${language}">${escape(copy.guideStart)}</a></p>
<section id="steps"><h2>${escape(copy.guideStepsTitle)}</h2><ol>${copy.guideSteps.map((step) => `<li>${escape(step)}</li>`).join('')}</ol></section>
<section id="faq"><h2>${escape(copy.guideFaqTitle)}</h2>${copy.guideFaq.map(([question, answer]) => `<section><h3>${escape(question)}</h3><p>${escape(answer)}</p></section>`).join('')}</section>
<footer><a href="https://github.com/wangruofeng/vecsy">${escape(copy.guideSource)}</a></footer></main></body></html>`
  await mkdir(`public/guide/${language}`, { recursive: true })
  await writeFile(`public/guide/${language}/index.html`, html)
}
const pages = Object.values(PAGE_PATHS).map((path) => `  <url><loc>${SITE_ORIGIN}${path}</loc></url>`)
const guidePages = LANGUAGES.map(({ code }) => `  <url><loc>${url(code)}</loc>${alternates.map((item) => `<xhtml:link rel="alternate" hreflang="${item.language}" href="${item.url}"/>`).join('')}</url>`)
await writeFile('public/sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${[...pages, ...guidePages].join('\n')}\n</urlset>\n`)
