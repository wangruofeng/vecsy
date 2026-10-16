import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { COPY, LANGUAGES } from '../src/app/copy.js'
import { createStructuredData, getPageMetadata, PAGE_PATHS, SOCIAL_LOCALES } from '../src/app/seo.js'
import './generate-guides.mjs'

const escape = (value) => String(value).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c])
const template = await readFile(new URL('./templates/app.html', import.meta.url), 'utf8')
const copy = COPY.en
const guides = `<nav aria-label="${escape(copy.landingGuideNav)}">${LANGUAGES.map(({ code }) => `<a href="/guide/${code}/" lang="${code}">${escape(COPY[code].guideTitle)}</a>`).join('')}</nav>`
const steps = `<section id="how-it-works"><h2>${escape(copy.landingStepsTitle)}</h2><ol>${copy.landingStepTitles.map((title, index) => `<li><h3>${escape(title)}</h3><p>${escape(copy.landingStepBodies[index])}</p></li>`).join('')}</ol></section>`
const features = `<section id="features"><h2>${escape(copy.landingFeaturesTitle)}</h2>${copy.landingFeatureTitles.map((title, index) => `<section><h3>${escape(title)}</h3><p>${escape(copy.landingFeatureBodies[index])}</p></section>`).join('')}</section>`
const faq = `<section id="faq"><h2>${escape(copy.landingFaqTitle)}</h2>${copy.guideFaq.map(([question, answer]) => `<section><h3>${escape(question)}</h3><p>${escape(answer)}</p></section>`).join('')}</section>`

for (const page of Object.keys(PAGE_PATHS)) {
  const metadata = getPageMetadata('en', copy, page)
  const body = page === 'landing'
    ? `<p><a href="/editor/">${escape(copy.guideStart)}</a></p>${features}${steps}<section><h2>${escape(copy.landingLocalTitle)}</h2><p>${escape(copy.landingLocalBody)}</p></section>${faq}`
    : `<p>${escape(copy.editorJavascriptRequired)}</p><p><a href="/">${escape(copy.landingHome)}</a></p>${features}${steps}`
  const values = {
    ...Object.fromEntries(Object.entries(metadata).map(([key, value]) => [key, escape(value)])),
    page,
    alternateLocales: Object.values(SOCIAL_LOCALES).filter((locale) => locale !== metadata.locale).map((locale) => `<meta property="og:locale:alternate" content="${locale}" />`).join('\n    '),
    schema: JSON.stringify(createStructuredData('en', copy, page)).replace(/</g, '\\u003c'),
    content: `<main class="seo-fallback"><h1>${escape(metadata.title)}</h1><p>${escape(metadata.description)}</p>${body}${guides}</main>`,
  }
  const html = template.replace(/\{\{(\w+)\}\}/g, (_, key) => values[key])
  const output = page === 'landing' ? 'index.html' : 'editor/index.html'
  if (page === 'editor') await mkdir('editor', { recursive: true })
  await writeFile(output, html)
}
