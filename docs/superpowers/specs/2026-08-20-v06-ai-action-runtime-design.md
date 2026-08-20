# Vecsy AI v0.6 — Action Runtime 首轮实施规格

## 目标

实现 Vecsy AI v0.6 首个可独立验证的交付切片：用户可通过本地演示 Action 来源或 JSON 调试面板提交选择范围内的 Design Actions；系统负责校验、编译为 SVG 编辑、生成预览、单次应用，并支持单次撤销。

本切片先验证编辑器契约，再接入真实 Provider、Cloudflare API 或 Create Mode。它不会被包装成可理解任意自然语言的 AI 服务。

## 范围

本轮包含：

- VDAP 1.0 `edit-selection` Envelope 校验。
- 全部 8 个 MVP Action：`set-style`、`set-attributes`、`move`、`resize`、`replace-text`、`remove`、`group`、`insert-shape`。
- Selection-aware Design Context、Revision Guard、原子 Dry-run、Preview、Apply、Cancel 与 Undo。
- 明确标示为 Demo Runtime 的本地化 Command Bar 与预置操作。
- 经过同一 Runtime 的可折叠 JSON 调试输入。
- Runtime 与生命周期的 Unit、Contract、Browser 测试。

本轮不包含：

- Cloudflare Functions、Provider 集成、API Key、Rate Limit、埋点、Evals、Create Mode、Generate SVG。
- Whole Document Edit、任意自然语言 Command Router、Variants 或 Chat History。
- 针对父元素插入，或 `center` 之外的 resize anchor。

## 架构

`svgMarkup` 始终是唯一 Canonical Document。Runtime 不拥有第二套文档模型，也不直接写入 React state、storage、history 或网络状态。

```text
Demo action source / JSON debug input
  -> useAiDesign
  -> validateDesignActions
  -> compileDesignActions
  -> executeDesignActions (dry-run)
  -> AiPreviewPanel
  -> commitDocument(previewMarkup) on Apply only
```

新增模块：

- `src/ai/design-action-schema.js`：协议常量、Action 字段、值与 tag 白名单、稳定错误码。
- `src/ai/build-design-context.js`：从 markup、elements、selected IDs 与文档尺寸提取不可变且可序列化的 Context。
- `src/ai/validate-design-actions.js`：严格的 Envelope / Schema / 语义 / Selection 校验；拒绝未知字段。
- `src/ai/compile-design-actions.js`：将已校验的语义 Action 编译为 `editSvgDocument()` transaction，不直接修改 DOM。
- `src/ai/execute-design-actions.js`：无副作用的有序 Dry-run；返回前解析最终 markup。
- `src/ai/quick-actions.js`：预置操作描述与 Demo Envelope；不解析任意用户自然语言。
- `src/hooks/useAiDesign.js`：UI 生命周期状态与 Revision Guard；仅在 Apply 时获得 `commitDocument`。
- `src/components/AiCommandBar.jsx`、`AiQuickActions.jsx`、`AiPreviewPanel.jsx`：保持轻薄的本地化 UI 组件。

`src/main.jsx` 只负责组合 Hook 与组件；所有文档变更仍通过既有 `commitDocument` API。

## VDAP 契约

只接受以下 Envelope：

```json
{
  "version": "1.0",
  "intent": "edit-selection",
  "summary": "Make selected elements blue",
  "actions": []
}
```

在执行前，对完整 Batch 做以下校验：

```text
JSON parse -> version -> strict schema -> target existence -> selection boundary
-> tag/value rules -> compile all -> dry-run -> parse final SVG -> Preview
```

所有 `targetIds` 必须属于当前选择。`group` 至少需要两个已选目标。`insert-shape` 不以既有节点为目标，只能在 root 插入白名单基础形状，`data-editor-id` 由 Vecsy 生成。任何 Action 均不得设置 `id`、`data-editor-id`、`class`、`style`、`href`、`xlink:href`、事件属性、CSS 或外部资源引用。

值规则：

