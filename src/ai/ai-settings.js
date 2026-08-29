const STORAGE_KEY = 'vecsy:ai-settings'

export const API_FORMATS = [
  { value: 'chat-completions', label: 'Chat Completions (/chat/completions)' },
  { value: 'anthropic-messages', label: 'Anthropic Messages (/v1/messages)' },
  { value: 'responses', label: 'Responses (/responses)' },
]

// 配置主体是供应商（端点 + 格式 + 密钥），每个供应商下挂一个模型列表。
export const DEFAULT_AI_SETTINGS = {
  providers: [
    {
      id: 'p1',
      name: 'DeepSeek',
      baseUrl: 'https://api.deepseek.com',
      apiFormat: 'chat-completions',
      apiKey: '',
      models: [
        { id: 'm1', name: 'deepseek-chat', contextWindow: '128K' },
      ],
    },
  ],
  activeModelId: 'm1',
}

function isPlainObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

function newId(prefix) {
  return `${prefix}${globalThis.crypto?.randomUUID?.().slice(0, 8) || `${Date.now()}${Math.random().toString(36).slice(2, 6)}`}`
}

function normalizeModel(raw, index) {
  const model = isPlainObject(raw) ? raw : {}
  return {
    id: typeof model.id === 'string' && model.id ? model.id : `m${index + 1}`,
    name: typeof model.name === 'string' ? model.name.trim() : '',
    contextWindow: typeof model.contextWindow === 'string' ? model.contextWindow.trim() : '',
  }
}

function normalizeProvider(raw, index) {
  const provider = isPlainObject(raw) ? raw : {}
  const models = (Array.isArray(provider.models) ? provider.models : [])
    .filter((m) => isPlainObject(m) && typeof m.name === 'string' && m.name.trim())
    .map(normalizeModel)
  return {
    id: typeof provider.id === 'string' && provider.id ? provider.id : `p${index + 1}`,
    name: typeof provider.name === 'string' ? provider.name.trim() : '',
    baseUrl: typeof provider.baseUrl === 'string' ? provider.baseUrl.trim() : '',
    apiFormat: API_FORMATS.some((f) => f.value === provider.apiFormat) ? provider.apiFormat : 'chat-completions',
    apiKey: typeof provider.apiKey === 'string' ? provider.apiKey : '',
    models,
  }
}

// 上一版扁平格式：models: [{ id, provider, name, baseUrl, apiFormat, apiKey, contextWindow }]。
// 迁移：按（供应商名 + 端点 + 格式 + 密钥）分组聚合回供应商结构。
function migrateFlatModels(raw) {
  const flat = Array.isArray(raw.models) ? raw.models.filter((m) => isPlainObject(m) && typeof m.baseUrl === 'string') : []
  if (!flat.length) return null

  const groups = []
  for (const item of flat) {
    const key = `${item.provider || ''}|${item.baseUrl}|${item.apiFormat || ''}|${item.apiKey || ''}`
    let group = groups.find((g) => g.key === key)
    if (!group) {
      group = { key, provider: { id: newId('p'), name: typeof item.provider === 'string' ? item.provider : '', baseUrl: String(item.baseUrl).trim(), apiFormat: API_FORMATS.some((f) => f.value === item.apiFormat) ? item.apiFormat : 'chat-completions', apiKey: typeof item.apiKey === 'string' ? item.apiKey : '', models: [] } }
      groups.push(group)
    }
    group.provider.models.push({ id: typeof item.id === 'string' && item.id ? item.id : newId('m'), name: String(item.name || '').trim(), contextWindow: typeof item.contextWindow === 'string' ? item.contextWindow.trim() : '' })
  }
  return { providers: groups.map((g) => g.provider), activeModelId: typeof raw.activeModelId === 'string' ? raw.activeModelId : '' }
}

