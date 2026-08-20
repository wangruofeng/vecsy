import { useState } from 'react'
import AiPreviewPanel from './AiPreviewPanel.jsx'
import AiQuickActions from './AiQuickActions.jsx'

const ERROR_COPY_KEYS = {
  INVALID_RESPONSE: 'aiErrorInvalidResponse',
  UNSUPPORTED_PROTOCOL_VERSION: 'aiErrorUnsupportedProtocolVersion',
  INVALID_ACTION: 'aiErrorInvalidAction',
  UNKNOWN_TARGET: 'aiErrorUnknownTarget',
  OUT_OF_SELECTION_TARGET: 'aiErrorOutOfSelectionTarget',
  DOCUMENT_CHANGED: 'aiErrorDocumentChanged',
  PROVIDER_NOT_CONFIGURED: 'aiErrorProviderNotConfigured',
}

export default function AiCommandBar({ copy, aiDesign, selectedIds }) {
  const [prompt, setPrompt] = useState('')
  const [jsonOpen, setJsonOpen] = useState(false)
  const [jsonDraft, setJsonDraft] = useState('')
  const busy = aiDesign.status === 'validating' || aiDesign.status === 'applying'
  const error = aiDesign.error ? copy[ERROR_COPY_KEYS[aiDesign.error] || 'aiErrorInvalidResponse'] : ''
  const submitPrompt = (event) => {
    event.preventDefault()
    if (!prompt.trim()) return
    aiDesign.previewPrompt(prompt)
  }
  const submitJson = (event) => {
    event.preventDefault()
    aiDesign.submitJson(jsonDraft)
  }

  return <div className="ai-command-dock">
    <div className="ai-command-meta"><span>{copy.aiDemoRuntime}</span><button type="button" onClick={() => setJsonOpen((current) => !current)} aria-expanded={jsonOpen}>{copy.aiJsonDebug}</button></div>
    <AiQuickActions copy={copy} disabled={busy || !selectedIds.length} onAction={(actionId, summary) => aiDesign.previewDemo(actionId, summary)} />
    <form className="ai-command-form" onSubmit={submitPrompt}>
      <input value={prompt} onChange={(event) => setPrompt(event.target.value)} placeholder={copy.aiCommandPlaceholder} disabled={busy || !selectedIds.length} aria-label={copy.aiCommandPlaceholder} />
      <button className="button button-accent" type="submit" disabled={busy || !selectedIds.length}>{copy.aiPreview}</button>
    </form>
    {jsonOpen && <form className="ai-json-form" onSubmit={submitJson}>
      <textarea value={jsonDraft} onChange={(event) => setJsonDraft(event.target.value)} placeholder={copy.aiJsonPlaceholder} aria-label={copy.aiJsonPlaceholder} />
      <button className="button button-quiet" type="submit" disabled={busy || !selectedIds.length}>{copy.aiSubmitJson}</button>
    </form>}
    {busy && <span className="ai-status">{aiDesign.status === 'applying' ? copy.aiStatusApplying : copy.aiStatusValidating}</span>}
    {error && <p className="ai-error" role="alert">{error}</p>}
    <AiPreviewPanel copy={copy} preview={aiDesign.preview} onApply={aiDesign.applyPreview} onCancel={aiDesign.cancelPreview} />
  </div>
}
