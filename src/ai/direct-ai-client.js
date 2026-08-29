import { ERROR_CODES } from './design-action-schema.js'
import { buildMessages, buildResponsesInput } from './prompt.js'
import { callChatCompletions } from './providers/chat-completions.js'
import { callAnthropicMessages } from './providers/anthropic-messages.js'
import { callResponsesApi } from './providers/responses.js'
import { providerError } from './providers/_shared.js'
import { getActiveModel, isProviderConfigured } from './ai-settings.js'

function parseEnvelope(text) {
  const trimmed = text.trim()
  // Some providers wrap JSON in markdown code fences; strip them.
  const stripped = trimmed
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/, '')
    .trim()
  try {
    return JSON.parse(stripped)
  } catch {
    throw providerError(ERROR_CODES.INVALID_RESPONSE, 'The AI response was not valid JSON.')
  }
}

export function createDirectAiClient({ settings, fetchImpl }) {
  const callProvider = async ({ prompt, context, signal }) => {
    if (!isProviderConfigured(settings)) {
      throw providerError(ERROR_CODES.PROVIDER_NOT_CONFIGURED)
    }
    const model = getActiveModel(settings)
    if (!model) throw providerError(ERROR_CODES.PROVIDER_NOT_CONFIGURED)

    const { apiFormat, baseUrl, apiKey, name } = model
    let completion

    if (apiFormat === 'chat-completions') {
      const messages = buildMessages(prompt, context)
      completion = await callChatCompletions({
        baseUrl, apiKey, model: name, messages, signal, fetchImpl,
      })
    } else if (apiFormat === 'anthropic-messages') {
      const messages = buildMessages(prompt, context)
      completion = await callAnthropicMessages({
        baseUrl, apiKey, model: name, messages, signal, fetchImpl,
      })
    } else if (apiFormat === 'responses') {
      const input = buildResponsesInput(prompt, context)
      completion = await callResponsesApi({
        baseUrl, apiKey, model: name, input, signal, fetchImpl,
      })
    } else {
      throw providerError(ERROR_CODES.PROVIDER_NOT_CONFIGURED, 'Unsupported API format.')
    }

    const envelope = parseEnvelope(completion.text)
    return envelope
  }

  return {
    async editDesign({ prompt, context, signal }) {
      return callProvider({ prompt, context, signal })
    },
    async generateDesign() {
      throw providerError(ERROR_CODES.PROVIDER_NOT_CONFIGURED, 'Generate is not available yet.')
    },
    // Expose active model for UI display.
    get activeModel() {
      return getActiveModel(settings)
    },
    get isConfigured() {
      return isProviderConfigured(settings)
    },
  }
}
