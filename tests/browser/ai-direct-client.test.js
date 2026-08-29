import { describe, expect, it, vi } from 'vitest'
import { createDirectAiClient } from '../../src/ai/direct-ai-client.js'
import { DEFAULT_AI_SETTINGS } from '../../src/ai/ai-settings.js'
import { ERROR_CODES } from '../../src/ai/design-action-schema.js'

const ENVELOPE = { version: '1.0', intent: 'edit-selection', summary: 'Blue', actions: [{ type: 'set-style', targetIds: ['rect'], properties: { fill: '#6366F1' } }] }

const providerWith = (overrides = {}, models = [{ id: 'm1', name: 'deepseek-chat', contextWindow: '128K' }]) => ({
  id: 'p1',
  name: 'DeepSeek',
  baseUrl: 'https://api.deepseek.com',
  apiFormat: 'chat-completions',
  apiKey: 'sk-test',
  models,
  ...overrides,
})

function fakeFetch(body) {
  const fetchImpl = vi.fn()
  fetchImpl.mockResolvedValue({
    ok: true,
    status: 200,
    json: async () => body,
  })
  return fetchImpl
}

describe('createDirectAiClient', () => {
  it('throws PROVIDER_NOT_CONFIGURED when settings are incomplete', async () => {
    const client = createDirectAiClient({ settings: DEFAULT_AI_SETTINGS, fetchImpl: fakeFetch({}) })
    await expect(client.editDesign({ prompt: 'blue', context: {} })).rejects.toMatchObject({ code: ERROR_CODES.PROVIDER_NOT_CONFIGURED })
  })

  it('routes chat-completions format and returns the parsed envelope', async () => {
    const fetchImpl = fakeFetch({ choices: [{ message: { content: JSON.stringify(ENVELOPE) } }] })
    const client = createDirectAiClient({ settings: { providers: [providerWith()], activeModelId: 'm1' }, fetchImpl })
    const envelope = await client.editDesign({ prompt: 'make it blue', context: { selection: [] } })
    expect(envelope).toEqual(ENVELOPE)
    const [url] = fetchImpl.mock.calls[0]
    expect(url).toBe('https://api.deepseek.com/chat/completions')
  })

  it('routes anthropic-messages format', async () => {
    const fetchImpl = fakeFetch({ content: [{ type: 'text', text: JSON.stringify(ENVELOPE) }] })
    const settings = { providers: [providerWith({ apiFormat: 'anthropic-messages', baseUrl: 'https://api.anthropic.com' })], activeModelId: 'm1' }
    const client = createDirectAiClient({ settings, fetchImpl })
    const envelope = await client.editDesign({ prompt: 'make it blue', context: { selection: [] } })
    expect(envelope).toEqual(ENVELOPE)
    const [url, init] = fetchImpl.mock.calls[0]
    expect(url).toBe('https://api.anthropic.com/v1/messages')
    expect(init.headers['x-api-key']).toBe('sk-test')
  })

  it('routes responses format', async () => {
    const fetchImpl = fakeFetch({ output: [{ content: [{ type: 'output_text', text: JSON.stringify(ENVELOPE) }] }] })
    const settings = { providers: [providerWith({ apiFormat: 'responses', baseUrl: 'https://api.openai.com/v1' })], activeModelId: 'm1' }
    const client = createDirectAiClient({ settings, fetchImpl })
    const envelope = await client.editDesign({ prompt: 'make it blue', context: { selection: [] } })
    expect(envelope).toEqual(ENVELOPE)
    const [url] = fetchImpl.mock.calls[0]
    expect(url).toBe('https://api.openai.com/v1/responses')
  })

  it('uses the active model entry across providers', async () => {
    const fetchImpl = fakeFetch({ choices: [{ message: { content: JSON.stringify(ENVELOPE) } }] })
    const settings = {
      providers: [
        providerWith(),
        providerWith({ id: 'p2', name: 'OpenAI', baseUrl: 'https://api.openai.com/v1', apiKey: 'sk-openai' }, [{ id: 'm2', name: 'gpt-5', contextWindow: '' }]),
      ],
      activeModelId: 'm2',
    }
    const client = createDirectAiClient({ settings, fetchImpl })
    await client.editDesign({ prompt: 'p', context: { selection: [] } })
    const [url, init] = fetchImpl.mock.calls[0]
    expect(url).toBe('https://api.openai.com/v1/chat/completions')
    expect(init.headers.Authorization).toBe('Bearer sk-openai')
    expect(JSON.parse(init.body).model).toBe('gpt-5')
  })

  it('strips markdown fences around the JSON payload', async () => {
    const fenced = '```json\n' + JSON.stringify(ENVELOPE) + '\n```'
    const fetchImpl = fakeFetch({ choices: [{ message: { content: fenced } }] })
    const client = createDirectAiClient({ settings: { providers: [providerWith()], activeModelId: 'm1' }, fetchImpl })
    const envelope = await client.editDesign({ prompt: 'p', context: { selection: [] } })
    expect(envelope).toEqual(ENVELOPE)
  })

  it('maps upstream 401 to PROVIDER_NOT_CONFIGURED', async () => {
    const fetchImpl = vi.fn().mockResolvedValue({ ok: false, status: 401, json: async () => ({}) })
    const client = createDirectAiClient({ settings: { providers: [providerWith()], activeModelId: 'm1' }, fetchImpl })
    await expect(client.editDesign({ prompt: 'p', context: { selection: [] } })).rejects.toMatchObject({ code: ERROR_CODES.PROVIDER_NOT_CONFIGURED })
  })

  it('reports INVALID_RESPONSE for non-JSON provider text', async () => {
    const fetchImpl = fakeFetch({ choices: [{ message: { content: 'sorry, I cannot' } }] })
    const client = createDirectAiClient({ settings: { providers: [providerWith()], activeModelId: 'm1' }, fetchImpl })
    await expect(client.editDesign({ prompt: 'p', context: { selection: [] } })).rejects.toMatchObject({ code: ERROR_CODES.INVALID_RESPONSE })
  })

  it('generateDesign stays a stub', async () => {
    const client = createDirectAiClient({ settings: { providers: [providerWith()], activeModelId: 'm1' }, fetchImpl: fakeFetch({}) })
    await expect(client.generateDesign({})).rejects.toMatchObject({ code: ERROR_CODES.PROVIDER_NOT_CONFIGURED })
  })

  it('exposes configuration state helpers', () => {
    const configured = createDirectAiClient({ settings: { providers: [providerWith()], activeModelId: 'm1' }, fetchImpl: fakeFetch({}) })
    const unconfigured = createDirectAiClient({ settings: DEFAULT_AI_SETTINGS, fetchImpl: fakeFetch({}) })
    expect(configured.isConfigured).toBe(true)
    expect(configured.activeModel.name).toBe('deepseek-chat')
    expect(unconfigured.isConfigured).toBe(false)
  })
})
