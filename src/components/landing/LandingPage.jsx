import { useEffect, useRef, useState } from 'react'
import { COPY } from '../../app/copy.js'
import { getLandingLanguage, rememberLanguage } from '../../app/language.js'
import { updatePageMetadata } from '../../app/seo.js'
import Icon from '../Icon.jsx'
import ProductDemo from './ProductDemo.jsx'
import LanguageSwitcher from './LanguageSwitcher.jsx'
import './landing.css'

const FEATURE_ICONS = ['layers', 'grid', 'code', 'upload']

function SectionHeading({ number, label, title, description }) {
  return <div className="lp-section-heading lp-reveal">
    <p className="lp-eyebrow"><span>{number}</span><span aria-hidden="true">·</span>{label}</p>
    <h2>{title}</h2>
    {description && <p className="lp-section-description">{description}</p>}
  </div>
}

function FeatureArt({ index }) {
  return <div className={`lp-feature-art lp-feature-art-${index}`} aria-hidden="true">
    {index === 0 && <div className="lp-stacked-layers"><i /><i /><i /></div>}
    {index === 1 && <div className="lp-color-circles"><i /><i /><i /></div>}
    {index === 2 && <span className="lp-code-art"><i>&lt;</i><span>svg</span><i>/&gt;</i></span>}
    {index === 3 && <div className="lp-file-art"><span>SVG</span><span>PNG</span><span>WebP</span></div>}
  </div>
}

