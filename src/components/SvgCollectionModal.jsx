import { useState } from 'react'
import { SVG_COLLECTIONS } from '../app/svg-collections.js'
import Icon from './Icon.jsx'

const CUSTOM_COLLECTION_ID = 'custom'
const CUSTOM_SVGS_STORAGE_KEY = 'vecsy:custom-svg-collection'

function loadCustomItems() {
  try {
    const stored = JSON.parse(window.localStorage.getItem(CUSTOM_SVGS_STORAGE_KEY) || '[]')
    return Array.isArray(stored) ? stored.filter((item) => item?.id && item?.name && item?.svgMarkup) : []
  } catch {
    return []
  }
}

export default function SvgCollectionModal({ copy, onClose, onSelect }) {
  const [activeCollectionId, setActiveCollectionId] = useState(SVG_COLLECTIONS[0].id)
  const [customItems, setCustomItems] = useState(loadCustomItems)
  const [isAddingCustomItem, setIsAddingCustomItem] = useState(false)
  const [customName, setCustomName] = useState('')
  const [customMarkup, setCustomMarkup] = useState('')
  const [customError, setCustomError] = useState('')
  const customCollection = { id: CUSTOM_COLLECTION_ID, label: copy.svgCollectionCustom, items: customItems }
  const activeCollection = [...SVG_COLLECTIONS, customCollection].find((collection) => collection.id === activeCollectionId) || SVG_COLLECTIONS[0]

  const saveCustomItems = (nextItems) => {
    try {
      window.localStorage.setItem(CUSTOM_SVGS_STORAGE_KEY, JSON.stringify(nextItems))
      setCustomItems(nextItems)
      return true
    } catch {
      setCustomError(copy.storageFull)
      return false
    }
  }

  const addCustomItem = (event) => {
    event.preventDefault()
    const markup = customMarkup.trim()
    const root = new DOMParser().parseFromString(markup, 'image/svg+xml').documentElement
    if (!markup || root?.tagName !== 'svg') {
      setCustomError(copy.svgCollectionInvalidCustom)
      return
    }
    if (!saveCustomItems([...customItems, { id: `custom-${Date.now()}`, name: customName.trim() || copy.svgCollectionCustomDefaultName, svgMarkup: markup, preserveAppearance: true }])) return
    setCustomName('')
    setCustomMarkup('')
    setCustomError('')
    setIsAddingCustomItem(false)
  }

  const removeCustomItem = (id) => saveCustomItems(customItems.filter((item) => item.id !== id))

  return <div className="shortcuts-overlay svg-collection-overlay" onClick={onClose}>
    <div className="shortcuts-modal svg-collection-modal" role="dialog" aria-modal="true" aria-label={copy.svgCollectionTitle} onClick={(event) => event.stopPropagation()}>
      <div className="shortcuts-header"><span>{copy.svgCollectionTitle}</span><button className="mini-button" type="button" title={copy.close} aria-label={copy.close} onClick={onClose}><Icon name="x" size={14} /></button></div>
      <div className="svg-collection-body">
        <nav className="svg-collection-themes" aria-label={copy.svgCollectionThemes}>{[...SVG_COLLECTIONS, customCollection].map((collection) => <button key={collection.id} type="button" className={collection.id === activeCollection.id ? 'active' : ''} onClick={() => setActiveCollectionId(collection.id)}>{collection.label || copy[collection.labelKey]}</button>)}</nav>
        <div className="svg-collection-content"><div className="svg-collection-heading"><div><strong>{activeCollection.label || copy[activeCollection.labelKey]}</strong><span>{activeCollection.items.length} {copy.svgCollectionItems}</span></div>{activeCollection.sourceUrl && <a href={activeCollection.sourceUrl} target="_blank" rel="noreferrer">{copy.svgCollectionSource} ↗</a>}{activeCollection.id === CUSTOM_COLLECTION_ID && <button className="svg-collection-add-custom" type="button" onClick={() => setIsAddingCustomItem(true)}><Icon name="plus" size={13} />{copy.svgCollectionAddCustom}</button>}</div>{activeCollection.id === CUSTOM_COLLECTION_ID && isAddingCustomItem && <form className="svg-collection-custom-form" onSubmit={addCustomItem}><input value={customName} onChange={(event) => setCustomName(event.target.value)} placeholder={copy.svgCollectionCustomName} /><textarea value={customMarkup} onChange={(event) => { setCustomMarkup(event.target.value); setCustomError('') }} placeholder={copy.svgCollectionCustomMarkup} spellCheck="false" />{customError && <p>{customError}</p>}<div><button type="button" onClick={() => { setIsAddingCustomItem(false); setCustomError('') }}>{copy.cancel}</button><button type="submit">{copy.svgCollectionSaveCustom}</button></div></form>}<div className="svg-collection-grid">{activeCollection.items.map((item) => <div key={item.id} className="svg-collection-item-wrap"><button className="svg-collection-item" type="button" title={`${copy.svgCollectionAdd} ${item.name}`} onClick={() => onSelect(item)}><span className="svg-collection-preview"><img src={item.svgMarkup ? `data:image/svg+xml,${encodeURIComponent(item.svgMarkup)}` : item.url} alt="" /></span><span>{item.name}</span></button>{activeCollection.id === CUSTOM_COLLECTION_ID && <button className="svg-collection-remove-custom" type="button" title={`${copy.svgCollectionRemoveCustom} ${item.name}`} aria-label={`${copy.svgCollectionRemoveCustom} ${item.name}`} onClick={() => removeCustomItem(item.id)}><Icon name="trash" size={12} /></button>}</div>)}</div></div>
      </div>
    </div>
  </div>
}
