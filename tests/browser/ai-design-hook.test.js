import { afterEach, describe, expect, it, vi } from 'vitest'
import { createElement, act, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import useAiDesign from '../../src/hooks/useAiDesign.js'
import { DesignActionError, ERROR_CODES } from '../../src/ai/design-action-schema.js'

globalThis.IS_REACT_ACT_ENVIRONMENT = true

const markup = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <rect data-editor-id="rect" x="10" y="10" width="20" height="10" fill="#111111" />
  <circle data-editor-id="circle" cx="60" cy="20" r="8" />
</svg>`

const envelope = {
  version: '1.0',
  intent: 'edit-selection',
  summary: 'Make the selection blue',
  actions: [{ type: 'set-style', targetIds: ['rect'], properties: { fill: '#6366F1' } }],
}

const flush = () => new Promise((resolve) => setTimeout(resolve, 10))

let root = null

function renderHarness(props) {
  let latest = null
  const container = document.createElement('div')
  document.body.appendChild(container)
  root = createRoot(container)
  const Harness = () => {
    const ai = useAiDesign(props)
    useEffect(() => { latest = { ...ai } })
    return createElement('span', { 'data-testid': 'ai-status' }, ai.status)
  }
  act(() => { root.render(createElement(Harness)) })
  return { get latest() { return latest } }
}

afterEach(() => {
  if (root) root.unmount()
  root = null
  vi.restoreAllMocks()
})

describe('useAiDesign provider lifecycle', () => {
  it('moves through thinking -> preview -> apply and commits via commitDocument', async () => {
    let resolveEdit
    const editPromise = new Promise((resolve) => { resolveEdit = resolve })
    const aiClient = { editDesign: vi.fn(() => editPromise) }
    const commitDocument = vi.fn()
    const harness = renderHarness({ svgMarkup: markup, selectedIds: ['rect'], documentRevision: 0, commitDocument, aiClient })

    await act(async () => { harness.latest.previewPrompt('  make it blue  ') })
    expect(harness.latest.status).toBe('thinking')
    expect(aiClient.editDesign).toHaveBeenCalledTimes(1)
    expect(aiClient.editDesign.mock.calls[0][0].prompt).toBe('make it blue')
    expect(aiClient.editDesign.mock.calls[0][0].signal).toBeInstanceOf(AbortSignal)

    await act(async () => { resolveEdit(envelope); await flush() })
    expect(harness.latest.status).toBe('preview')
    expect(harness.latest.preview.summary).toBe('Make the selection blue')

    await act(async () => { harness.latest.applyPreview() })
    expect(commitDocument).toHaveBeenCalledTimes(1)
    expect(commitDocument.mock.calls[0][1].nextDirty).toBe(true)
    expect(harness.latest.status).toBe('idle')
  })

  it('retries the last prompt after a provider failure', async () => {
    const aiClient = {
      editDesign: vi.fn()
        .mockRejectedValueOnce(new DesignActionError(ERROR_CODES.AI_REQUEST_FAILED))
        .mockResolvedValueOnce(envelope),
    }
    const harness = renderHarness({ svgMarkup: markup, selectedIds: ['rect'], documentRevision: 0, commitDocument: vi.fn(), aiClient })

    await act(async () => { harness.latest.previewPrompt('make it blue'); await flush() })
    expect(harness.latest.status).toBe('error')
    expect(harness.latest.error).toBe(ERROR_CODES.AI_REQUEST_FAILED)

    await act(async () => { harness.latest.retry(); await flush() })
    expect(aiClient.editDesign).toHaveBeenCalledTimes(2)
    expect(harness.latest.status).toBe('preview')
  })

  it('keeps quick actions local and deterministic without calling the provider', async () => {
    const aiClient = { editDesign: vi.fn() }
    const harness = renderHarness({ svgMarkup: markup, selectedIds: ['rect', 'circle'], documentRevision: 0, commitDocument: vi.fn(), aiClient })

    await act(async () => { harness.latest.previewDemo('blue'); await flush() })
    expect(aiClient.editDesign).not.toHaveBeenCalled()
    expect(harness.latest.status).toBe('preview')
    expect(harness.latest.preview.markup).toContain('fill="#6366F1"')
  })
})
