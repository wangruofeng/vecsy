const ACTIONS = [
  ['blue', 'aiQuickBlue'],
  ['larger', 'aiQuickLarger'],
  ['rounded', 'aiQuickRounded'],
  ['remove', 'aiQuickRemove'],
]

export default function AiQuickActions({ copy, disabled, onAction }) {
  return <div className="ai-quick-actions">
    {ACTIONS.map(([id, label]) => <button key={id} type="button" onClick={() => onAction(id, copy[label])} disabled={disabled}>{copy[label]}</button>)}
  </div>
}
