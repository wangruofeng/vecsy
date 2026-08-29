import { useState } from 'react'
import Icon from './Icon.jsx'
import { API_FORMATS, newModelEntry, newProviderEntry, validateProviderEntry } from '../ai/ai-settings.js'

const FORMAT_LABEL_KEYS = {
  'chat-completions': 'aiApiFormatChat',
  'anthropic-messages': 'aiApiFormatAnthropic',
  'responses': 'aiApiFormatResponses',
}

const FORMAT_TAG_KEYS = {
  'chat-completions': 'aiFormatTagChat',
  'anthropic-messages': 'aiFormatTagAnthropic',
  'responses': 'aiFormatTagResponses',
}

function ModelCard({ copy, provider, model, isDefault, onSelect, onEdit, onDelete }) {
  const formatTagKey = FORMAT_TAG_KEYS[provider.apiFormat]
  // 卡片整体可点击切换为当前模型；内部操作按钮阻止冒泡。
  const handleKeyDown = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      onSelect()
    }
  }
  return (
    <div
      className={`ai-model-card ${isDefault ? 'is-default' : ''}`}
      role="button"
      tabIndex={0}
      aria-pressed={isDefault}
      aria-label={`${provider.name} ${model.name}`}
      title={isDefault ? copy.aiModelDefault : copy.aiSetDefault}
      onClick={onSelect}
      onKeyDown={handleKeyDown}
    >
      <div className="ai-model-card-head">
        <span className="ai-model-card-icon"><Icon name="cube" size={16} /></span>
        <div className="ai-model-card-title">
          <span className="ai-model-card-provider">{provider.name}</span>
          <span className="ai-model-card-name">{model.name}</span>
        </div>
        <div className="ai-model-card-tags">
          {isDefault && <span className="ai-tag is-default">{copy.aiModelDefault}</span>}
          {model.contextWindow && <span className="ai-tag">{model.contextWindow}</span>}
        </div>
      </div>
      <div className="ai-model-card-meta">
        <span className="ai-model-card-url" title={provider.baseUrl}>{provider.baseUrl}</span>
        <span className="ai-tag is-format">{copy[formatTagKey] || provider.apiFormat}</span>
        <div className="ai-model-card-actions">
          <button type="button" className="ai-model-card-button" onClick={(e) => { e.stopPropagation(); onEdit() }} title={copy.aiEditModel}><Icon name="edit" size={14} /></button>
          <button type="button" className="ai-model-card-button is-danger" onClick={(e) => { e.stopPropagation(); onDelete() }} title={copy.aiDeleteModel}><Icon name="trash" size={14} /></button>
        </div>
      </div>
    </div>
  )
}