- Style：仅允许 fill、stroke、stroke width、各类 opacity、line cap 与 line join；颜色拒绝 `url(...)`、JavaScript 与外部资源。
- Geometry attributes：按 rect、circle、ellipse、line、polygon/polyline、text 等 tag 应用属性白名单。
- Move：仅接受有限的 SVG user-unit delta。
- Resize：仅接受有限的 `0.1 <= scale <= 10`，且只支持 `anchor: "center"`。
- Replace text：仅允许 text 节点，写入 text content 而非 markup。
- Insert shape：仅允许 rect、circle、ellipse、line、polygon、polyline、text，且应用同样的属性与 Style 安全规则。

Action 按数组顺序执行。任意一步失败均拒绝整个 Batch，并丢弃临时 markup。

## Runtime 与 History

`useEditorDocument` 新增单调递增的 document revision。每次改变 Canonical SVG 的 load、commit、undo、redo 都递增 revision。

开始 Demo 或 JSON 请求时，`useAiDesign` 记录 request ID、base revision、selected IDs、prompt 与当前 markup；并只构建包含文档尺寸、选中元素元数据/属性与安全 Style token 的可序列化 Context。

有效响应会生成 `previewMarkup`、Action 明细与 affected IDs。Preview 不 commit、不持久化、不写入 history。Apply 会先确认当前 revision 与 selection 仍和请求一致，然后仅调用一次：

```js
commitDocument(previewMarkup, {
  nextSelectedId,
  nextSelectedIds,
  nextDirty: true,
})
```

Cancel 只丢弃 Preview。revision 或 selection 不匹配时返回 `DOCUMENT_CHANGED`，禁止 Apply。

本切片画布持续渲染当前 Canonical Document；面板明确描述候选修改。只有 Apply 才修改画布，以免在 Provider 集成前引入第二条 SVG 渲染路径。

## UI

编辑视图底部新增带 `Demo Runtime` 标记的 `AiCommandBar`，包含预置演示操作（蓝色填充、放大、更圆润、删除）与 Prompt 输入。本地来源只解析文档明确支持的 Demo 输入；其他自由输入显示 `PROVIDER_NOT_CONFIGURED`，不会被静默解释。

可折叠 JSON 调试面板接收完整 VDAP Envelope，并通过与 Demo Action 完全相同的 `useAiDesign` 方法执行；它必须显著标记为开发验证界面。

`AiPreviewPanel` 显示 summary、受影响图层数、Action/属性变更与 Cancel/Apply。它提供明确状态：Planning edits、Validating、Preview ready、Applying 与错误状态。所有新增文案按相邻结构写入 `src/app/copy.js` 的 `en`、`zh`、`zh-TW`、`ja`，禁止在 JSX 硬编码。

## 失败处理

使用稳定错误码：`INVALID_RESPONSE`、`UNSUPPORTED_PROTOCOL_VERSION`、`INVALID_ACTION`、`UNKNOWN_TARGET`、`OUT_OF_SELECTION_TARGET`、`DOCUMENT_CHANGED`、`PROVIDER_NOT_CONFIGURED`。UI 将其映射为本地化提示。任何错误均不得改变当前 markup、selection、history、dirty state、recent documents 或已持久化文档。

## 测试与验收条件

Unit 与 Contract 测试覆盖全部 MVP Action、有序 multi-action Batch、未知字段、错误 Envelope、不支持版本、非法值/颜色、未知 target ID、越权 target ID、非法 tag/action 组合与全量原子回滚。测试须断言最终结果可通过 `parseSvg()` 解析，且未选中的元素保持不变。

Browser 测试覆盖：

1. 选择元素，提交 Demo Response，查看 Preview、Apply、Undo；一次 Apply 仅新增一个 history snapshot，Undo 恢复原始 markup。
2. Preview 后 Cancel，markup 与 history 均不变。
3. JSON 调试器与 Demo Response 产生一致的 Preview 行为和错误隔离。
4. 请求创建后发生文档修改时，以 `DOCUMENT_CHANGED` 阻止 Apply。
5. Command Bar 与 Preview 在四种支持语言下均可用。

预期验证顺序为：新增文件的聚焦 `vitest` Unit/Browser 测试、`npm run test`、`npm run build`、`git diff --check`。未来 Provider 集成需要单独进行设计与实现，不得改变本切片的测试契约。

## 后续集成点

下一切片引入 `ai-client.js` 与 `functions/api/ai/edit.js`，仅将 Demo Action 来源替换为 Provider 响应；VDAP 校验、Dry-run、Preview、Revision Guard 与 `commitDocument` 行为保持不变。
