import { ERROR_CODES } from '../design-action-schema.js'
import { handleFetchError, mapResponseStatus, normalizeBaseUrl, providerError, readJson } from './_shared.js'

export async function callChatCompletions({ baseUrl, apiKey, model, messages, signal, fetchImpl = globalThis.fetch, timeoutMs = 30000 }) {
  if (!apiKey) throw providerError(ERROR_CODES.PROVIDER_NOT_CONFIGURED)

  const url = `${normalizeBaseUrl(baseUrl)}/chat/completions`
  const abortController = signal ? null : new AbortController()
  const activeSignal = signal || abortController.signal
  let timeoutId
  if (!signal && timeoutMs) {
    timeoutId = setTimeout(() => abortController.abort(), timeoutMs)
  }

  let response
  try {
    response = await fetchImpl(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: 0,
        max_tokens: 2048,
        response_format: { type: 'json_object' },
      }),
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
  const text = payload?.choices?.[0]?.message?.content
  if (typeof text !== 'string' || !text.trim()) {
    throw providerError(ERROR_CODES.INVALID_RESPONSE, 'The AI response was empty.')
  }
  return {
    text,
    model: payload?.model || model,
    usage: typeof payload?.usage === 'object' && payload.usage ? payload.usage : null,
  }
}