export default function LandingPage() {
  const [language, setLanguage] = useState(getLandingLanguage)
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const heroRef = useRef(null)
  const pageRef = useRef(null)
  const copy = COPY[language]
  const editorHref = `/editor/?lang=${language}`
  const links = [['#overview', copy.landingDemoNav], ['#features', copy.landingFeaturesNav], ['#how-it-works', copy.landingStepsNav], ['#faq', copy.landingFaqNav]]

  useEffect(() => {
    updatePageMetadata(document, language, copy, 'landing')
    rememberLanguage(language)
  }, [language])

  useEffect(() => {
    const heroObserver = new IntersectionObserver(([entry]) => setScrolled(!entry.isIntersecting), { rootMargin: '-90px 0px 0px 0px' })
    heroObserver.observe(heroRef.current)
    const revealObserver = new IntersectionObserver((entries) => entries.forEach((entry) => {
      if (entry.isIntersecting) { entry.target.classList.add('is-visible'); revealObserver.unobserve(entry.target) }
    }), { threshold: 0.12 })
    pageRef.current.querySelectorAll('.lp-reveal').forEach((node) => revealObserver.observe(node))
    return () => { heroObserver.disconnect(); revealObserver.disconnect() }
  }, [])

  useEffect(() => {
    if (!menuOpen) return
    const close = (event) => {
      if (event.key === 'Escape') { setMenuOpen(false); document.getElementById('lp-menu-toggle')?.focus() }
      if (event.type === 'pointerdown' && !event.target.closest('.lp-header')) setMenuOpen(false)
    }
    document.addEventListener('keydown', close)
    document.addEventListener('pointerdown', close)
    return () => { document.removeEventListener('keydown', close); document.removeEventListener('pointerdown', close) }
  }, [menuOpen])

  return <div className="landing-page" ref={pageRef} id="top">
    <a className="lp-skip-link" href="#lp-main">{copy.landingSkip}</a>
    <header className={`lp-header ${scrolled ? 'is-scrolled' : ''}`}>
      <nav className="lp-nav" aria-label={copy.landingNav}>
        <a className="lp-brand" href="/" aria-label={copy.landingHome}><img src="/favicon.svg" width="26" height="26" alt="" /><span>Vecsy</span></a>
        <span className="lp-platform">SVG<span className="lp-platform-dot" /></span>
        <div className={`lp-nav-links ${menuOpen ? 'is-open' : ''}`} id="lp-nav-links">
          {links.map(([href, label]) => <a href={href} key={href} onClick={() => setMenuOpen(false)}>{label}</a>)}
          <a href={`/guide/${language}/`}>{copy.landingGuideNav}</a>
        </div>
        <div className="lp-nav-actions">
          <LanguageSwitcher language={language} label={copy.languageSwitch} onOpen={() => setMenuOpen(false)} onChange={(next) => {
            setLanguage(next)
            const url = new URL(window.location.href)
            url.searchParams.set('lang', next)
            window.history.replaceState(null, '', url)
          }} />
          <a className="lp-nav-cta" href={editorHref}>{copy.landingStart}</a>
          <button className="lp-menu-toggle" id="lp-menu-toggle" type="button" aria-label={copy.landingMenu} aria-controls="lp-nav-links" aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)}><span /><span /></button>
        </div>
      </nav>
    </header>

    <main className="lp-main" id="lp-main" tabIndex={-1}>
      <section className="lp-hero" ref={heroRef} aria-labelledby="lp-title">
        <h1 id="lp-title"><span className="lp-hero-brand">Vecsy<span className="lp-title-period">.</span></span><span className="lp-hero-word">{copy.landingHeroWord}</span></h1>
        <p className="lp-hero-description">{copy.landingHeroDescription}</p>
        <ul className="lp-promises">{copy.landingPromises.map((text) => <li key={text}>{text}</li>)}</ul>
        <div className="lp-hero-actions"><a className="lp-button lp-button-primary" href={editorHref}>{copy.landingStart}</a><a className="lp-button lp-button-outline" href="#overview">{copy.landingExplore}</a></div>
        <p className="lp-hero-note"><span aria-hidden="true">✳</span>{copy.landingHeroNote}</p>
        <svg className="lp-hero-orbit" viewBox="0 0 180 180" fill="none" aria-hidden="true"><circle cx="90" cy="90" r="48" stroke="currentColor" strokeWidth=".7" /><ellipse cx="90" cy="90" rx="78" ry="24" transform="rotate(-38 90 90)" stroke="currentColor" strokeWidth=".7" /><path d="M90 42a48 48 0 0 1 0 96Z" fill="currentColor" opacity=".055" /><circle cx="150" cy="41" r="5" fill="#d48357" /><path d="M85 90h10m-5-5v10" stroke="currentColor" strokeWidth=".7" /></svg>
      </section>

      <section className="lp-section lp-overview" id="overview">
        <SectionHeading number="00" label={copy.landingDemoNav} title={copy.landingDemoTitle} description={copy.landingDemoDescription} />
        <ProductDemo copy={copy} editorHref={editorHref} />
      </section>

      <section className="lp-section" id="features">
        <SectionHeading number="01" label={copy.landingFeaturesNav} title={copy.landingFeaturesTitle} description={copy.landingFeaturesDescription} />
        <div className="lp-feature-grid">{copy.landingFeatureTitles.map((title, index) => <article className="lp-feature lp-reveal" key={index}>
          <FeatureArt index={index} /><div className="lp-feature-text"><h3><Icon name={FEATURE_ICONS[index]} size={17} />{title}</h3><p>{copy.landingFeatureBodies[index]}</p></div>
        </article>)}</div>
        <aside className="lp-local lp-reveal"><div className="lp-local-mark" aria-hidden="true"><svg viewBox="0 0 48 48" fill="none"><rect x="8" y="10" width="32" height="24" rx="3" stroke="currentColor" strokeWidth="1.3" /><path d="M4 39h40M18 22l4 4 9-9" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" /></svg></div><div><h3>{copy.landingLocalTitle}</h3><p>{copy.landingLocalBody}</p><a href="#faq">{copy.landingLocalLink}</a></div></aside>
      </section>

      <section className="lp-section" id="how-it-works">
        <SectionHeading number="02" label={copy.landingStepsNav} title={copy.landingStepsTitle} />
        <ol className="lp-steps">{copy.landingStepTitles.map((title, index) => <li className="lp-reveal" key={index}><span className="lp-step-number">0{index + 1}</span><h3>{title}</h3><p>{copy.landingStepBodies[index]}</p></li>)}</ol>
        <a className="lp-text-link" href={`/guide/${language}/`}>{copy.landingGuideNav}</a>
      </section>

      <section className="lp-section lp-faq" id="faq">
        <SectionHeading number="03" label={copy.landingFaqNav} title={copy.landingFaqTitle} />
        <div className="lp-faq-list">{copy.guideFaq.map(([question, answer], index) => <details key={index}><summary><h3>{question}</h3><span aria-hidden="true">+</span></summary><div className="lp-faq-answer"><p>{answer}</p></div></details>)}</div>
      </section>

      <section className="lp-closing lp-reveal"><span className="lp-closing-star" aria-hidden="true">✳</span><h2>{copy.landingClosing}</h2><p>{copy.landingClosingNote}</p><a className="lp-button lp-button-primary" href={editorHref}>{copy.landingStart}</a></section>
    </main>

    <footer className="lp-footer"><div className="lp-footer-top"><div><a className="lp-brand" href="#top"><img src="/favicon.svg" width="26" height="26" alt="" /><span>Vecsy</span></a><p>{copy.landingFooter}</p></div><div className="lp-footer-links"><a href={`/guide/${language}/`}>{copy.landingGuideNav}</a><a href="https://github.com/wangruofeng/vecsy" target="_blank" rel="noreferrer"><Icon name="github" size={15} />{copy.landingOpenSource}</a><a href="#top">{copy.landingTop}</a></div></div><div className="lp-footer-bottom"><span>© {new Date().getFullYear()} Vecsy</span><span>{copy.landingPromises[0]}<span aria-hidden="true"> · </span>{copy.landingPromises[3]}</span></div></footer>
  </div>
}