function normalizeSettings(raw) {
  if (!isPlainObject(raw)) return { providers: [], activeModelId: '' }

  const migrated = migrateFlatModels(raw)
  const source = migrated || raw

  let providers = (Array.isArray(source.providers) ? source.providers : [])
    .filter((p) => isPlainObject(p))
    .map(normalizeProvider)
    .filter((p) => p.models.length)

  // provider id 与模型 id 都要全局唯一（activeModelId 依赖模型 id）。
  const seenProviderIds = new Set()
  const seenModelIds = new Set()
  providers = providers.map((p, index) => {
    let providerId = p.id
    if (seenProviderIds.has(providerId)) providerId = `${p.id}-${index}`
    seenProviderIds.add(providerId)
    const models = p.models.map((m, modelIndex) => {
      let modelId = m.id
      if (seenModelIds.has(modelId)) modelId = `${m.id}-${providerId}-${modelIndex}`
      seenModelIds.add(modelId)
      return modelId === m.id ? m : { ...m, id: modelId }
    })
    return providerId === p.id && models === p.models ? p : { ...p, id: providerId, models }
  })

  const activeModelId = seenModelIds.has(source.activeModelId)
    ? source.activeModelId
    : (providers[0]?.models[0]?.id || '')

  return { providers, activeModelId }
}

export function loadAiSettings() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return structuredClone(DEFAULT_AI_SETTINGS)
    const normalized = normalizeSettings(JSON.parse(raw))
    return normalized.providers.length ? normalized : structuredClone(DEFAULT_AI_SETTINGS)
  } catch {
    return structuredClone(DEFAULT_AI_SETTINGS)
  }
}

export function saveAiSettings(settings) {
  const normalized = normalizeSettings(settings)
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized))
  } catch {
    // Storage may be full or disabled; fail silently.
  }
  return normalized
}

// 返回激活模型的完整调用配置（供应商字段 + 模型名），供 direct client 直接使用。
export function getActiveModel(settings) {
  const s = normalizeSettings(settings)
  for (const provider of s.providers) {
    const model = provider.models.find((m) => m.id === s.activeModelId)
    if (model) {
      return {
        id: model.id,
        providerId: provider.id,
        provider: provider.name,
        name: model.name,
        baseUrl: provider.baseUrl,
        apiFormat: provider.apiFormat,
        apiKey: provider.apiKey,
        contextWindow: model.contextWindow,
      }
    }
  }
  return null
}

export function isProviderConfigured(settings) {
  const active = getActiveModel(settings)
  return Boolean(active && active.apiKey && active.baseUrl && active.name)
}

export function newProviderEntry() {
  return {
    id: newId('p'),
    name: '',
    baseUrl: '',
    apiFormat: 'chat-completions',
    apiKey: '',
    models: [{ id: newId('m'), name: '', contextWindow: '' }],
  }
}

export function newModelEntry() {
  return { id: newId('m'), name: '', contextWindow: '' }
}

// 校验一份供应商草稿：端点四要素 + 至少一个非空模型名。
export function validateProviderEntry(entry) {
  const errors = {}
  if (!entry?.name || !String(entry.name).trim()) errors.name = 'required'
  if (!entry?.baseUrl || !String(entry.baseUrl).trim()) {
    errors.baseUrl = 'required'
  } else {
    try {
      const url = new URL(String(entry.baseUrl))
      if (url.protocol !== 'https:' && url.protocol !== 'http:') errors.baseUrl = 'invalidProtocol'
    } catch {
      errors.baseUrl = 'invalid'
    }
  }
  if (!API_FORMATS.some((f) => f.value === entry?.apiFormat)) errors.apiFormat = 'invalid'
  if (!entry?.apiKey || !String(entry.apiKey).trim()) errors.apiKey = 'required'
  const models = Array.isArray(entry?.models) ? entry.models : []
  if (!models.length || models.every((m) => !m?.name?.trim())) errors.models = 'required'
  else if (models.some((m) => m?.name && !String(m.name).trim())) errors.models = 'invalid'
  return errors
}
