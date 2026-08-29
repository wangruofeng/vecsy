import { describe, expect, it, vi } from 'vitest'
import { callChatCompletions } from '../../src/ai/providers/chat-completions.js'
import { callAnthropicMessages } from '../../src/ai/providers/anthropic-messages.js'
import { callResponsesApi } from '../../src/ai/providers/responses.js'
import { ERROR_CODES } from '../../src/ai/design-action-schema.js'
import { buildMessages, buildResponsesInput, buildSystemPrompt } from '../../src/ai/prompt.js'

function jsonResponse(body, status = 200) {
  return { ok: status >= 200 && status < 300, status, json: async () => body }
}

const MESSAGES = [
  { role: 'system', content: 'You are Vecsy.' },
  { role: 'user', content: 'User request: make it blue' },
]

describe('chat-completions adapter', () => {
  it('posts an OpenAI-compatible request and extracts the text', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(jsonResponse({
      choices: [{ message: { content: '{"version":"1.0"}' } }],
      model: 'deepseek-chat',
      usage: { total_tokens: 10 },
    }))
    const result = await callChatCompletions({
      baseUrl: 'https://api.deepseek.com/',
      apiKey: 'sk-test',
      model: 'deepseek-chat',
      messages: MESSAGES,
      fetchImpl,
    })
    const [url, init] = fetchImpl.mock.calls[0]
    expect(url).toBe('https://api.deepseek.com/chat/completions')
    expect(init.headers.Authorization).toBe('Bearer sk-test')
    expect(JSON.parse(init.body)).toEqual({
      model: 'deepseek-chat',
      messages: MESSAGES,
      temperature: 0,
      max_tokens: 2048,
      response_format: { type: 'json_object' },
    })
    expect(result.text).toBe('{"version":"1.0"}')
    expect(result.usage.total_tokens).toBe(10)
  })

  it('maps upstream status codes to stable error codes', async () => {
    for (const [status, code] of [[401, ERROR_CODES.PROVIDER_NOT_CONFIGURED], [429, ERROR_CODES.RATE_LIMITED], [504, ERROR_CODES.TIMEOUT], [500, ERROR_CODES.AI_REQUEST_FAILED]]) {
      const fetchImpl = vi.fn().mockResolvedValue(jsonResponse({}, status))
      await expect(callChatCompletions({ baseUrl: 'https://x.test', apiKey: 'sk', model: 'm', messages: MESSAGES, fetchImpl })).rejects.toMatchObject({ code })
    }
  })

  it('throws PROVIDER_NOT_CONFIGURED without an api key', async () => {
    const fetchImpl = vi.fn()
    await expect(callChatCompletions({ baseUrl: 'https://x.test', apiKey: '', model: 'm', messages: MESSAGES, fetchImpl })).rejects.toMatchObject({ code: ERROR_CODES.PROVIDER_NOT_CONFIGURED })
    expect(fetchImpl).not.toHaveBeenCalled()
  })

  it('rejects empty completions', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(jsonResponse({ choices: [{ message: { content: '   ' } }] }))
    await expect(callChatCompletions({ baseUrl: 'https://x.test', apiKey: 'sk', model: 'm', messages: MESSAGES, fetchImpl })).rejects.toMatchObject({ code: ERROR_CODES.INVALID_RESPONSE })
  })
})

