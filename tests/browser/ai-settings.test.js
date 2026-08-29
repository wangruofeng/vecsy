import { afterEach, describe, expect, it } from 'vitest'
import { API_FORMATS, DEFAULT_AI_SETTINGS, getActiveModel, isProviderConfigured, loadAiSettings, saveAiSettings, validateProviderEntry } from '../../src/ai/ai-settings.js'

afterEach(() => {
  window.localStorage.clear()
})

const provider = (overrides = {}, { extra } = {}) => ({
  id: 'p1',
  name: 'DeepSeek',
  baseUrl: 'https://api.deepseek.com',
  apiFormat: 'chat-completions',
  apiKey: 'sk-test',
  models: extra || [{ id: 'm1', name: 'deepseek-chat', contextWindow: '128K' }],
  ...overrides,
})

describe('ai-settings storage', () => {
  it('returns defaults when nothing is stored', () => {
    expect(loadAiSettings()).toEqual(DEFAULT_AI_SETTINGS)
  })

  it('round-trips providers with multi-model lists', () => {
    const settings = {
      providers: [
        provider(),
        provider({ id: 'p2', name: 'OpenAI', baseUrl: 'https://api.openai.com/v1', apiFormat: 'responses' }, { extra: [
          { id: 'm2', name: 'gpt-5', contextWindow: '400K' },
          { id: 'm3', name: 'gpt-5-mini', contextWindow: '400K' },
        ] }),
      ],
      activeModelId: 'm3',
    }
    const saved = saveAiSettings(settings)
    expect(saved).toEqual(settings)
    expect(loadAiSettings()).toEqual(settings)
  })

  it('migrates the previous flat per-model format by grouping into providers', () => {
    window.localStorage.setItem('vecsy:ai-settings', JSON.stringify({
      models: [
        { id: 'a', provider: 'DeepSeek', name: 'deepseek-chat', baseUrl: 'https://api.deepseek.com', apiFormat: 'chat-completions', apiKey: 'sk-1', contextWindow: '64K' },
        { id: 'b', provider: 'DeepSeek', name: 'deepseek-reasoner', baseUrl: 'https://api.deepseek.com', apiFormat: 'chat-completions', apiKey: 'sk-1' },
        { id: 'c', provider: 'OpenAI', name: 'gpt-5', baseUrl: 'https://api.openai.com/v1', apiFormat: 'responses', apiKey: 'sk-2' },
      ],
      activeModelId: 'b',
    }))
    const loaded = loadAiSettings()
    expect(loaded.providers).toHaveLength(2)
    const deepseek = loaded.providers.find((p) => p.name === 'DeepSeek')
    expect(deepseek.models.map((m) => m.name)).toEqual(['deepseek-chat', 'deepseek-reasoner'])
    expect(deepseek.apiKey).toBe('sk-1')
    expect(loaded.activeModelId).toBe('b')
  })

  it('normalizes malformed stored data back to safe values', () => {
    window.localStorage.setItem('vecsy:ai-settings', JSON.stringify({
      providers: [
        { name: 'ok', baseUrl: 'https://x.test', apiKey: 'k', models: [{ name: '  ' }, { name: 'model-a' }] },
        { name: '', models: [] },
      ],
      activeModelId: 'missing',
    }))
    const loaded = loadAiSettings()
    expect(loaded.providers).toHaveLength(1)
    expect(loaded.providers[0].models.map((m) => m.name)).toEqual(['model-a'])
    expect(loaded.activeModelId).toBe(loaded.providers[0].models[0].id)
  })

  it('falls back to defaults when stored JSON is corrupt', () => {
    window.localStorage.setItem('vecsy:ai-settings', 'not-json{')
    expect(loadAiSettings()).toEqual(DEFAULT_AI_SETTINGS)
  })

  it('allows saving an empty provider list', () => {
    const saved = saveAiSettings({ providers: [], activeModelId: '' })
    expect(saved.providers).toEqual([])
    expect(saved.activeModelId).toBe('')
  })

  it('deduplicates model ids across providers', () => {
    window.localStorage.setItem('vecsy:ai-settings', JSON.stringify({
      providers: [
        { id: 'p1', name: 'A', baseUrl: 'https://a.test', apiKey: 'k', models: [{ id: 'dup', name: 'a1' }] },
        { id: 'p2', name: 'B', baseUrl: 'https://b.test', apiKey: 'k', models: [{ id: 'dup', name: 'b1' }] },
      ],
      activeModelId: 'dup',
    }))
    const loaded = loadAiSettings()
    const ids = loaded.providers.flatMap((p) => p.models.map((m) => m.id))
    expect(new Set(ids).size).toBe(ids.length)
  })
})

describe('getActiveModel / isProviderConfigured', () => {
  it('is false for defaults (no api key)', () => {
    expect(isProviderConfigured(DEFAULT_AI_SETTINGS)).toBe(false)
  })

  it('combines the provider endpoint with the active model name', () => {
    const settings = { providers: [provider()], activeModelId: 'm1' }
    const active = getActiveModel(settings)
    expect(active).toMatchObject({
      provider: 'DeepSeek',
      name: 'deepseek-chat',
      baseUrl: 'https://api.deepseek.com',
      apiFormat: 'chat-completions',
      apiKey: 'sk-test',
    })
    expect(isProviderConfigured(settings)).toBe(true)
  })

  it('is false when the provider list is empty', () => {
    expect(isProviderConfigured({ providers: [], activeModelId: '' })).toBe(false)
  })

  it('repairs a dangling activeModelId to the first model', () => {
    const settings = { providers: [provider()], activeModelId: 'gone' }
    expect(isProviderConfigured(settings)).toBe(true)
    expect(getActiveModel(settings).name).toBe('deepseek-chat')
  })
})

describe('validateProviderEntry', () => {
  it('flags missing name, baseUrl, apiKey and models', () => {
    const errors = validateProviderEntry({ name: '', baseUrl: '', apiFormat: 'chat-completions', apiKey: '', models: [] })
    expect(errors.name).toBe('required')
    expect(errors.baseUrl).toBe('required')
    expect(errors.apiKey).toBe('required')
    expect(errors.models).toBe('required')
    expect(errors.apiFormat).toBeUndefined()
  })

  it('rejects an invalid URL', () => {
    const errors = validateProviderEntry(provider({ name: 'x', baseUrl: 'not a url' }))
    expect(errors.baseUrl).toBe('invalid')
  })

  it('flags when all model names are blank', () => {
    const errors = validateProviderEntry(provider({ models: [{ id: 'm', name: '  ' }] }))
    expect(errors.models).toBe('required')
  })

  it('accepts a valid entry with multiple models', () => {
    const entry = provider({}, { extra: [{ id: 'm1', name: 'deepseek-chat' }, { id: 'm2', name: 'deepseek-reasoner' }] })
    expect(validateProviderEntry(entry)).toEqual({})
  })

  it('exposes the three supported API formats', () => {
    expect(API_FORMATS.map((f) => f.value)).toEqual(['chat-completions', 'anthropic-messages', 'responses'])
  })
})