function ProviderForm({ copy, draft, onChange, onSubmit, onCancel }) {
  const [keyVisible, setKeyVisible] = useState(false)
  const [formatOpen, setFormatOpen] = useState(false)
  const errors = validateProviderEntry(draft)
  const canSave = Object.keys(errors).length === 0
  const update = (patch) => onChange({ ...draft, ...patch })

  const updateModel = (id, patch) => {
    update({ models: draft.models.map((m) => (m.id === id ? { ...m, ...patch } : m)) })
  }
  const removeModel = (id) => {
    update({ models: draft.models.filter((m) => m.id !== id) })
  }
  const addModelRow = () => {
    update({ models: [...draft.models, newModelEntry()] })
  }

  const formatLabel = FORMAT_LABEL_KEYS[draft.apiFormat] ? copy[FORMAT_LABEL_KEYS[draft.apiFormat]] : draft.apiFormat

  return (
    <form className="ai-model-form" onSubmit={(event) => { event.preventDefault(); if (canSave) onSubmit() }}>
      <div className="ai-field-row">
        <div className="ai-field">
          <label className="ai-field-label">{copy.aiProviderName} *</label>
          <input type="text" className="ai-field-input" value={draft.name} placeholder="DeepSeek" onChange={(e) => update({ name: e.target.value })} />
          {errors.name && <span className="ai-field-error">{copy.aiFieldRequired}</span>}
        </div>
        <div className="ai-field">
          <label className="ai-field-label">{copy.aiBaseUrl} *</label>
          <input type="text" className="ai-field-input" value={draft.baseUrl} placeholder="https://api.example.com" onChange={(e) => update({ baseUrl: e.target.value })} />
          {errors.baseUrl && <span className="ai-field-error">{errors.baseUrl === 'invalid' || errors.baseUrl === 'invalidProtocol' ? copy.aiInvalidUrl : copy.aiFieldRequired}</span>}
        </div>
      </div>
      <div className="ai-field-row">
        <div className="ai-field">
          <label className="ai-field-label">{copy.aiApiFormat}</label>
          <div className="ai-select-wrap">
            <button type="button" className="ai-select-button" onClick={() => setFormatOpen((v) => !v)} aria-haspopup="listbox" aria-expanded={formatOpen}>
              <span>{formatLabel}</span>
              <Icon name="chevron" size={12} />
            </button>
            {formatOpen && (
              <div className="ai-select-menu" role="listbox">
                {API_FORMATS.map((fmt) => (
                  <button
                    key={fmt.value}
                    type="button"
                    role="option"
                    aria-selected={draft.apiFormat === fmt.value}
                    className={`ai-select-option ${draft.apiFormat === fmt.value ? 'is-selected' : ''}`}
                    onClick={() => { update({ apiFormat: fmt.value }); setFormatOpen(false) }}
                  >
                    {copy[FORMAT_LABEL_KEYS[fmt.value]] || fmt.value}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="ai-field">
          <label className="ai-field-label">{copy.aiApiKey} *</label>
          <div className="ai-key-input-wrap">
            <input
              type={keyVisible ? 'text' : 'password'}
              className="ai-field-input ai-key-input"
              value={draft.apiKey}
              onChange={(e) => update({ apiKey: e.target.value })}
              placeholder={copy.aiApiKeyPlaceholder}
              autoComplete="off"
              spellCheck={false}
            />
            <button type="button" className="mini-button ai-key-toggle" onClick={() => setKeyVisible((v) => !v)} title={keyVisible ? copy.aiHideKey : copy.aiShowKey}>
              <Icon name={keyVisible ? 'eye-off' : 'eye'} size={14} />
            </button>
          </div>
          {errors.apiKey && <span className="ai-field-error">{copy.aiFieldRequired}</span>}
        </div>
      </div>
      <div className="ai-field">
        <div className="ai-model-form-list-head">
          <label className="ai-field-label">{copy.aiModelList} *</label>
          <button type="button" className="mini-button" onClick={addModelRow} title={copy.aiAddModel}><Icon name="plus" size={12} /></button>
        </div>
        <div className="ai-model-form-list">
          {draft.models.map((model) => (
            <div key={model.id} className="ai-model-form-row">
              <input type="text" className="ai-field-input ai-model-form-name" value={model.name} placeholder={copy.aiModelName} onChange={(e) => updateModel(model.id, { name: e.target.value })} />
              <input type="text" className="ai-field-input ai-model-form-context" value={model.contextWindow} placeholder={copy.aiContextWindow} onChange={(e) => updateModel(model.id, { contextWindow: e.target.value })} />
              <button type="button" className="ai-model-card-button is-danger" onClick={() => removeModel(model.id)} title={copy.aiRemoveModel} disabled={draft.models.length <= 1}><Icon name="trash" size={13} /></button>
            </div>
          ))}
        </div>
        {errors.models && <span className="ai-field-error">{copy.aiNoModelError}</span>}
      </div>
      <div className="ai-model-form-footer">
        <button type="button" className="button button-quiet" onClick={onCancel}>{copy.aiCancel}</button>
        <button type="submit" className="button button-accent" disabled={!canSave}>{copy.aiSave}</button>
      </div>
    </form>
  )
}

export default function AiSettingsModal({ copy, settings, onSave, onClose }) {
  // editing 为 null 时显示卡片列表；否则显示供应商表单（isNew 标记新增）。
  const [editing, setEditing] = useState(null)

  const commit = (providers, activeModelId) => {
    onSave({ providers, activeModelId })
  }

  const startAdd = () => setEditing({ draft: newProviderEntry(), isNew: true })

  const startEdit = (providerId) => {
    const provider = settings.providers.find((p) => p.id === providerId)
    if (provider) setEditing({ draft: structuredClone(provider), isNew: false })
  }

  const submitEdit = () => {
    if (!editing) return
    const entry = {
      ...editing.draft,
      name: editing.draft.name.trim(),
      baseUrl: editing.draft.baseUrl.trim().replace(/\/+$/, ''),
      apiKey: editing.draft.apiKey.trim(),
      models: editing.draft.models
        .filter((m) => m.name.trim())
        .map((m) => ({ ...m, name: m.name.trim(), contextWindow: m.contextWindow.trim() })),
    }
    if (editing.isNew) {
      const providers = [...settings.providers, entry]
      const activeModelId = settings.activeModelId || entry.models[0]?.id || ''
      commit(providers, activeModelId)
    } else {
      const providers = settings.providers.map((p) => (p.id === entry.id ? entry : p))
      const modelIds = new Set(entry.models.map((m) => m.id))
      const activeModelId = modelIds.has(settings.activeModelId)
        ? settings.activeModelId
        : (entry.models[0]?.id || settings.providers.flatMap((p) => p.models.map((m) => m.id)).find((id) => id !== undefined) || '')
      commit(providers, activeModelId)
    }
    setEditing(null)
  }

  const deleteModel = (providerId, model) => {
    if (!window.confirm(`${copy.aiConfirmDelete} (${model.name})`)) return
    let providers = settings.providers
      .map((p) => (p.id === providerId ? { ...p, models: p.models.filter((m) => m.id !== model.id) } : p))
      .filter((p) => p.models.length)
    const activeModelId = settings.activeModelId === model.id
      ? (providers[0]?.models[0]?.id || '')
      : settings.activeModelId
    commit(providers, activeModelId)
  }

  const setDefault = (modelId) => {
    commit(settings.providers, modelId)
  }

  const cards = settings.providers.flatMap((provider) => provider.models.map((model) => ({ provider, model })))

  return (
    <div className="shortcuts-overlay" onClick={onClose}>
      <div className="shortcuts-modal ai-settings-modal" role="dialog" aria-modal="true" aria-label={copy.aiSettingsTitle} onClick={(e) => e.stopPropagation()}>
        <div className="shortcuts-header">
          <div className="ai-settings-header-main">
            {editing && <button type="button" className="mini-button" onClick={() => setEditing(null)} aria-label={copy.aiCancel}><Icon name="undo" size={13} /></button>}
            <span>{editing ? (editing.isNew ? copy.aiAddModel : copy.aiEditModel) : copy.aiSettingsTitle}</span>
          </div>
          <button className="mini-button" onClick={onClose} aria-label={copy.aiCancel}><Icon name="x" size={14} /></button>
        </div>

        {editing ? (
          <div className="ai-settings-form-view">
            <ProviderForm copy={copy} draft={editing.draft} onChange={(draft) => setEditing({ ...editing, draft })} onSubmit={submitEdit} onCancel={() => setEditing(null)} />
          </div>
        ) : (
          <>
            <div className="ai-settings-list-head">
              <p className="ai-settings-desc">{copy.aiSettingsDesc}</p>
              <button type="button" className="button button-accent ai-add-model-button" onClick={startAdd}><Icon name="plus" size={13} /> {copy.aiAddModel}</button>
            </div>
            <div className="ai-settings-body">
              <div className="ai-model-cards">
                {cards.map(({ provider, model }) => (
                  <ModelCard
                    key={model.id}
                    copy={copy}
                    provider={provider}
                    model={model}
                    isDefault={model.id === settings.activeModelId}
                    onSelect={() => setDefault(model.id)}
                    onEdit={() => startEdit(provider.id)}
                    onDelete={() => deleteModel(provider.id, model)}
                  />
                ))}
              </div>
              {!cards.length && <div className="ai-model-empty">{copy.aiModelsEmpty}</div>}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
