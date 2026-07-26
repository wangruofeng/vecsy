import { useState } from 'react'
import { SVG_COLLECTIONS } from '../app/svg-collections.js'
import Icon from './Icon.jsx'

export default function SvgCollectionModal({ copy, onClose, onSelect }) {
  const [activeCollectionId, setActiveCollectionId] = useState(SVG_COLLECTIONS[0].id)
  const activeCollection = SVG_COLLECTIONS.find((collection) => collection.id === activeCollectionId) || SVG_COLLECTIONS[0]
  return <div className="shortcuts-overlay svg-collection-overlay" onClick={onClose}>
    <div className="shortcuts-modal svg-collection-modal" role="dialog" aria-modal="true" aria-label={copy.svgCollectionTitle} onClick={(event) => event.stopPropagation()}>
      <div className="shortcuts-header"><span>{copy.svgCollectionTitle}</span><button className="mini-button" type="button" title={copy.close} aria-label={copy.close} onClick={onClose}><Icon name="x" size={14} /></button></div>
      <div className="svg-collection-body">
        <nav className="svg-collection-themes" aria-label={copy.svgCollectionThemes}>{SVG_COLLECTIONS.map((collection) => <button key={collection.id} type="button" className={collection.id === activeCollection.id ? 'active' : ''} onClick={() => setActiveCollectionId(collection.id)}>{copy[collection.labelKey]}</button>)}</nav>
        <div className="svg-collection-content"><div className="svg-collection-heading"><div><strong>{copy[activeCollection.labelKey]}</strong><span>{activeCollection.items.length} {copy.svgCollectionItems}</span></div>{activeCollection.sourceUrl && <a href={activeCollection.sourceUrl} target="_blank" rel="noreferrer">{copy.svgCollectionSource} ↗</a>}</div><div className="svg-collection-grid">{activeCollection.items.map((item) => <button key={item.id} className="svg-collection-item" type="button" title={`${copy.svgCollectionAdd} ${item.name}`} onClick={() => onSelect(item)}><span className="svg-collection-preview"><img src={item.url} alt="" /></span><span>{item.name}</span></button>)}</div></div>
      </div>
    </div>
  </div>
}