describe('anthropic-messages adapter', () => {
  it('moves the system prompt into the top-level system field', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(jsonResponse({
      content: [{ type: 'text', text: '{"version":"1.0"}' }],
      model: 'claude-4',
      usage: { input_tokens: 5, output_tokens: 5 },
    }))
    const result = await callAnthropicMessages({
      baseUrl: 'https://api.anthropic.com',
      apiKey: 'sk-ant',
      model: 'claude-4',
      messages: MESSAGES,
      fetchImpl,
    })
    const [url, init] = fetchImpl.mock.calls[0]
    expect(url).toBe('https://api.anthropic.com/v1/messages')
    expect(init.headers['x-api-key']).toBe('sk-ant')
    expect(init.headers['anthropic-version']).toBe('2023-06-01')
    const body = JSON.parse(init.body)
    expect(body.system).toBe('You are Vecsy.')
    expect(body.messages).toEqual([{ role: 'user', content: 'User request: make it blue' }])
    expect(body.max_tokens).toBe(2048)
    expect(result.text).toBe('{"version":"1.0"}')
  })

  it('concatenates multiple text blocks', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(jsonResponse({
      content: [
        { type: 'text', text: '{"version":' },
        { type: 'text', text: '"1.0"}' },
      ],
    }))
    const result = await callAnthropicMessages({ baseUrl: 'https://x.test', apiKey: 'sk', model: 'm', messages: MESSAGES, fetchImpl })
    expect(result.text).toBe('{"version":"1.0"}')
  })

  it('merges consecutive same-role messages to keep alternation', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(jsonResponse({ content: [{ type: 'text', text: 'ok' }] }))
    await callAnthropicMessages({
      baseUrl: 'https://x.test', apiKey: 'sk', model: 'm', fetchImpl,
      messages: [
        { role: 'user', content: 'first' },
        { role: 'user', content: 'second' },
      ],
    })
    const body = JSON.parse(fetchImpl.mock.calls[0][1].body)
    expect(body.messages).toEqual([{ role: 'user', content: 'first\n\nsecond' }])
  })
})

describe('responses adapter', () => {
  it('posts to /responses and extracts output text', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(jsonResponse({
      output: [{ type: 'message', content: [{ type: 'output_text', text: '{"version":"1.0"}' }] }],
      model: 'gpt-5',
      usage: { total_tokens: 7 },
    }))
    const result = await callResponsesApi({
      baseUrl: 'https://api.openai.com/v1',
      apiKey: 'sk-test',
      model: 'gpt-5',
      input: MESSAGES,
      fetchImpl,
    })
    const [url, init] = fetchImpl.mock.calls[0]
    expect(url).toBe('https://api.openai.com/v1/responses')
    expect(init.headers.Authorization).toBe('Bearer sk-test')
    const body = JSON.parse(init.body)
    expect(body.model).toBe('gpt-5')
    expect(body.input).toEqual(MESSAGES)
    expect(body.response_format).toEqual({ type: 'json_object' })
    expect(result.text).toBe('{"version":"1.0"}')
  })

  it('falls back to output_text when output is missing', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(jsonResponse({ output_text: '{"intent":"edit-selection"}' }))
    const result = await callResponsesApi({ baseUrl: 'https://x.test', apiKey: 'sk', model: 'm', input: MESSAGES, fetchImpl })
    expect(result.text).toBe('{"intent":"edit-selection"}')
  })

  it('rejects responses without text', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(jsonResponse({ output: [] }))
    await expect(callResponsesApi({ baseUrl: 'https://x.test', apiKey: 'sk', model: 'm', input: MESSAGES, fetchImpl })).rejects.toMatchObject({ code: ERROR_CODES.INVALID_RESPONSE })
  })
})

describe('prompt builders', () => {
  it('includes the full VDAP protocol in the system prompt', () => {
    const system = buildSystemPrompt()
    for (const actionType of ['set-style', 'set-attributes', 'move', 'resize', 'replace-text', 'remove', 'group', 'insert-shape']) {
      expect(system).toContain(actionType)
    }
    expect(system).toContain('"version" must be "1.0"')
  })

  it('embeds the prompt and context in the user message', () => {
    const context = { selection: [{ id: 'rect', tag: 'rect' }] }
    const [, user] = buildMessages('make it blue', context)
    expect(user.role).toBe('user')
    expect(user.content).toContain('User request: make it blue')
    expect(user.content).toContain('"rect"')
  })

  it('builds the same shape for responses input', () => {
    const input = buildResponsesInput('p', { selection: [] })
    expect(input).toHaveLength(2)
    expect(input[0].role).toBe('system')
    expect(input[1].role).toBe('user')
  })
})
