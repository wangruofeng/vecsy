import { DesignActionError, ERROR_CODES } from '../design-action-schema.js'

export function providerError(code, message = code) {
  return new DesignActionError(code, message)
}

export function mapResponseStatus(status) {
  if (status === 401 || status === 403) return ERROR_CODES.PROVIDER_NOT_CONFIGURED
  if (status === 429) return ERROR_CODES.RATE_LIMITED
  if (status === 408 || status === 504) return ERROR_CODES.TIMEOUT
  return ERROR_CODES.AI_REQUEST_FAILED
}

export async function readJson(response) {
  try {
    return await response.json()
  } catch {
    return null
  }
}

export function normalizeBaseUrl(baseUrl) {
  return String(baseUrl || '').replace(/\/$/, '')
}

export function handleFetchError(error) {
  if (error?.name === 'TimeoutError' || error?.name === 'AbortError') {
    return providerError(ERROR_CODES.TIMEOUT)
  }
  return providerError(ERROR_CODES.AI_REQUEST_FAILED)
}
