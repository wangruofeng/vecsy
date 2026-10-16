import { useState } from 'react'
import Icon from '../Icon.jsx'

const PALETTES = [
  { accent: '#db784e', ink: '#294365', paper: '#f2eddf' },
  { accent: '#b5bc73', ink: '#38554c', paper: '#f1efdf' },
  { accent: '#718caf', ink: '#303e64', paper: '#ececf0' },
]
const TAB_ICONS = ['cursor', 'layers', 'code', 'upload']

function Artwork({ copy, selected, highlight }) {
  return <svg className="lp-artwork" viewBox="0 0 660 480" role="img" aria-label={copy.landingDemoArtTitle}>
    <rect width="660" height="480" fill="var(--demo-paper)" />
    <text x="36" y="34" fill="var(--demo-ink)" fontSize="9" letterSpacing="2">{copy.landingDemoArtSubtitle}</text>
    <text x="624" y="34" textAnchor="end" fill="var(--demo-ink)" fontSize="9">{copy.landingDemoArtTitle}</text>
    <line x1="36" y1="52" x2="624" y2="52" stroke="var(--demo-ink)" opacity=".25" />
    <circle cx="328" cy="227" r="124" fill="var(--demo-accent)" />
    <path d="M328 103a124 124 0 0 1 0 248Z" fill="var(--demo-ink)" />
    <circle cx="328" cy="227" r="51" fill="var(--demo-paper)" />
    <ellipse cx="328" cy="227" rx="215" ry="66" transform="rotate(-28 328 227)" fill="none" stroke="var(--demo-ink)" strokeWidth="2" />
    <ellipse cx="328" cy="227" rx="202" ry="64" transform="rotate(28 328 227)" fill="none" stroke="var(--demo-accent)" strokeWidth="5" />
    <circle cx="496" cy="319" r="12" fill="var(--demo-paper)" stroke="var(--demo-ink)" strokeWidth="2" />
    <path d="m520 96 6 21 22 4-20 9-1 23-12-19-22 6 14-18-12-19 21 7Z" fill="var(--demo-accent)" />
    <line x1="36" y1="389" x2="624" y2="389" stroke="var(--demo-ink)" opacity=".25" />
    <text x="36" y="434" fill="var(--demo-ink)" fontSize="27" fontFamily="Georgia, 'Songti SC', serif">{copy.landingDemoArtFooter}</text>
    <circle cx="570" cy="427" r="7" fill="var(--demo-accent)" />
    <circle cx="593" cy="427" r="7" fill="var(--demo-ink)" />
    <circle cx="616" cy="427" r="7" fill="none" stroke="var(--demo-ink)" />
    {highlight && <g className="lp-demo-selection" fill="var(--demo-paper)" stroke="#d2914f" strokeWidth="1.5">
      <rect {...[{ x: 112, y: 103, width: 432, height: 248 }, { x: 204, y: 103, width: 248, height: 248 }, { x: 491, y: 93, width: 60, height: 63 }, { x: 32, y: 405, width: 430, height: 37 }][selected]} fill="none" strokeDasharray="4 3" />
    </g>}
  </svg>
}

