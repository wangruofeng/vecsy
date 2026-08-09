import { useState } from 'react'
import { SVG_COLLECTIONS } from '../app/svg-collections.js'
import { processSvgInput } from '../editor/process-svg-input.js'
import Icon from './Icon.jsx'

const CUSTOM_COLLECTION_ID = 'custom'
const CUSTOM_SVGS_STORAGE_KEY = 'vecsy:custom-svg-collection'

function loadCustomItems() {
  try {
    const stored = JSON.parse(window.localStorage.getItem(CUSTOM_SVGS_STORAGE_KEY) || '[]')
    return Array.isArray(stored) ? stored.map((item) => {
      if (!item?.id || !item?.name || !item?.svgMarkup) return null
      const result = processSvgInput(item.svgMarkup)
      return result.status === 'rejected' ? null : { ...item, svgMarkup: result.markup, source: 'untrusted' }
    }).filter(Boolean) : []
  } catch {
    return []
  }
}

export default function SvgCollectionModal({ copy, onClose, onSelect, processCustomSvg, showSecurityFeedback }) {
  const [activeCollectionId, setActiveCollectionId] = useState(SVG_COLLECTIONS[0].id)
  const [customItems, setCustomItems] = useState(loadCustomItems)
  const [isAddingCustomItem, setIsAddingCustomItem] = useState(false)
  const [customName, setCustomName] = useState('')
  const [customMarkup, setCustomMarkup] = useState('')
  const [customError, setCustomError] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const customCollection = { id: CUSTOM_COLLECTION_ID, label: copy.svgCollectionCustom, items: customItems }
  const activeCollection = [...SVG_COLLECTIONS, customCollection].find((collection) => collection.id === activeCollectionId) || SVG_COLLECTIONS[0]
  // 搜索：跨全部分组（含自定义）按图标名实时过滤，大小写不敏感；无搜索词时回到当前分组
  const trimmedQuery = searchQuery.trim().toLowerCase()
  const isSearching = trimmedQuery.length > 0
  const displayCollection = isSearching
    ? { id: 'search', label: copy.svgCollectionSearchResults, items: [...SVG_COLLECTIONS, customCollection].flatMap((collection) => collection.items).filter((item) => item.name.toLowerCase().includes(trimmedQuery)) }
    : activeCollection
  // 展示前按图标名字母 a→z 排序（大小写/重音不敏感），不改动各分组原始数据
  const displayItems = displayCollection.items.slice().sort((a, b) => (a.name || '').localeCompare(b.name || '', 'en', { sensitivity: 'base' }))

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
    const result = processCustomSvg(markup)
    if (result.status === 'rejected') {
      setCustomError(copy.svgCollectionInvalidCustom)
      return
    }
    if (!saveCustomItems([...customItems, { id: `custom-${Date.now()}`, name: customName.trim() || copy.svgCollectionCustomDefaultName, svgMarkup: result.markup, preserveAppearance: true, source: 'untrusted' }])) return
    showSecurityFeedback(result)
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
        <nav className="svg-collection-themes" aria-label={copy.svgCollectionThemes}>{[...SVG_COLLECTIONS, customCollection].map((collection) => <button key={collection.id} type="button" className={collection.id === activeCollection.id ? 'active' : ''} onClick={() => { setSearchQuery(''); setActiveCollectionId(collection.id) }}>{collection.label || copy[collection.labelKey]}</button>)}</nav>
        <div className="svg-collection-content">
          <div className="svg-collection-search"><Icon name="search" size={13} /><input type="text" value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder={copy.svgCollectionSearchPlaceholder} spellCheck="false" />{searchQuery && <button className="svg-collection-search-clear" type="button" title={copy.close} aria-label={copy.close} onClick={() => setSearchQuery('')}><Icon name="x" size={13} /></button>}</div>
          <div className="svg-collection-heading"><div><strong>{displayCollection.label || copy[displayCollection.labelKey]}</strong><span>{displayCollection.items.length} {copy.svgCollectionItems}</span></div>{displayCollection.sourceUrl && <a href={displayCollection.sourceUrl} target="_blank" rel="noreferrer">{copy.svgCollectionSource} ↗</a>}{displayCollection.id === CUSTOM_COLLECTION_ID && <button className="svg-collection-add-custom" type="button" onClick={() => setIsAddingCustomItem(true)}><Icon name="plus" size={13} />{copy.svgCollectionAddCustom}</button>}</div>
          {displayCollection.id === CUSTOM_COLLECTION_ID && isAddingCustomItem && <form className="svg-collection-custom-form" onSubmit={addCustomItem}><input value={customName} onChange={(event) => setCustomName(event.target.value)} placeholder={copy.svgCollectionCustomName} /><textarea value={customMarkup} onChange={(event) => { setCustomMarkup(event.target.value); setCustomError('') }} placeholder={copy.svgCollectionCustomMarkup} spellCheck="false" />{customError && <p>{customError}</p>}<div><button type="button" onClick={() => { setIsAddingCustomItem(false); setCustomError('') }}>{copy.cancel}</button><button type="submit">{copy.svgCollectionSaveCustom}</button></div></form>}
          {displayCollection.items.length > 0 ? <div className="svg-collection-grid">{displayItems.map((item) => <div key={item.id} className="svg-collection-item-wrap"><button className="svg-collection-item" type="button" title={`${copy.svgCollectionAdd} ${item.name}`} onClick={() => onSelect(item)}><span className={`svg-collection-preview${item.light ? ' is-light' : ''}`}><img src={item.svgMarkup ? `data:image/svg+xml,${encodeURIComponent(item.svgMarkup)}` : item.url} alt="" /></span><span>{item.name}</span></button>{displayCollection.id === CUSTOM_COLLECTION_ID && <button className="svg-collection-remove-custom" type="button" title={`${copy.svgCollectionRemoveCustom} ${item.name}`} aria-label={`${copy.svgCollectionRemoveCustom} ${item.name}`} onClick={() => removeCustomItem(item.id)}><Icon name="trash" size={12} /></button>}</div>)}</div> : (isSearching ? <div className="svg-collection-empty">{copy.svgCollectionNoResults}</div> : null)}
        </div>
      </div>
    </div>
  </div>
}
