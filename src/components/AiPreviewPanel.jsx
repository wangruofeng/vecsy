function countLabel(copy, count) {
  return copy.aiAffectedLayers.replace('{count}', String(count))
}

export default function AiPreviewPanel({ copy, preview, onApply, onCancel }) {
  if (!preview) return null
  // 动作合法但序列化结果与当前文档一致（例如改成相同颜色）时，应用不会产生任何变化。
  const noChange = preview.changed === false
  return <div className="ai-preview-panel" role="status">
    <div><strong>{copy.aiPreviewReady}</strong><span>{countLabel(copy, preview.affectedIds.length)}</span></div>
    <p>{preview.summary}</p>
    {noChange && <p className="ai-preview-warning" role="note">{copy.aiNoChange}</p>}
    <div className="ai-preview-actions"><button type="button" className="button button-quiet" onClick={onCancel}>{copy.aiCancel}</button><button type="button" className="button button-accent" onClick={onApply} disabled={noChange}>{copy.aiApply}</button></div>
  </div>
}
