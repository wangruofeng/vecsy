import { describe, expect, it } from 'vitest'
import { buildDesignContext } from '../../src/ai/build-design-context.js'
import { ERROR_CODES, DesignActionError } from '../../src/ai/design-action-schema.js'
import { executeDesignActions } from '../../src/ai/execute-design-actions.js'

const markup = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <rect data-editor-id="rect" x="10" y="10" width="20" height="10" fill="#111111" />
  <circle data-editor-id="circle" cx="60" cy="20" r="8" />
  <text data-editor-id="label" x="50" y="80">Old</text>
</svg>`

function envelope(actions, summary = 'Demo edit') {
  return { version: '1.0', intent: 'edit-selection', summary, actions }
}

function run(actions, selectedIds = ['rect', 'circle', 'label']) {
  return executeDesignActions(markup, envelope(actions), buildDesignContext(markup, selectedIds))
}

describe('VDAP action runtime', () => {
  it('applies style and attribute updates only to selected targets', () => {
    const result = run([
      { type: 'set-style', targetIds: ['rect'], properties: { fill: '#6366F1', opacity: 0.8 } },
      { type: 'set-attributes', targetIds: ['rect'], attributes: { rx: 4 } },
    ], ['rect'])

    expect(result.markup).toContain('fill="#6366F1"')
    expect(result.markup).toContain('opacity="0.8"')
    expect(result.markup).toContain('rx="4"')
    expect(result.markup).toContain('data-editor-id="circle"')
  })

  it('compiles move and center resize without direct DOM state', () => {
    const result = run([
      { type: 'move', targetIds: ['rect'], delta: { x: 12, y: -4 } },
      { type: 'resize', targetIds: ['rect'], scale: 1.25, anchor: 'center' },
    ], ['rect'])

    expect(result.markup).toContain('translate(12.00 -4.00)')
    expect(result.markup).toContain('scale(1.2500)')
  })

  it('replaces text safely', () => {
    const result = run([{ type: 'replace-text', targetIds: ['label'], text: 'Vecsy AI' }], ['label'])

    expect(result.markup).toContain('>Vecsy AI</text>')
    expect(result.markup).not.toContain('>Old</text>')
  })

  it('removes and groups selected sibling layers', () => {
    const grouped = run([{ type: 'group', targetIds: ['rect', 'circle'] }], ['rect', 'circle'])
    expect(grouped.markup).toContain('data-editor-id="group-0"')
    expect(grouped.nextSelectedId).toBe('group-0')

    const removed = run([{ type: 'remove', targetIds: ['circle'] }], ['circle'])
    expect(removed.markup).not.toContain('data-editor-id="circle"')
  })

  it('inserts a safe root shape with a Vecsy-generated editor ID', () => {
    const result = run([{
      type: 'insert-shape',
      parentId: null,
      shape: { tag: 'circle', attributes: { cx: 50, cy: 50, r: 12 } },
    }], ['rect'])

    expect(result.markup).toContain('data-editor-id="node-ai-0"')
    expect(result.nextSelectedId).toBe('node-ai-0')
  })

  it('rejects the whole batch before a partial edit when any action is invalid', () => {
    const context = buildDesignContext(markup, ['rect'])
    const invalid = envelope([
      { type: 'set-style', targetIds: ['rect'], properties: { fill: '#6366F1' } },
      { type: 'set-style', targetIds: ['circle'], properties: { fill: '#ffffff' } },
    ])

    expect(() => executeDesignActions(markup, invalid, context)).toThrow(DesignActionError)
    expect(() => executeDesignActions(markup, invalid, context)).toThrow(expect.objectContaining({ code: ERROR_CODES.OUT_OF_SELECTION_TARGET }))
    expect(markup).toContain('fill="#111111"')
  })

  it('rejects unknown fields, unsafe colors, and unknown target IDs', () => {
    const context = buildDesignContext(markup, ['rect'])
    expect(() => executeDesignActions(markup, { ...envelope([{ type: 'remove', targetIds: ['rect'] }]), extra: true }, context)).toThrow(DesignActionError)
    expect(() => executeDesignActions(markup, envelope([{ type: 'set-style', targetIds: ['rect'], properties: { fill: 'url(https://example.com)' } }]), context)).toThrow(DesignActionError)
    expect(() => executeDesignActions(markup, envelope([{ type: 'remove', targetIds: ['missing'] }]), context)).toThrow(expect.objectContaining({ code: ERROR_CODES.UNKNOWN_TARGET }))
  })
})
