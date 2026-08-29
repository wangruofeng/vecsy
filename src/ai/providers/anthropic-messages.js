import { ERROR_CODES } from '../design-action-schema.js'
import { handleFetchError, mapResponseStatus, normalizeBaseUrl, providerError, readJson } from './_shared.js'

// Anthropic Messages API.
// Docs: https://docs.anthropic.com/en/api/messages
// The system prompt goes in the top-level `system` field (not as a message).
// Authentication uses `x-api-key` header + `anthropic-version`.
const ANTHROPIC_VERSION = '2023-06-01'

function toAnthropicMessages(messages) {
  // Filter out system role (it goes in the top-level system field),
  // and ensure role alternates between user and assistant.
  const result = []
  for (const msg of messages) {
    if (msg.role === 'system') continue
    const role = msg.role === 'assistant' ? 'assistant' : 'user'
    const content = typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content)
    if (result.length && result[result.length - 1].role === role) {
      // Merge consecutive same-role messages to maintain alternation.
      result[result.length - 1].content += `\n\n${content}`
    } else {
      result.push({ role, content })
    }
  }
  // Anthropic requires at least one user message.
  if (!result.some((m) => m.role === 'user')) {
    result.push({ role: 'user', content: ' ' })
  }
  return result
}

function extractSystemPrompt(messages) {
  const systems = messages.filter((m) => m.role === 'system').map((m) => m.content)
  return systems.join('\n\n')
}

export async function callAnthropicMessages({ baseUrl, apiKey, model, messages, signal, fetchImpl = globalThis.fetch, timeoutMs = 30000 }) {
  if (!apiKey) throw providerError(ERROR_CODES.PROVIDER_NOT_CONFIGURED)

  const url = `${normalizeBaseUrl(baseUrl)}/v1/messages`
  const abortController = signal ? null : new AbortController()
  const activeSignal = signal || abortController.signal
  let timeoutId
  if (!signal && timeoutMs) {
    timeoutId = setTimeout(() => abortController.abort(), timeoutMs)
  }

  const anthropicMessages = toAnthropicMessages(messages)
  const system = extractSystemPrompt(messages)

  const body = {
    model,
    max_tokens: 2048,
    messages: anthropicMessages,
  }
  if (system) body.system = system

  let response
  try {
    response = await fetchImpl(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': ANTHROPIC_VERSION,
      },
      body: JSON.stringify(body),
      signal: activeSignal,
    })
  } catch (error) {
    throw handleFetchError(error)
  } finally {
    if (timeoutId) clearTimeout(timeoutId)
  }

  if (!response.ok) {
    const code = mapResponseStatus(response.status)
    throw providerError(code)
  }

  const payload = await readJson(response)
  // Content is an array of blocks; concatenate text blocks.
  const blocks = Array.isArray(payload?.content) ? payload.content : []
  const text = blocks
    .filter((block) => block?.type === 'text' && typeof block.text === 'string')
    .map((block) => block.text)
    .join('')

  if (!text.trim()) {
    throw providerError(ERROR_CODES.INVALID_RESPONSE, 'The AI response was empty.')
  }
  return {
    text,
    model: payload?.model || model,
    usage: typeof payload?.usage === 'object' && payload.usage ? payload.usage : null,
  }
}
