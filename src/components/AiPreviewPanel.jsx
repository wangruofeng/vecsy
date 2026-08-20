function countLabel(copy, count) {
  return copy.aiAffectedLayers.replace('{count}', String(count))
}

export default function AiPreviewPanel({ copy, preview, onApply, onCancel }) {
  if (!preview) return null
  return <div className="ai-preview-panel" role="status">
    <div><strong>{copy.aiPreviewReady}</strong><span>{countLabel(copy, preview.affectedIds.length)}</span></div>
    <p>{preview.summary}</p>
    <div className="ai-preview-actions"><button type="button" className="button button-quiet" onClick={onCancel}>{copy.aiCancel}</button><button type="button" className="button button-accent" onClick={onApply}>{copy.aiApply}</button></div>
  </div>
}
