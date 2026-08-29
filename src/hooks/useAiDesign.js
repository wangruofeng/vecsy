import { useRef, useState } from 'react'
import { createDirectAiClient } from '../ai/direct-ai-client.js'
import { buildDesignContext } from '../ai/build-design-context.js'
import { ERROR_CODES, DesignActionError } from '../ai/design-action-schema.js'
import { executeDesignActions } from '../ai/execute-design-actions.js'
import { createDemoEnvelope } from '../ai/quick-actions.js'
import { isProviderConfigured } from '../ai/ai-settings.js'

const REQUEST_TIMEOUT_MS = 35000

function sameIds(left, right) {
  return left.length === right.length && left.every((id, index) => id === right[index])
}

function errorState(error) {
  return { status: 'error', preview: null, error: error?.code || ERROR_CODES.INVALID_RESPONSE }
}

export default function useAiDesign({ svgMarkup, selectedIds, documentRevision, commitDocument, aiSettings, aiClient }) {
  const [state, setState] = useState({ status: 'idle', preview: null, error: '' })
  const requestSequenceRef = useRef(0)
  const lastRequestRef = useRef(null)
  const clientRef = useRef(null)
  const settingsRef = useRef(aiSettings)
  const injectedClientRef = useRef(aiClient)

  // Keep refs up to date so callbacks always use the latest.
  settingsRef.current = aiSettings
  injectedClientRef.current = aiClient

  const getClient = () => {
    if (injectedClientRef.current) return injectedClientRef.current
    const settings = settingsRef.current
    const signature = signatureOf(settings)
    if (!clientRef.current || clientRef.current._settingsSignature !== signature) {
      clientRef.current = createDirectAiClient({ settings })
      clientRef.current._settingsSignature = signature
    }
    return clientRef.current
  }

  const nextRequestToken = () => {
    requestSequenceRef.current += 1
    return requestSequenceRef.current
  }

  const configured = Boolean(aiClient) || isProviderConfigured(aiSettings)

  const previewEnvelope = (envelope, prompt = '', context = buildDesignContext(svgMarkup, selectedIds), baseRevision = documentRevision, requestToken = nextRequestToken()) => {
    const requestId = globalThis.crypto?.randomUUID?.() || `ai-${Date.now()}`
    try {
      setState({ status: 'validating', preview: null, error: '' })
      const result = executeDesignActions(svgMarkup, envelope, context)
      setState({
        status: 'preview',
        error: '',
        preview: { requestId, baseRevision, selectionIds: [...selectedIds], prompt, ...result },
      })
    } catch (error) {
      setState(errorState(error))
    }
  }

  const submitJson = (source) => {
    try {
      previewEnvelope(JSON.parse(source), 'JSON debug')
    } catch {
      setState(errorState(new DesignActionError(ERROR_CODES.INVALID_RESPONSE)))
    }
  }

  const previewDemo = (actionId, summary) => {
    const context = buildDesignContext(svgMarkup, selectedIds)
    const baseRevision = documentRevision
    const requestToken = nextRequestToken()
    lastRequestRef.current = { kind: 'demo', actionId, summary }
    setState({ status: 'validating', preview: null, error: '' })
    Promise.resolve()
      .then(() => createDemoEnvelope(actionId, context))
      .then((envelope) => {
        if (requestToken !== requestSequenceRef.current) return
        previewEnvelope(envelope, summary || actionId, context, baseRevision, requestToken)
      })
      .catch((error) => {
        if (requestToken === requestSequenceRef.current) setState(errorState(error))
      })
  }

  const previewPrompt = (prompt) => {
    const trimmed = typeof prompt === 'string' ? prompt.trim() : ''
    if (!trimmed) return
    if (!configured) {
      setState(errorState(new DesignActionError(ERROR_CODES.PROVIDER_NOT_CONFIGURED)))
      return
    }
    const context = buildDesignContext(svgMarkup, selectedIds)
    const baseRevision = documentRevision
    const requestToken = nextRequestToken()
    lastRequestRef.current = { kind: 'prompt', prompt: trimmed }
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)
    setState({ status: 'thinking', preview: null, error: '' })
    Promise.resolve()
      .then(() => getClient().editDesign({ prompt: trimmed, context, signal: controller.signal }))
      .then((envelope) => {
        clearTimeout(timeout)
        if (requestToken !== requestSequenceRef.current) return
        previewEnvelope(envelope, trimmed, context, baseRevision, requestToken)
      })
      .catch((error) => {
        clearTimeout(timeout)
        if (requestToken === requestSequenceRef.current) setState(errorState(error))
      })
  }

  const retry = () => {
    const last = lastRequestRef.current
    if (!last) return
    if (last.kind === 'demo') previewDemo(last.actionId, last.summary)
    else previewPrompt(last.prompt)
  }

  const applyPreview = () => {
    const preview = state.preview
    if (!preview) return
    if (preview.changed === false) {
      setState({ status: 'idle', preview: null, error: '' })
      return
    }
    if (preview.baseRevision !== documentRevision || !sameIds(preview.selectionIds, selectedIds)) {
      setState(errorState(new DesignActionError(ERROR_CODES.DOCUMENT_CHANGED)))
      return
    }
    setState({ status: 'applying', preview, error: '' })
    commitDocument(preview.markup, {
      nextSelectedId: preview.nextSelectedId,
      nextSelectedIds: preview.nextSelectedIds,
      nextDirty: true,
    })
    setState({ status: 'idle', preview: null, error: '' })
  }

  const cancelPreview = () => {
    nextRequestToken()
    setState({ status: 'idle', preview: null, error: '' })
  }

  return {
    ...state,
    configured,
    previewEnvelope,
    previewDemo,
    previewPrompt,
    submitJson,
    applyPreview,
    cancelPreview,
    retry,
    clearError: () => setState((current) => ({ ...current, error: '' })),
  }
}

function signatureOf(settings) {
  if (!settings) return ''
  return JSON.stringify(settings)
}
