import { useState } from 'react'
import { buildDesignContext } from '../ai/build-design-context.js'
import { ERROR_CODES, DesignActionError } from '../ai/design-action-schema.js'
import { executeDesignActions } from '../ai/execute-design-actions.js'
import { createDemoEnvelope, demoActionFromPrompt } from '../ai/quick-actions.js'

function sameIds(left, right) {
  return left.length === right.length && left.every((id, index) => id === right[index])
}

function errorState(error) {
  return { status: 'error', preview: null, error: error?.code || ERROR_CODES.INVALID_RESPONSE }
}

export default function useAiDesign({ svgMarkup, selectedIds, documentRevision, commitDocument }) {
  const [state, setState] = useState({ status: 'idle', preview: null, error: '' })

  const previewEnvelope = (envelope, prompt = '') => {
    const context = buildDesignContext(svgMarkup, selectedIds)
    const requestId = crypto.randomUUID?.() || `ai-${Date.now()}`
    const baseRevision = documentRevision
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
    try {
      previewEnvelope(createDemoEnvelope(actionId, buildDesignContext(svgMarkup, selectedIds), summary), summary || actionId)
    } catch (error) {
      setState(errorState(error))
    }
  }

  const previewPrompt = (prompt) => {
    try {
      previewEnvelope(demoActionFromPrompt(prompt, buildDesignContext(svgMarkup, selectedIds)), prompt)
    } catch (error) {
      setState(errorState(error))
    }
  }

  const applyPreview = () => {
    const preview = state.preview
    if (!preview) return
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

  return { ...state, previewEnvelope, previewDemo, previewPrompt, submitJson, applyPreview, cancelPreview: () => setState({ status: 'idle', preview: null, error: '' }), clearError: () => setState((current) => ({ ...current, error: '' })) }
}
