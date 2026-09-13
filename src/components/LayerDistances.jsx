export default function LayerDistances({ guides }) {
  if (!guides.length) return null
  return <div className="layer-distances" aria-hidden="true">
    <svg width="100%" height="100%">
      {guides.map((guide, index) => {
        const dx = guide.x2 - guide.x1
        const dy = guide.y2 - guide.y1
        const length = Math.hypot(dx, dy)
        const inset = Math.min(4, length / 2)
        const x1 = guide.x1 + (dx / length) * inset
        const y1 = guide.y1 + (dy / length) * inset
        const x2 = guide.x2 - (dx / length) * inset
        const y2 = guide.y2 - (dy / length) * inset
        const horizontal = y1 === y2
        return <g key={index}>
          <line x1={x1} y1={y1} x2={x2} y2={y2} />
          {[{ x: x1, y: y1 }, { x: x2, y: y2 }].map(({ x, y }, end) => <line key={end} x1={x - (horizontal ? 0 : 4)} y1={y - (horizontal ? 4 : 0)} x2={x + (horizontal ? 0 : 4)} y2={y + (horizontal ? 4 : 0)} />)}
        </g>
      })}
    </svg>
    {guides.map(({ x1, y1, x2, y2, distance }, index) => <span key={index} className={`layer-distance-label ${y1 === y2 ? 'is-horizontal' : 'is-vertical'}`} style={{ left: (x1 + x2) / 2, top: (y1 + y2) / 2 }}>{Number(distance.toFixed(1))}</span>)}
  </div>
}