export default function ProductDemo({ copy, editorHref }) {
  const [tab, setTab] = useState(0)
  const [palette, setPalette] = useState(0)
  const [selected, setSelected] = useState(1)
  const colors = PALETTES[palette]
  const source = `<svg viewBox="0 0 660 480"\n     xmlns="http://www.w3.org/2000/svg">\n  <rect width="660" height="480"\n        fill="${colors.paper}" />\n  <circle cx="328" cy="227" r="124"\n          fill="${colors.accent}" />\n  <path d="M328 103a124 124 0 0 1 0 248Z"\n        fill="${colors.ink}" />\n  <circle cx="328" cy="227" r="51"\n          fill="${colors.paper}" />\n  <ellipse cx="328" cy="227"\n           rx="215" ry="66"\n           transform="rotate(-28 328 227)"\n           fill="none"\n           stroke="${colors.ink}" />\n</svg>`

  const selectTab = (index, focus = false) => {
    setTab(index)
    if (focus) document.getElementById(`lp-tab-${index}`)?.focus()
  }

  return <div className="lp-product-demo">
    <div className="lp-demo-stage" style={{ '--demo-accent': colors.accent, '--demo-ink': colors.ink, '--demo-paper': colors.paper }}>
      <div className="lp-demo-window" role="region" aria-label={copy.landingDemoLabel}>
        <div className="lp-demo-topbar">
          <div className="lp-window-dots" aria-hidden="true"><i /><i /><i /></div>
          <span>{copy.landingDemoFile}</span>
          <span className="lp-demo-wordmark">Vecsy</span>
        </div>
        <div className={`lp-demo-workspace lp-demo-view-${tab}`} id="lp-demo-panel" role="tabpanel" aria-labelledby={`lp-tab-${tab}`} tabIndex={0}>
          <aside className="lp-demo-layers">
            <div className="lp-demo-panel-heading"><Icon name="layers" size={13} />{copy.landingDemoTabs[1]}</div>
            {copy.landingDemoLayers.map((name, index) => <button key={index} type="button" className={selected === index ? 'is-selected' : ''} aria-pressed={selected === index} onClick={() => { setSelected(index); setTab(1) }}>
              <span className={`lp-layer-glyph lp-layer-glyph-${index}`} aria-hidden="true" /><span>{name}</span><Icon name="eye" size={12} />
            </button>)}
            <span className="lp-demo-layer-footer">{copy.landingDemoLabel}</span>
          </aside>
          <div className="lp-demo-canvas">
            <div className="lp-demo-toolbar"><span><Icon name={TAB_ICONS[tab]} size={13} />{copy.landingDemoTabs[tab]}</span><span>100%</span></div>
            {tab === 2 ? <pre className="lp-demo-source"><code>{source}</code></pre> : <div className="lp-demo-artboard"><Artwork copy={copy} selected={selected} highlight={tab === 1} /></div>}
          </div>
          <aside className="lp-demo-inspector">
            {tab === 3 ? <>
              <div className="lp-demo-panel-heading">{copy.landingDemoTabs[3]}</div>
              {['SVG', 'PNG', 'WebP'].map((format, index) => <div className="lp-demo-export-format" key={format}><strong>{format}</strong><span>{copy.landingDemoFormats[index]}</span></div>)}
              <p>{copy.landingDemoExportNote}</p>
              <a className="lp-demo-open" href={editorHref}>{copy.landingStart}</a>
            </> : <>
              <div className="lp-demo-panel-heading">{copy.landingDemoProperty}</div>
              <div className="lp-demo-property"><span>{copy.landingDemoFill}</span><div><i style={{ background: colors.accent }} />{colors.accent.toUpperCase()}</div></div>
              <div className="lp-demo-property"><span>{copy.landingDemoOpacity}</span><div>100%</div></div>
              <div className="lp-demo-property"><span>{copy.landingDemoSize}</span><div>248 × 248</div></div>
              <div className="lp-demo-palette-label">{copy.landingDemoPalette}</div>
              <div className="lp-demo-swatches">
                {PALETTES.map((item, index) => <button key={index} type="button" aria-label={copy.landingDemoPalettes[index]} aria-pressed={palette === index} title={copy.landingDemoPalettes[index]} style={{ background: item.accent }} onClick={() => setPalette(index)}>{palette === index && <Icon name="check" size={14} />}</button>)}
              </div>
            </>}
          </aside>
        </div>
        <div className="lp-demo-statusbar"><span><i />{copy.landingPromises[3]}</span><span>SVG · 660 × 480</span></div>
      </div>
    </div>
    <div className="lp-demo-caption-row">
      <p aria-live="polite">{copy.landingDemoCaptions[tab]}</p>
      <div className="lp-demo-tabs" role="tablist" aria-label={copy.landingDemoLabel} onKeyDown={(event) => {
        const direction = event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0
        if (!direction && !['Home', 'End'].includes(event.key)) return
        event.preventDefault()
        selectTab(event.key === 'Home' ? 0 : event.key === 'End' ? 3 : (tab + direction + 4) % 4, true)
      }}>
        {copy.landingDemoTabs.map((label, index) => <button type="button" role="tab" key={index} id={`lp-tab-${index}`} aria-selected={tab === index} aria-controls="lp-demo-panel" tabIndex={tab === index ? 0 : -1} onClick={() => selectTab(index)}><Icon name={TAB_ICONS[index]} size={13} />{label}</button>)}
      </div>
    </div>
  </div>
}
