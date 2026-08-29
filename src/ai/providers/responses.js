import { ERROR_CODES } from '../design-action-schema.js'
import { handleFetchError, mapResponseStatus, normalizeBaseUrl, providerError, readJson } from './_shared.js'

// OpenAI Responses API.
// Docs: https://platform.openai.com/docs/api-reference/responses
// Entry point: POST /responses
// Input is an array of items (system, user, assistant messages).
// Response text lives in output[].content[].text.

function extractTextFromOutput(output) {
  if (!Array.isArray(output)) return ''
  const parts = []
  for (const item of output) {
    if (!item || !Array.isArray(item.content)) continue
    for (const block of item.content) {
      if (block?.type === 'output_text' && typeof block.text === 'string') {
        parts.push(block.text)
      } else if (block?.type === 'message' && Array.isArray(block.content)) {
        for (const inner of block.content) {
          if (inner?.type === 'output_text' && typeof inner.text === 'string') parts.push(inner.text)
          else if (typeof inner?.text === 'string') parts.push(inner.text)
        }
      } else if (typeof block?.text === 'string') {
        parts.push(block.text)
      }
    }
  }
  return parts.join('')
}

export async function callResponsesApi({ baseUrl, apiKey, model, input, signal, fetchImpl = globalThis.fetch, timeoutMs = 30000 }) {
  if (!apiKey) throw providerError(ERROR_CODES.PROVIDER_NOT_CONFIGURED)

  const url = `${normalizeBaseUrl(baseUrl)}/responses`
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
        input,
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
  const text = extractTextFromOutput(payload?.output)
  if (!text.trim()) {
    // Fallback: some providers put text elsewhere.
    const fallback = payload?.output_text || payload?.content || ''
    if (typeof fallback === 'string' && fallback.trim()) {
      return { text: fallback, model: payload?.model || model, usage: payload?.usage || null }
    }
    throw providerError(ERROR_CODES.INVALID_RESPONSE, 'The AI response was empty.')
  }
  return {
    text,
    model: payload?.model || model,
    usage: typeof payload?.usage === 'object' && payload.usage ? payload.usage : null,
  }
}
